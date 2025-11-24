const admin = require('firebase-admin');
const crypto = require('crypto');
const db = require('../config/database');
const redis = require('../config/redis');

class NotificationService {
  constructor() {
    this.initialized = false;
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
        this.initialized = true;
        console.log('✅ Firebase Admin initialized');
      } else {
        console.log('⚠️  Firebase not configured, notifications disabled');
      }
    } catch (error) {
      console.error('Firebase initialization error:', error.message);
    }
  }

  async sendBusApproachingNotification(userId, busId, stopId, eta) {
    try {
      // Get user's FCM token
      const userResult = await db.query(
        'SELECT fcm_token, phone_number FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].fcm_token) {
        return { success: false, message: 'User token not found' };
      }

      const { fcm_token } = userResult.rows[0];

      // Get bus details
      const busResult = await db.query(
        'SELECT b.*, r.route_name FROM buses b JOIN routes r ON b.route_id = r.id WHERE b.id = $1',
        [busId]
      );

      const bus = busResult.rows[0];

      const notification = {
        title: '🚌 Bus Approaching!',
        body: `${bus.route_name} will arrive in ${eta} minutes`,
        data: {
          type: 'bus_approaching',
          busId,
          stopId,
          eta: eta.toString()
        }
      };

      if (this.initialized) {
        await admin.messaging().send({
          token: fcm_token,
          notification,
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default' } } }
        });
      }

      // Save notification to database
      const notificationId = crypto.randomUUID();
      await db.query(
        `INSERT INTO notifications (id, user_id, type, title, body, data, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'sent')`,
        [notificationId, userId, 'bus_approaching', notification.title, notification.body, JSON.stringify(notification.data)]
      );

      return { success: true };

    } catch (error) {
      console.error('Send notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendRouteDeviationAlert(userId, busId, deviation) {
    const notification = {
      title: '⚠️ Route Deviation',
      body: `Bus has deviated ${deviation}m from planned route`,
      data: { type: 'route_deviation', busId, deviation: deviation.toString() }
    };

    return this.sendNotification(userId, notification);
  }

  async sendCrowdAlert(userId, busId, crowdLevel) {
    if (crowdLevel !== 'High') return;

    const notification = {
      title: '👥 High Crowd Alert',
      body: 'Bus is very crowded. Consider waiting for next bus.',
      data: { type: 'crowd_alert', busId, crowdLevel }
    };

    return this.sendNotification(userId, notification);
  }

  async sendNotification(userId, notification) {
    try {
      const userResult = await db.query(
        'SELECT fcm_token FROM users WHERE id = $1',
        [userId]
      );

      if (!userResult.rows[0]?.fcm_token || !this.initialized) {
        return { success: false };
      }

      await admin.messaging().send({
        token: userResult.rows[0].fcm_token,
        notification,
        android: { priority: 'high' },
      });

      const notificationId = crypto.randomUUID();
      await db.query(
        `INSERT INTO notifications (id, user_id, type, title, body, data, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'sent')`,
        [notificationId, userId, notification.data.type, notification.title, notification.body, JSON.stringify(notification.data)]
      );

      return { success: true };

    } catch (error) {
      console.error('Notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserNotifications(userId, limit = 50) {
    try {
      const result = await db.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  async markAsRead(notificationId) {
    try {
      await db.query(
        `UPDATE notifications SET status = 'read', read_at = datetime('now') WHERE id = $1`,
        [notificationId]
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();


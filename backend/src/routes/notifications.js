const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit } = req.query;

    const notifications = await notificationService.getUserNotifications(
      userId,
      parseInt(limit) || 50
    );

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await notificationService.markAsRead(id);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read'
    });
  }
});

// Register FCM token
router.post('/register-token', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fcm_token } = req.body;

    const db = require('../config/database');
    await db.query(
      'UPDATE users SET fcm_token = $1 WHERE id = $2',
      [fcm_token, userId]
    );

    res.json({
      success: true,
      message: 'FCM token registered'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register token'
    });
  }
});

module.exports = router;


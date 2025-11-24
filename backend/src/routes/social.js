const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Post community report
router.post('/reports', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, routeId, busId, description, latitude, longitude } = req.body;
    const reportId = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO community_reports 
       (id, user_id, type, route_id, bus_id, description, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [reportId, userId, type, routeId, busId, description, latitude, longitude]
    );

    // Broadcast to other users
    const io = req.app.get('io');
    io.emit('community:report', result.rows[0]);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

// Get community reports
router.get('/reports', async (req, res) => {
  try {
    const { routeId, type, limit = 50 } = req.query;

    let query = 'SELECT * FROM community_reports WHERE 1=1';
    const params = [];

    if (routeId) {
      params.push(routeId);
      query += ` AND route_id = $${params.length}`;
    }

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Rate a bus
router.post('/ratings', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { busId, routeId, rating, cleanliness, driverBehavior, comfort, comment } = req.body;
    const ratingId = crypto.randomUUID();

    const result = await db.query(
      `INSERT INTO bus_ratings 
       (id, user_id, bus_id, route_id, rating, cleanliness, driver_behavior, comfort, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [ratingId, userId, busId, routeId, rating, cleanliness, driverBehavior, comfort, comment]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.phone_number, COUNT(cr.id) as reports_count,
             SUM(CASE WHEN cr.verified = true THEN 1 ELSE 0 END) as verified_count
      FROM users u
      LEFT JOIN community_reports cr ON u.id = cr.user_id
      GROUP BY u.id, u.phone_number
      ORDER BY reports_count DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

module.exports = router;


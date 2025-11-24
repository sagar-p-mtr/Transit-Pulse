const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const redis = require('../config/redis');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis (expires in 5 minutes)
    try {
      await redis.setex(`otp:${phoneNumber}`, 300, otp);
    } catch (err) {
      // Redis might not be available, that's OK
      console.log('Redis not available, OTP generated:', otp);
    }

    // TODO: Send OTP via SMS (Twilio)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production!
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const storedOTP = await redis.get(`otp:${phoneNumber}`);

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    await redis.del(`otp:${phoneNumber}`);

    // Check if user exists
    let userResult = await db.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Generate UUID for new user
      const userId = require('crypto').randomUUID();
      
      // Create new user
      const newUser = await db.query(
        `INSERT INTO users (id, phone_number, wallet_balance, created_at)
         VALUES ($1, $2, 0, datetime('now'))
         RETURNING *`,
        [userId, phoneNumber]
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, phoneNumber: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Store refresh token
    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          walletBalance: parseFloat(user.wallet_balance || 0),
        },
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    // Get user info
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, phoneNumber: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    res.json({
      success: true,
      data: {
        accessToken
      }
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Delete refresh token from Redis
        await redis.del(`refresh_token:${decoded.userId}`);
      } catch (error) {
        // Token might be expired, but still allow logout
        console.log('Token verification failed during logout (this is OK)');
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

module.exports = router;


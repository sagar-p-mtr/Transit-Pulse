/**
 * Bus Buddy AI Commute Planner Routes
 */

const express = require('express');
const router = express.Router();
const busBuddyService = require('../services/busBuddyService');

/**
 * Record a trip (to learn user patterns)
 * POST /api/bus-buddy/record-trip
 */
router.post('/record-trip', async (req, res) => {
  try {
    const { userId, routeId, sourceStopId, destinationStopId, departureTime, duration } = req.body;

    if (!userId || !routeId || !sourceStopId || !destinationStopId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const result = await busBuddyService.recordTrip(userId, {
      routeId,
      sourceStopId,
      destinationStopId,
      departureTime,
      duration: duration || 30
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record trip'
    });
  }
});

/**
 * Get user's commute patterns
 * GET /api/bus-buddy/patterns/:userId
 */
router.get('/patterns/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format. Please use a valid UUID.'
      });
    }
    
    const patterns = await busBuddyService.getUserPatterns(userId);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patterns',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Generate smart suggestions for user
 * GET /api/bus-buddy/suggestions/:userId
 */
router.get('/suggestions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format. Please use a valid UUID.'
      });
    }
    
    const suggestions = await busBuddyService.generateSmartSuggestions(userId);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get user's suggestion history
 * GET /api/bus-buddy/suggestions-history/:userId
 */
router.get('/suggestions-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const suggestions = await busBuddyService.getUserSuggestions(userId, limit);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

/**
 * Update user preferences
 * PUT /api/bus-buddy/preferences/:userId
 */
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const result = await busBuddyService.updateUserPreferences(userId, preferences);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

/**
 * Mark suggestion as read
 * PUT /api/bus-buddy/suggestions/:suggestionId/read
 */
router.put('/suggestions/:suggestionId/read', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const result = await busBuddyService.markSuggestionAsRead(suggestionId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error marking suggestion as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark suggestion as read'
    });
  }
});

/**
 * Generate AI-enhanced suggestion (NEW!)
 * GET /api/bus-buddy/ai-suggestion/:userId
 */
router.get('/ai-suggestion/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { question } = req.query;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format. Please use a valid UUID.'
      });
    }

    const aiSuggestion = await busBuddyService.generateAIEnhancedSuggestion(userId, question);

    res.json({
      success: true,
      data: aiSuggestion
    });
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI suggestion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Chat with AI about commute (NEW!)
 * POST /api/bus-buddy/ai-chat/:userId
 */
router.post('/ai-chat/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format. Please use a valid UUID.'
      });
    }

    const aiResponse = await busBuddyService.chatWithAI(userId, message);

    res.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to chat with AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;


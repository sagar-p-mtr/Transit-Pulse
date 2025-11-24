/**
 * Crowd Prediction Engine Routes
 */

const express = require('express');
const router = express.Router();
const crowdPredictionService = require('../services/crowdPredictionService');

/**
 * Record crowd data (for ML training)
 * POST /api/crowd/record
 */
router.post('/record', async (req, res) => {
  try {
    const { busId, routeId, stopId, crowdPercentage, actualOccupancy, busCapacity, eventNearby } = req.body;

    if (!busId || !routeId || crowdPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const result = await crowdPredictionService.recordCrowdData(busId, {
      routeId,
      stopId,
      crowdPercentage,
      actualOccupancy,
      busCapacity,
      eventNearby
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording crowd data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record crowd data'
    });
  }
});

/**
 * Predict crowd for specific time
 * GET /api/crowd/predict
 */
router.get('/predict', async (req, res) => {
  try {
    const { routeId, stopId, time } = req.query;

    if (!routeId) {
      return res.status(400).json({
        success: false,
        message: 'routeId is required'
      });
    }

    const predictionTime = time ? new Date(time) : new Date();
    const prediction = await crowdPredictionService.predictCrowd(
      routeId,
      stopId || null,
      predictionTime
    );

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Error predicting crowd:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict crowd'
    });
  }
});

/**
 * Get crowd forecast for next 3 hours
 * GET /api/crowd/forecast/:routeId
 */
router.get('/forecast/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { stopId } = req.query;
    
    const forecast = await crowdPredictionService.getCrowdForecast(routeId, stopId || null);

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error getting crowd forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crowd forecast'
    });
  }
});

/**
 * Get historical crowd trends
 * GET /api/crowd/trends/:routeId
 */
router.get('/trends/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const days = parseInt(req.query.days) || 7;
    
    const trends = await crowdPredictionService.getCrowdTrends(routeId, days);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error getting crowd trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crowd trends'
    });
  }
});

/**
 * Add event that affects crowd
 * POST /api/crowd/events
 */
router.post('/events', async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData.eventName || !eventData.startTime || !eventData.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required event fields'
      });
    }

    const event = await crowdPredictionService.addCrowdEvent(eventData);

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add event'
    });
  }
});

/**
 * Get model accuracy statistics
 * GET /api/crowd/model-accuracy
 */
router.get('/model-accuracy', async (req, res) => {
  try {
    const accuracy = await crowdPredictionService.getModelAccuracy();

    res.json({
      success: true,
      data: accuracy
    });
  } catch (error) {
    console.error('Error getting model accuracy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get model accuracy'
    });
  }
});

module.exports = router;


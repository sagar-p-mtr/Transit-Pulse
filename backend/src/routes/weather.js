/**
 * Weather-Aware Routes API
 */

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

/**
 * Get current weather for a city
 * GET /api/weather/current/:city
 */
router.get('/current/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const weather = await weatherService.fetchCurrentWeather(city);

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get weather forecast for a city
 * GET /api/weather/forecast/:city
 */
router.get('/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const forecast = await weatherService.getWeatherForecast(city);

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get weather-aware route recommendations
 * GET /api/weather/routes
 */
router.get('/routes', async (req, res) => {
  try {
    const { sourceStopId, destinationStopId, city } = req.query;

    if (!sourceStopId || !destinationStopId || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: sourceStopId, destinationStopId, city'
      });
    }

    const recommendations = await weatherService.getWeatherAwareRoutes(
      sourceStopId,
      destinationStopId,
      city
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting weather routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather-aware routes'
    });
  }
});

/**
 * Report flood/waterlogging
 * POST /api/weather/flood-report
 */
router.post('/flood-report', async (req, res) => {
  try {
    const { userId, stopId, latitude, longitude, severity, description } = req.body;

    if (!userId || !latitude || !longitude || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const report = await weatherService.reportFlood({
      userId,
      stopId,
      latitude,
      longitude,
      severity,
      description
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error reporting flood:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report flood'
    });
  }
});

/**
 * Get active flood reports
 * GET /api/weather/flood-reports
 */
router.get('/flood-reports', async (req, res) => {
  try {
    const { city } = req.query;
    const reports = await weatherService.getActiveFloodReports(city);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching flood reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flood reports'
    });
  }
});

/**
 * Upvote a flood report
 * PUT /api/weather/flood-reports/:reportId/upvote
 */
router.put('/flood-reports/:reportId/upvote', async (req, res) => {
  try {
    const { reportId } = req.params;
    const result = await weatherService.upvoteFloodReport(reportId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error upvoting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upvote report'
    });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');

// Predict bus ETA
router.post('/predict-eta', async (req, res) => {
  try {
    const { busId, stopId } = req.body;

    if (!busId || !stopId) {
      return res.status(400).json({
        success: false,
        message: 'busId and stopId are required'
      });
    }

    const prediction = await mlService.predictETA(busId, stopId);

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('ETA prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict ETA',
      error: error.message
    });
  }
});

// Predict crowd level
router.post('/predict-crowd', async (req, res) => {
  try {
    const { routeId, stopId, time } = req.body;

    const prediction = await mlService.predictCrowd(
      routeId, 
      stopId, 
      time || new Date().toTimeString().slice(0, 5)
    );

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to predict crowd'
    });
  }
});

module.exports = router;


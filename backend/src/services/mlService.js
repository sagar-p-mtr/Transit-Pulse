const axios = require('axios');
const db = require('../config/database');

class MLService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async predictETA(busId, stopId) {
    try {
      const busResult = await db.query(
        'SELECT * FROM buses WHERE id = $1',
        [busId]
      );

      if (busResult.rows.length === 0) {
        throw new Error('Bus not found');
      }

      const bus = busResult.rows[0];

      // Try ML service first
      try {
        const response = await axios.post(
          `${this.mlServiceUrl}/predict-eta`,
          {
            bus_id: busId,
            stop_id: stopId,
            current_lat: parseFloat(bus.current_lat),
            current_lng: parseFloat(bus.current_lng),
            current_speed: parseFloat(bus.speed) || 25,
            distance_to_stop: 3.5, // Calculate actual distance
            traffic_level: 'medium',
            weather_condition: 'Clear',
            temperature: 25.0
          },
          { timeout: 3000 }
        );

        return {
          eta_minutes: response.data.eta_minutes,
          confidence: response.data.confidence,
          arrival_time: response.data.arrival_time,
          method: 'ml_model'
        };

      } catch (mlError) {
        console.log('ML service unavailable, using fallback');
        return this.fallbackPrediction(bus, stopId);
      }

    } catch (error) {
      console.error('ETA prediction error:', error);
      throw error;
    }
  }

  fallbackPrediction(bus, stopId) {
    const avgSpeed = parseFloat(bus.speed) || 25;
    const distance = Math.random() * 5; // Mock distance
    const etaMinutes = (distance / avgSpeed) * 60;

    const hour = new Date().getHours();
    let buffer = 1.0;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
      buffer = 1.3;
    }

    return {
      eta_minutes: Math.round(etaMinutes * buffer),
      confidence: 0.65,
      method: 'rule_based'
    };
  }

  async predictCrowd(routeId, stopId, time) {
    try {
      const result = await db.query(
        `SELECT AVG(crowd_percentage) as avg_crowd
         FROM bus_history
         WHERE route_id = $1 
           AND stop_id = $2
           AND CAST(strftime('%H', timestamp) AS INTEGER) = $3
           AND timestamp > datetime('now', '-30 days')`,
        [routeId, stopId, parseInt(time.split(':')[0])]
      );

      const avgCrowd = result.rows[0]?.avg_crowd || 50;

      return {
        crowd_level: avgCrowd < 40 ? 'Low' : avgCrowd < 70 ? 'Medium' : 'High',
        crowd_percentage: Math.round(avgCrowd),
        confidence: 0.75
      };

    } catch (error) {
      console.error('Crowd prediction error:', error);
      return {
        crowd_level: 'Medium',
        crowd_percentage: 50,
        confidence: 0.5
      };
    }
  }
}

module.exports = new MLService();


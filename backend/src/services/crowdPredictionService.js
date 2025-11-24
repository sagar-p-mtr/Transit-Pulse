/**
 * Crowd Prediction Engine Service
 * Uses ML to predict bus crowding based on historical patterns
 */

const db = require('../config/database');

class CrowdPredictionService {
  constructor() {
    this.MODEL_VERSION = '1.0.0';
  }

  /**
   * Record current crowd data for ML training
   */
  async recordCrowdData(busId, crowdData) {
    try {
      const { routeId, stopId, crowdPercentage, actualOccupancy, busCapacity, eventNearby } = crowdData;
      
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = await this.isHoliday(now);
      const isRushHour = await this.isRushHour(routeId, hour, dayOfWeek);

      // Get current weather
      const weatherResult = await db.query(
        `SELECT condition, temperature FROM weather_data 
         WHERE timestamp > datetime('now', '-30 minutes')
         ORDER BY timestamp DESC LIMIT 1`
      );
      
      const weather = weatherResult.rows[0] || { condition: 'Clear', temperature: 25 };

      await db.query(
        `INSERT INTO crowd_history 
         (bus_id, route_id, stop_id, crowd_percentage, actual_occupancy, bus_capacity,
          hour, day_of_week, is_weekend, is_holiday, is_rush_hour, 
          weather_condition, temperature, event_nearby, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, datetime('now'))`,
        [
          busId, routeId, stopId, crowdPercentage, actualOccupancy, busCapacity,
          hour, dayOfWeek, isWeekend, isHoliday, isRushHour,
          weather.condition, weather.temperature, eventNearby || false
        ]
      );

      return { success: true, message: 'Crowd data recorded' };
    } catch (error) {
      console.error('Error recording crowd data:', error);
      throw error;
    }
  }

  /**
   * Predict crowd for a specific bus/route/time
   */
  async predictCrowd(routeId, stopId, predictionTime) {
    try {
      const targetDate = new Date(predictionTime);
      const hour = targetDate.getHours();
      const dayOfWeek = targetDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isRushHour = await this.isRushHour(routeId, hour, dayOfWeek);

      // Get historical data for similar conditions
      const historicalData = await db.query(
        `SELECT AVG(crowd_percentage) as avg_crowd, 
                COUNT(*) as data_points
         FROM crowd_history
         WHERE route_id = $1
         AND (stop_id = $2 OR $2 IS NULL)
         AND hour = $3
         AND day_of_week = $4
         AND is_weekend = $5
         AND timestamp > datetime('now', '-60 days')`,
        [routeId, stopId, hour, dayOfWeek, isWeekend]
      );

      const stats = historicalData.rows[0];
      
      if (!stats || stats.data_points === 0 || stats.avg_crowd === null) {
        // No historical data, use heuristics
        return this.predictUsingHeuristics(routeId, hour, dayOfWeek, isWeekend, isRushHour);
      }

      let predictedCrowd = Math.round(stats.avg_crowd);
      
      // Apply adjustments
      
      // 1. Rush hour adjustment
      if (isRushHour) {
        predictedCrowd = Math.min(100, predictedCrowd * 1.3);
      }

      // 2. Check for events nearby
      const events = await this.getUpcomingEvents(predictionTime);
      if (events.length > 0) {
        const highImpactEvent = events.find(e => e.impact_level === 'high' || e.impact_level === 'extreme');
        if (highImpactEvent) {
          predictedCrowd = Math.min(100, predictedCrowd * 1.5);
        }
      }

      // 3. Weather adjustment
      const weatherForecast = await this.getWeatherAtTime(predictionTime);
      if (weatherForecast && weatherForecast.condition === 'Rain') {
        predictedCrowd = Math.min(100, predictedCrowd * 1.4); // Rain increases bus usage
      }

      // Calculate confidence based on data availability
      const confidence = this.calculateConfidence(stats.data_points, stats.stddev);

      // Save prediction
      await this.savePrediction({
        routeId,
        stopId,
        predictedCrowdPercentage: Math.round(predictedCrowd),
        predictionTime: targetDate,
        confidenceScore: confidence
      });

      return {
        predictedCrowdPercentage: Math.round(predictedCrowd),
        crowdLevel: this.getCrowdLevel(predictedCrowd),
        confidence,
        dataPoints: stats.data_points,
        factors: {
          isRushHour,
          hasEvents: events.length > 0,
          weatherImpact: weatherForecast?.condition === 'Rain'
        }
      };
    } catch (error) {
      console.error('Error predicting crowd:', error);
      throw error;
    }
  }

  /**
   * Predict using heuristics when no historical data
   */
  predictUsingHeuristics(routeId, hour, dayOfWeek, isWeekend, isRushHour) {
    let baseCrowd = 40; // Default moderate crowd

    // Rush hour heuristic
    if (isRushHour) {
      baseCrowd = 75;
    }

    // Weekend heuristic
    if (isWeekend) {
      baseCrowd *= 0.7; // 30% less crowded on weekends
    }

    // Time of day heuristic
    if (hour >= 0 && hour < 6) {
      baseCrowd = 15; // Very low at night
    } else if (hour >= 22) {
      baseCrowd = 25; // Low late night
    } else if (hour >= 10 && hour < 17 && !isRushHour) {
      baseCrowd = 50; // Moderate mid-day
    }

    return {
      predictedCrowdPercentage: Math.round(baseCrowd),
      crowdLevel: this.getCrowdLevel(baseCrowd),
      confidence: 0.50, // Low confidence without data
      dataPoints: 0,
      factors: {
        isRushHour,
        hasEvents: false,
        weatherImpact: false
      }
    };
  }

  /**
   * Get crowd predictions for next 3 hours
   */
  async getCrowdForecast(routeId, stopId = null) {
    try {
      const forecasts = [];
      const now = new Date();

      // Predict for next 3 hours in 30-min intervals
      for (let i = 0; i < 6; i++) {
        const predictionTime = new Date(now.getTime() + (i * 30 * 60 * 1000));
        const prediction = await this.predictCrowd(routeId, stopId, predictionTime);
        
        forecasts.push({
          time: predictionTime,
          ...prediction
        });
      }

      return forecasts;
    } catch (error) {
      console.error('Error getting crowd forecast:', error);
      throw error;
    }
  }

  /**
   * Check if date is a holiday
   */
  async isHoliday(date) {
    // Simplified - in production, use a holidays API or database
    const month = date.getMonth();
    const day = date.getDate();
    
    // Common Indian holidays (simplified)
    const holidays = [
      { month: 0, day: 26 },  // Republic Day
      { month: 7, day: 15 },  // Independence Day
      { month: 9, day: 2 },   // Gandhi Jayanti
      { month: 10, day: 1 },  // Diwali (approximate)
    ];

    return holidays.some(h => h.month === month && h.day === day);
  }

  /**
   * Check if time is rush hour
   */
  async isRushHour(routeId, hour, dayOfWeek) {
    try {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayType = isWeekend ? 'weekend' : 'weekday';
      
      const result = await db.query(
        `SELECT * FROM rush_hour_config 
         WHERE (route_id = $1 OR route_id IS NULL)
         AND day_type = $2
         LIMIT 1`,
        [routeId, dayType]
      );

      if (result.rows.length === 0) return false;

      const config = result.rows[0];
      const timeStr = `${hour.toString().padStart(2, '0')}:00:00`;
      
      return (
        (timeStr >= config.morning_rush_start && timeStr <= config.morning_rush_end) ||
        (timeStr >= config.evening_rush_start && timeStr <= config.evening_rush_end)
      );
    } catch (error) {
      console.error('Error checking rush hour:', error);
      return false;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(time) {
    try {
      const result = await db.query(
        `SELECT * FROM crowd_events
         WHERE start_time <= $1
         AND end_time >= $1
         ORDER BY impact_level DESC`,
        [time]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  /**
   * Get weather at specific time (from forecast)
   */
  async getWeatherAtTime(time) {
    try {
      const result = await db.query(
        `SELECT * FROM weather_data
         WHERE forecast_time IS NOT NULL
         AND forecast_time >= $1
         ORDER BY ABS((julianday(forecast_time) - julianday($1)) * 86400)
         LIMIT 1`,
        [time]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(dataPoints, stddev) {
    // More data points = higher confidence
    const dataScore = Math.min(dataPoints / 100, 1);
    
    // Lower standard deviation = higher confidence
    const variabilityScore = stddev ? Math.max(0, 1 - (stddev / 50)) : 0.5;
    
    return Number((dataScore * 0.6 + variabilityScore * 0.4).toFixed(2));
  }

  /**
   * Get crowd level from percentage
   */
  getCrowdLevel(percentage) {
    if (percentage < 40) return 'Low';
    if (percentage < 70) return 'Medium';
    return 'High';
  }

  /**
   * Save prediction to database
   */
  async savePrediction(predictionData) {
    try {
      const { routeId, stopId, predictedCrowdPercentage, predictionTime, confidenceScore } = predictionData;

      await db.query(
        `INSERT INTO crowd_predictions 
         (route_id, stop_id, predicted_crowd_percentage, prediction_time, confidence_score, model_version)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [routeId, stopId, predictedCrowdPercentage, predictionTime, confidenceScore, this.MODEL_VERSION]
      );
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  }

  /**
   * Add event that may affect crowd
   */
  async addCrowdEvent(eventData) {
    try {
      const {
        eventName,
        eventType,
        venueName,
        latitude,
        longitude,
        expectedAttendance,
        startTime,
        endTime,
        affectedRoutes,
        impactLevel
      } = eventData;

      const result = await db.query(
        `INSERT INTO crowd_events 
         (event_name, event_type, venue_name, latitude, longitude, 
          expected_attendance, start_time, end_time, affected_routes, impact_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          eventName, eventType, venueName, latitude, longitude,
          expectedAttendance, startTime, endTime, 
          JSON.stringify(affectedRoutes), impactLevel
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding crowd event:', error);
      throw error;
    }
  }

  /**
   * Get historical crowd trends for analytics
   */
  async getCrowdTrends(routeId, days = 7) {
    try {
      const result = await db.query(
        `SELECT 
           date(timestamp) as date,
           hour,
           AVG(crowd_percentage) as avg_crowd,
           MAX(crowd_percentage) as peak_crowd,
           MIN(crowd_percentage) as min_crowd
         FROM crowd_history
         WHERE route_id = $1
         AND timestamp > datetime('now', '-${days} days')
         GROUP BY date(timestamp), hour
         ORDER BY date, hour`,
        [routeId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching crowd trends:', error);
      throw error;
    }
  }

  /**
   * Get model accuracy statistics
   */
  async getModelAccuracy() {
    try {
      const result = await db.query(
        `SELECT 
           AVG(ABS(error_percentage)) as mean_absolute_error,
           COUNT(*) as total_predictions
         FROM crowd_prediction_accuracy
         WHERE timestamp > datetime('now', '-30 days')`
      );

      const stats = result.rows[0];
      
      return {
        meanAbsoluteError: stats.mean_absolute_error || 0,
        totalPredictions: stats.total_predictions || 0,
        accuracy: stats.mean_absolute_error ? 
          Number((100 - stats.mean_absolute_error).toFixed(2)) : 0
      };
    } catch (error) {
      console.error('Error calculating model accuracy:', error);
      return {
        meanAbsoluteError: 0,
        totalPredictions: 0,
        accuracy: 0
      };
    }
  }
}

module.exports = new CrowdPredictionService();


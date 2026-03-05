/**
 * Bus Buddy AI Commute Planner Service
 * Learns user patterns and provides smart commute suggestions
 */

const crypto = require('crypto');
const db = require('../config/database');
const axios = require('axios');
const aiEnhancedBusBuddy = require('./aiEnhancedBusBuddy');

class BusBuddyService {
  constructor() {
    this.LEARNING_THRESHOLD = 3; // Need 3+ trips to establish pattern
  }

  /**
   * Record a user's trip to learn their commute patterns
   */
  async recordTrip(userId, tripData) {
    const { routeId, sourceStopId, destinationStopId, departureTime, duration } = tripData;
    
    try {
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Check if this pattern exists
      const existingPattern = await db.query(
        `SELECT * FROM user_commute_patterns 
         WHERE user_id = $1 AND route_id = $2 
         AND source_stop_id = $3 AND destination_stop_id = $4`,
        [userId, routeId, sourceStopId, destinationStopId]
      );

      if (existingPattern.rows.length > 0) {
        // Update existing pattern
        const pattern = existingPattern.rows[0];
        const updatedDays = [...new Set([...(pattern.typical_days || []), dayOfWeek])];
        
        await db.query(
          `UPDATE user_commute_patterns 
           SET frequency = frequency + 1,
               typical_days = $1,
               average_duration = $2,
               last_traveled = datetime('now'),
               updated_at = datetime('now')
           WHERE id = $3`,
          [JSON.stringify(updatedDays), duration, pattern.id]
        );
      } else {
        // Create new pattern
        await db.query(
          `INSERT INTO user_commute_patterns 
           (user_id, route_id, source_stop_id, destination_stop_id, 
            typical_departure_time, typical_days, frequency, average_duration, last_traveled)
           VALUES ($1, $2, $3, $4, $5, $6, 1, $7, datetime('now'))`,
          [userId, routeId, sourceStopId, destinationStopId, 
           departureTime, JSON.stringify([dayOfWeek]), duration]
        );
      }

      return { success: true, message: 'Trip recorded successfully' };
    } catch (error) {
      console.error('Error recording trip:', error);
      throw error;
    }
  }

  /**
   * Get user's commute patterns
   */
  async getUserPatterns(userId) {
    try {
      const result = await db.query(
        `SELECT ucp.*, r.route_name, r.route_number, r.source, r.destination
         FROM user_commute_patterns ucp
         LEFT JOIN routes r ON ucp.route_id = r.id
         WHERE ucp.user_id = $1
         ORDER BY ucp.frequency DESC, ucp.last_traveled DESC
         LIMIT 10`,
        [userId]
      );

      return result.rows.map(row => ({
        ...row,
        typical_days: row.typical_days || []
      }));
    } catch (error) {
      console.error('Error fetching user patterns:', error);
      throw error;
    }
  }

  /**
   * Generate smart suggestions based on user patterns
   */
  async generateSmartSuggestions(userId) {
    try {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5);
      
      // Get user's patterns for today
      const patterns = await this.getUserPatterns(userId);
      const todayPatterns = patterns.filter(p => 
        (p.typical_days || []).includes(currentDay) && p.frequency >= this.LEARNING_THRESHOLD
      );

      const suggestions = [];

      for (const pattern of todayPatterns) {
        // Calculate when user should leave
        const departureTime = new Date(now);
        const [hours, minutes] = pattern.typical_departure_time.split(':');
        departureTime.setHours(hours, minutes, 0);

        // Get user preferences
        const prefsResult = await db.query(
          'SELECT * FROM user_commute_preferences WHERE user_id = $1',
          [userId]
        );
        const prefs = prefsResult.rows[0] || { notification_lead_time: 15 };

        // Calculate notification time
        const notificationTime = new Date(departureTime.getTime() - (prefs.notification_lead_time * 60000));

        if (now >= notificationTime && now < departureTime) {
          // Time to suggest leaving
          const busETA = await this.getNextBusETA(pattern.route_id, pattern.source_stop_id);
          
          suggestions.push({
            type: 'leave_now',
            title: 'Time to Leave!',
            message: `Leave now to catch ${pattern.route_number} to ${pattern.destination}. Next bus in ${busETA} mins.`,
            routeId: pattern.route_id,
            suggestedDepartureTime: departureTime,
            confidenceScore: this.calculateConfidence(pattern),
            metadata: {
              busETA,
              routeName: pattern.route_name,
              routeNumber: pattern.route_number
            }
          });
        }
      }

      // Check for delays and suggest alternatives
      const delayAlerts = await this.checkForDelays(todayPatterns);
      suggestions.push(...delayAlerts);

      // Save suggestions to database
      for (const suggestion of suggestions) {
        await this.saveSuggestion(userId, suggestion);
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  /**
   * Get next bus ETA
   */
  async getNextBusETA(routeId, stopId) {
    try {
      // Get active buses on this route
      const result = await db.query(
        'SELECT * FROM buses WHERE route_id = $1 AND is_active = true',
        [routeId]
      );

      if (result.rows.length === 0) return 15; // Default 15 mins

      // Simplified ETA calculation (in real scenario, use geo distance)
      return Math.floor(Math.random() * 10) + 5; // 5-15 mins
    } catch (error) {
      console.error('Error calculating ETA:', error);
      return 15;
    }
  }

  /**
   * Check for delays on user's typical routes
   */
  async checkForDelays(patterns) {
    const alerts = [];
    
    for (const pattern of patterns) {
      // Check community reports for delays
      const reports = await db.query(
        `SELECT * FROM community_reports 
         WHERE route_id = $1 
         AND type IN ('delay', 'breakdown', 'traffic')
         AND created_at > datetime('now', '-30 minutes')
         ORDER BY upvotes DESC
         LIMIT 1`,
        [pattern.route_id]
      );

      if (reports.rows.length > 0) {
        const report = reports.rows[0];
        alerts.push({
          type: 'delay_alert',
          title: '⚠️ Delay Alert',
          message: `${pattern.route_number} is delayed due to ${report.type}. Consider alternate route.`,
          routeId: pattern.route_id,
          confidenceScore: 0.85,
          metadata: {
            reportType: report.type,
            description: report.description
          }
        });
      }
    }

    return alerts;
  }

  /**
   * Calculate confidence score for a pattern
   */
  calculateConfidence(pattern) {
    // More frequency = higher confidence
    const frequencyScore = Math.min(pattern.frequency / 20, 1); // Max at 20 trips
    
    // Recent activity = higher confidence
    const daysSinceLastTravel = (Date.now() - new Date(pattern.last_traveled)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSinceLastTravel / 30)); // Decay over 30 days
    
    // Number of days = higher confidence
    const daysScore = Math.min((pattern.typical_days || []).length / 5, 1);
    
    return Number(((frequencyScore * 0.5 + recencyScore * 0.3 + daysScore * 0.2)).toFixed(2));
  }

  /**
   * Save suggestion to database
   */
  async saveSuggestion(userId, suggestion) {
    try {
      await db.query(
        `INSERT INTO commute_suggestions 
         (user_id, route_id, suggestion_type, title, message, 
          suggested_departure_time, confidence_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          suggestion.routeId,
          suggestion.type,
          suggestion.title,
          suggestion.message,
          suggestion.suggestedDepartureTime || null,
          suggestion.confidenceScore
        ]
      );
    } catch (error) {
      console.error('Error saving suggestion:', error);
    }
  }

  /**
   * Get user's suggestions
   */
  async getUserSuggestions(userId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT cs.*, r.route_name, r.route_number
         FROM commute_suggestions cs
         LEFT JOIN routes r ON cs.route_id = r.id
         WHERE cs.user_id = $1
         ORDER BY cs.created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId, preferences) {
    try {
      const {
        preferAC = false,
        preferLessCrowded = true,
        preferFasterRoute = true,
        maxWalkingDistance = 500,
        notificationLeadTime = 15,
        autoSuggestEnabled = true
      } = preferences;

      // Check if user preferences exist
      const existing = await db.query(
        'SELECT id FROM user_commute_preferences WHERE user_id = $1',
        [userId]
      );

      if (existing.rows.length > 0) {
        // Update existing preferences
        await db.query(
          `UPDATE user_commute_preferences SET
             prefer_ac = $1,
             prefer_less_crowded = $2,
             prefer_faster_route = $3,
             max_walking_distance = $4,
             notification_lead_time = $5,
             auto_suggest_enabled = $6,
             updated_at = datetime('now')
           WHERE user_id = $7`,
          [preferAC, preferLessCrowded, preferFasterRoute, 
           maxWalkingDistance, notificationLeadTime, autoSuggestEnabled, userId]
        );
      } else {
        // Insert new preferences
        const prefId = crypto.randomUUID();
        await db.query(
          `INSERT INTO user_commute_preferences 
           (id, user_id, prefer_ac, prefer_less_crowded, prefer_faster_route, 
            max_walking_distance, notification_lead_time, auto_suggest_enabled)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [prefId, userId, preferAC, preferLessCrowded, preferFasterRoute, 
           maxWalkingDistance, notificationLeadTime, autoSuggestEnabled]
        );
      }

      return { success: true, message: 'Preferences updated successfully' };
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Mark suggestion as sent/read
   */
  async markSuggestionAsRead(suggestionId) {
    try {
      await db.query(
        'UPDATE commute_suggestions SET is_read = true WHERE id = $1',
        [suggestionId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error marking suggestion as read:', error);
      throw error;
    }
  }

  /**
   * Generate AI-enhanced suggestion (NEW!)
   */
  async generateAIEnhancedSuggestion(userId, userQuestion = null) {
    try {
      // Get all the context data
      const patterns = await this.getUserPatterns(userId);
      
      // Get user preferences
      const prefsResult = await db.query(
        'SELECT * FROM user_commute_preferences WHERE user_id = $1',
        [userId]
      );
      const preferences = prefsResult.rows[0] || {};

      // Build context for AI
      const context = {
        userPatterns: patterns,
        currentWeather: null, // Will be fetched if weather service available
        crowdPrediction: null, // Will be fetched if crowd service available
        userPreferences: preferences,
        currentTime: new Date(),
        userQuestion
      };

      // Try to get weather data
      try {
        const weatherService = require('./weatherService');
        const weather = await weatherService.fetchCurrentWeather('Bangalore');
        context.currentWeather = weather;
      } catch (err) {
        console.log('Weather data not available');
      }

      // Try to get crowd prediction for user's main route
      if (patterns.length > 0) {
        try {
          const crowdService = require('./crowdPredictionService');
          const mainRoute = patterns[0];
          const crowd = await crowdService.predictCrowd(mainRoute.route_id, null, new Date());
          context.crowdPrediction = crowd;
        } catch (err) {
          console.log('Crowd prediction not available');
        }
      }

      // Generate AI suggestion
      const aiResponse = await aiEnhancedBusBuddy.generateAISuggestion(context);

      if (aiResponse.success) {
        return {
          success: true,
          suggestion: aiResponse.aiSuggestion,
          source: 'ai',
          model: 'gpt-oss-20b',
          confidence: 0.95, // AI-generated have high confidence
          context: {
            hasWeather: !!context.currentWeather,
            hasCrowd: !!context.crowdPrediction,
            patternCount: patterns.length
          }
        };
      } else {
        // Fallback to rule-based suggestions
        const regularSuggestions = await this.generateSmartSuggestions(userId);
        return {
          success: true,
          suggestion: regularSuggestions[0]?.message || 'No suggestions available',
          source: 'rules',
          fallback: true
        };
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      throw error;
    }
  }

  /**
   * Chat with AI about commute
   */
  async chatWithAI(userId, message) {
    try {
      const patterns = await this.getUserPatterns(userId);
      const prefsResult = await db.query(
        'SELECT * FROM user_commute_preferences WHERE user_id = $1',
        [userId]
      );
      const preferences = prefsResult.rows[0] || {};

      const context = {
        userPatterns: patterns,
        userPreferences: preferences,
        currentTime: new Date()
      };

      // Try to add weather and crowd data
      try {
        const weatherService = require('./weatherService');
        context.currentWeather = await weatherService.fetchCurrentWeather('Bangalore');
      } catch (err) {}

      if (patterns.length > 0) {
        try {
          const crowdService = require('./crowdPredictionService');
          const crowd = await crowdService.predictCrowd(patterns[0].route_id, null, new Date());
          context.crowdPrediction = crowd;
        } catch (err) {}
      }

      return await aiEnhancedBusBuddy.chatWithAI(message, context);
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  }
}

module.exports = new BusBuddyService();


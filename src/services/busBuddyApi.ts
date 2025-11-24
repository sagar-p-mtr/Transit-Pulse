/**
 * Bus Buddy AI Commute Planner API Service
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CommutePattern {
  id: string;
  userId: string;
  routeId: string;
  sourceStopId: string;
  destinationStopId: string;
  typicalDepartureTime: string;
  typicalDays: string[];
  frequency: number;
  averageDuration: number;
  lastTraveled: string;
  routeName?: string;
  routeNumber?: string;
}

export interface CommuteSuggestion {
  id: string;
  type: 'leave_now' | 'alternate_route' | 'delay_alert' | 'early_departure' | 'weather_alert';
  title: string;
  message: string;
  routeId: string;
  suggestedDepartureTime?: string;
  confidenceScore: number;
  metadata?: any;
  createdAt: string;
}

export interface UserPreferences {
  preferAC?: boolean;
  preferLessCrowded?: boolean;
  preferFasterRoute?: boolean;
  maxWalkingDistance?: number;
  notificationLeadTime?: number;
  autoSuggestEnabled?: boolean;
}

class BusBuddyAPI {
  /**
   * Record a trip to learn user patterns
   */
  async recordTrip(data: {
    userId: string;
    routeId: string;
    sourceStopId: string;
    destinationStopId: string;
    departureTime: string;
    duration?: number;
  }) {
    const response = await axios.post(`${API_BASE_URL}/bus-buddy/record-trip`, data);
    return response.data;
  }

  /**
   * Get user's commute patterns
   */
  async getUserPatterns(userId: string): Promise<CommutePattern[]> {
    const response = await axios.get(`${API_BASE_URL}/bus-buddy/patterns/${userId}`);
    return response.data.data;
  }

  /**
   * Generate smart suggestions for user
   */
  async generateSuggestions(userId: string): Promise<CommuteSuggestion[]> {
    const response = await axios.get(`${API_BASE_URL}/bus-buddy/suggestions/${userId}`);
    return response.data.data;
  }

  /**
   * Get user's suggestion history
   */
  async getSuggestionHistory(userId: string, limit: number = 10): Promise<CommuteSuggestion[]> {
    const response = await axios.get(`${API_BASE_URL}/bus-buddy/suggestions-history/${userId}`, {
      params: { limit }
    });
    return response.data.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: UserPreferences) {
    const response = await axios.put(`${API_BASE_URL}/bus-buddy/preferences/${userId}`, preferences);
    return response.data;
  }

  /**
   * Mark suggestion as read
   */
  async markSuggestionAsRead(suggestionId: string) {
    const response = await axios.put(`${API_BASE_URL}/bus-buddy/suggestions/${suggestionId}/read`);
    return response.data;
  }
}

export default new BusBuddyAPI();


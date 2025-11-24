/**
 * Crowd Prediction Engine API Service
 */

import axios from 'axios';
import { isLiveDataEnabled } from '../config/runtime';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CrowdPrediction {
  predictedCrowdPercentage: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  dataPoints: number;
  factors: {
    isRushHour: boolean;
    hasEvents: boolean;
    weatherImpact: boolean;
  };
}

export interface CrowdForecast {
  time: string;
  predictedCrowdPercentage: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
}

export interface CrowdTrend {
  date: string;
  hour: number;
  avgCrowd: number;
  peakCrowd: number;
  minCrowd: number;
}

export interface ModelAccuracy {
  meanAbsoluteError: number;
  stdDeviation: number;
  totalPredictions: number;
  accuracy: number;
}

class CrowdPredictionAPI {
  /**
   * Record crowd data (for ML training)
   */
  async recordCrowdData(data: {
    busId: string;
    routeId: string;
    stopId?: string;
    crowdPercentage: number;
    actualOccupancy?: number;
    busCapacity?: number;
    eventNearby?: boolean;
  }) {
    if (!isLiveDataEnabled()) return { success: false, data: null };
    const response = await axios.post(`${API_BASE_URL}/crowd/record`, data);
    return response.data;
  }

  /**
   * Predict crowd for specific time
   */
  async predictCrowd(
    routeId: string,
    stopId?: string,
    time?: string
  ): Promise<CrowdPrediction> {
    if (!isLiveDataEnabled()) {
      return {
        predictedCrowdPercentage: 50,
        crowdLevel: 'Medium',
        confidence: 50,
        dataPoints: 0,
        factors: { isRushHour: false, hasEvents: false, weatherImpact: false }
      };
    }
    const response = await axios.get(`${API_BASE_URL}/crowd/predict`, {
      params: { routeId, stopId, time }
    });
    return response.data.data;
  }

  /**
   * Get crowd forecast for next 3 hours
   */
  async getCrowdForecast(routeId: string, stopId?: string): Promise<CrowdForecast[]> {
    if (!isLiveDataEnabled()) return [];
    const response = await axios.get(`${API_BASE_URL}/crowd/forecast/${routeId}`, {
      params: { stopId }
    });
    return response.data.data;
  }

  /**
   * Get historical crowd trends
   */
  async getCrowdTrends(routeId: string, days: number = 7): Promise<CrowdTrend[]> {
    if (!isLiveDataEnabled()) return [];
    const response = await axios.get(`${API_BASE_URL}/crowd/trends/${routeId}`, {
      params: { days }
    });
    return response.data.data;
  }

  /**
   * Add event that affects crowd
   */
  async addCrowdEvent(data: {
    eventName: string;
    eventType: 'concert' | 'sports' | 'festival' | 'exhibition' | 'conference' | 'rally';
    venueName: string;
    latitude: number;
    longitude: number;
    expectedAttendance: number;
    startTime: string;
    endTime: string;
    affectedRoutes: string[];
    impactLevel: 'low' | 'medium' | 'high' | 'extreme';
  }) {
    if (!isLiveDataEnabled()) return null;
    const response = await axios.post(`${API_BASE_URL}/crowd/events`, data);
    return response.data.data;
  }

  /**
   * Get model accuracy statistics
   */
  async getModelAccuracy(): Promise<ModelAccuracy> {
    if (!isLiveDataEnabled()) return {
      meanAbsoluteError: 0,
      stdDeviation: 0,
      totalPredictions: 0,
      accuracy: 0
    };
    const response = await axios.get(`${API_BASE_URL}/crowd/model-accuracy`);
    return response.data.data;
  }
}

export const crowdPredictionApi = new CrowdPredictionAPI();
export default crowdPredictionApi;


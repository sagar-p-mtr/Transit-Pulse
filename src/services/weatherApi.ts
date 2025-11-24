/**
 * Weather-Aware Routes API Service
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  rain1h: number;
  rain3h: number;
  visibility: number;
  timestamp: string;
}

export interface WeatherForecast {
  time: string;
  temperature: number;
  condition: string;
  description: string;
  rain: number;
}

export interface WeatherRoute {
  id: string;
  routeName: string;
  routeNumber: string;
  weatherScore: number;
  weatherReason: string;
}

export interface FloodReport {
  id: string;
  stopId?: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  description?: string;
  upvotes: number;
  status: 'active' | 'resolved' | 'false_alarm';
  createdAt: string;
  stopName?: string;
}

class WeatherAPI {
  /**
   * Get current weather for a city
   */
  async getCurrentWeather(city: string): Promise<WeatherData> {
    const response = await axios.get(`${API_BASE_URL}/weather/current/${city}`);
    return response.data.data;
  }

  /**
   * Get weather forecast for a city
   */
  async getWeatherForecast(city: string): Promise<WeatherForecast[]> {
    const response = await axios.get(`${API_BASE_URL}/weather/forecast/${city}`);
    return response.data.data;
  }

  /**
   * Get weather-aware route recommendations
   */
  async getWeatherAwareRoutes(
    sourceStopId: string,
    destinationStopId: string,
    city: string
  ): Promise<{ weather: WeatherData; routes: WeatherRoute[]; recommendations: WeatherRoute[] }> {
    const response = await axios.get(`${API_BASE_URL}/weather/routes`, {
      params: { sourceStopId, destinationStopId, city }
    });
    return response.data.data;
  }

  /**
   * Report flood/waterlogging
   */
  async reportFlood(data: {
    userId: string;
    stopId?: string;
    latitude: number;
    longitude: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
  }): Promise<FloodReport> {
    const response = await axios.post(`${API_BASE_URL}/weather/flood-report`, data);
    return response.data.data;
  }

  /**
   * Get active flood reports
   */
  async getFloodReports(city?: string): Promise<FloodReport[]> {
    const response = await axios.get(`${API_BASE_URL}/weather/flood-reports`, {
      params: { city }
    });
    return response.data.data;
  }

  /**
   * Upvote a flood report
   */
  async upvoteFloodReport(reportId: string) {
    const response = await axios.put(`${API_BASE_URL}/weather/flood-reports/${reportId}/upvote`);
    return response.data;
  }
}

export default new WeatherAPI();


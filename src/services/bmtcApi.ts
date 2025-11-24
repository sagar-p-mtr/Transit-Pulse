import axios from 'axios';
import { fallbackApi } from './api';
import { isLiveDataEnabled } from '../config/runtime';

// Base URL for the BMTC API
const BMTC_API_BASE_URL = 'https://bmtc-api.onrender.com/api';

// Types for BMTC API responses
export interface BMTCBus {
  id: string;
  routeId: string;
  routeName: string;
  vehicleNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdated: string;
  crowdLevel?: 'Low' | 'Medium' | 'High';
  crowdPercentage?: number;
}

export interface BMTCRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  via: string;
  frequency: string;
  stops: BMTCStop[];
}

export interface BMTCStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Create axios instance with better timeout and retry logic
const bmtcAxios = axios.create({
  baseURL: BMTC_API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// API service for BMTC buses
const bmtcApi = {
  // Get all active buses
  getAllBuses: async (): Promise<BMTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getBusesByProvider('BMTC') as BMTCBus[];
    }
    try {
      const response = await bmtcAxios.get('/buses');
      
      // Add crowd level estimation if not provided by API
      return response.data.map((bus: BMTCBus) => ({
        ...bus,
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage()
      }));
    } catch (error) {
      console.error('Error fetching BMTC buses:', error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getBusesByProvider('BMTC') as BMTCBus[];
    }
  },

  // Get buses for a specific route
  getBusesByRoute: async (routeId: string): Promise<BMTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getBusesByRoute(routeId) as BMTCBus[];
    }
    try {
      const response = await bmtcAxios.get(`/routes/${routeId}/buses`);
      
      // Add crowd level estimation if not provided by API
      return response.data.map((bus: BMTCBus) => ({
        ...bus,
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage()
      }));
    } catch (error) {
      console.error(`Error fetching BMTC buses for route ${routeId}:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getBusesByRoute(routeId) as BMTCBus[];
    }
  },

  // Get all routes
  getAllRoutes: async (): Promise<BMTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getRoutesByProvider('BMTC') as BMTCRoute[];
    }
    try {
      const response = await bmtcAxios.get('/routes');
      return response.data;
    } catch (error) {
      console.error('Error fetching BMTC routes:', error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getRoutesByProvider('BMTC') as BMTCRoute[];
    }
  },

  // Get route details
  getRouteDetails: async (routeId: string): Promise<BMTCRoute | null> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getRouteDetails(routeId) as BMTCRoute;
    }
    try {
      const response = await bmtcAxios.get(`/routes/${routeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching BMTC route ${routeId}:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getRouteDetails(routeId) as BMTCRoute;
    }
  },

  // Get stops for a route
  getRouteStops: async (routeId: string): Promise<BMTCStop[]> => {
    if (!isLiveDataEnabled()) {
      const route = await fallbackApi.getRouteDetails(routeId);
      return route?.stops || [];
    }
    try {
      const response = await bmtcAxios.get(`/routes/${routeId}/stops`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stops for BMTC route ${routeId}:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      const route = await fallbackApi.getRouteDetails(routeId);
      return route?.stops || [];
    }
  },

  // Search routes by source and destination
  searchRoutes: async (source: string, destination: string): Promise<BMTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      const routes = await fallbackApi.getRoutesByProvider('BMTC');
      return routes.filter(route => 
        route.source.toLowerCase().includes(source.toLowerCase()) || 
        route.destination.toLowerCase().includes(destination.toLowerCase())
      ) as BMTCRoute[];
    }
    try {
      const response = await bmtcAxios.get(`/routes/search`, {
        params: { source, destination }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching BMTC routes from ${source} to ${destination}:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      const routes = await fallbackApi.getRoutesByProvider('BMTC');
      return routes.filter(route => 
        route.source.toLowerCase().includes(source.toLowerCase()) || 
        route.destination.toLowerCase().includes(destination.toLowerCase())
      ) as BMTCRoute[];
    }
  }
};

// Helper function to simulate crowd levels (in a real app, this would come from the API)
function estimateCrowdLevel(): 'Low' | 'Medium' | 'High' {
  const random = Math.random();
  if (random < 0.33) return 'Low';
  if (random < 0.66) return 'Medium';
  return 'High';
}

// Helper function to simulate crowd percentage (in a real app, this would come from the API)
function estimateCrowdPercentage(): number {
  return Math.floor(Math.random() * 100);
}

export default bmtcApi;

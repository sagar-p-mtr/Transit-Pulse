import axios from 'axios';
import { fallbackApi } from './api';
import { isLiveDataEnabled } from '../config/runtime';

// Types for other bus services
export interface OtherBus {
  id: string;
  provider: string; // e.g., "KSRTC", "APSRTC", etc.
  routeId: string;
  routeName: string;
  vehicleNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdated: string;
  crowdLevel: 'Low' | 'Medium' | 'High';
  crowdPercentage: number;
}

export interface OtherRoute {
  id: string;
  provider: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  via: string;
  frequency: string;
  stops: OtherStop[];
}

export interface OtherStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Using local mock data only - external APIs removed
const API_URLS: Record<string, string> = {};

// Create axios instances with better timeout and retry logic
const createAxiosInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: 15000, // Increased timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// Create axios instances for each provider
const axiosInstances: Record<string, ReturnType<typeof createAxiosInstance>> = {};
Object.entries(API_URLS).forEach(([provider, url]) => {
  axiosInstances[provider] = createAxiosInstance(url);
});

const otherBusApi = {
  // Get all buses for a specific provider
  getBusesByProvider: async (provider: string): Promise<OtherBus[]> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getBusesByProvider(provider) as OtherBus[];
    }
    try {
      const apiUrl = API_URLS[provider as keyof typeof API_URLS];
      if (!apiUrl) {
        throw new Error(`Unknown provider: ${provider}`);
      }
      
      const axiosInstance = axiosInstances[provider] || createAxiosInstance(apiUrl);
      const response = await axiosInstance.get('/buses');
      
      // Add provider information if not included in the response
      return response.data.map((bus: OtherBus) => ({
        ...bus,
        provider: provider
      }));
    } catch (error) {
      console.error(`Error fetching ${provider} buses:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getBusesByProvider(provider) as OtherBus[];
    }
  },

  // Get all routes for a specific provider
  getRoutesByProvider: async (provider: string): Promise<OtherRoute[]> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getRoutesByProvider(provider) as OtherRoute[];
    }
    try {
      const apiUrl = API_URLS[provider as keyof typeof API_URLS];
      if (!apiUrl) {
        throw new Error(`Unknown provider: ${provider}`);
      }
      
      const axiosInstance = axiosInstances[provider] || createAxiosInstance(apiUrl);
      const response = await axiosInstance.get('/routes');
      
      // Add provider information if not included in the response
      return response.data.map((route: OtherRoute) => ({
        ...route,
        provider: provider
      }));
    } catch (error) {
      console.error(`Error fetching ${provider} routes:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getRoutesByProvider(provider) as OtherRoute[];
    }
  },

  // Get route details
  getRouteDetails: async (routeId: string): Promise<OtherRoute | null> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getRouteDetails(routeId) as OtherRoute;
    }
    try {
      // Extract provider from routeId (e.g., "ksrtc-route-1" -> "KSRTC")
      const provider = routeId.split('-')[0].toUpperCase();
      const apiUrl = API_URLS[provider as keyof typeof API_URLS];
      
      if (!apiUrl) {
        throw new Error(`Unknown provider in routeId: ${routeId}`);
      }
      
      const axiosInstance = axiosInstances[provider] || createAxiosInstance(apiUrl);
      const response = await axiosInstance.get(`/routes/${routeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching route details for ${routeId}:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getRouteDetails(routeId) as OtherRoute;
    }
  },

  // Search routes by source and destination
  searchRoutes: async (provider: string, source: string, destination: string): Promise<OtherRoute[]> => {
    if (!isLiveDataEnabled()) {
      const routes = await fallbackApi.getRoutesByProvider(provider);
      return routes.filter(route => 
        route.source.toLowerCase().includes(source.toLowerCase()) || 
        route.destination.toLowerCase().includes(destination.toLowerCase())
      ) as OtherRoute[];
    }
    try {
      const apiUrl = API_URLS[provider as keyof typeof API_URLS];
      if (!apiUrl) {
        throw new Error(`Unknown provider: ${provider}`);
      }
      
      const axiosInstance = axiosInstances[provider] || createAxiosInstance(apiUrl);
      const response = await axiosInstance.get('/routes/search', {
        params: { source, destination }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error searching ${provider} routes:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      const routes = await fallbackApi.getRoutesByProvider(provider);
      return routes.filter(route => 
        route.source.toLowerCase().includes(source.toLowerCase()) || 
        route.destination.toLowerCase().includes(destination.toLowerCase())
      ) as OtherRoute[];
    }
  },
  
  // Get stop details
  getStopDetails: async (stopId: string): Promise<OtherStop | null> => {
    if (!isLiveDataEnabled()) {
      return fallbackApi.getStopDetails(stopId).stops?.[0] as OtherStop;
    }
    try {
      // Extract provider from stopId (e.g., "ksrtc-stop-1" -> "KSRTC")
      const provider = stopId.split('-')[0].toUpperCase();
      const apiUrl = API_URLS[provider as keyof typeof API_URLS];
      
      if (!apiUrl) {
        throw new Error(`Unknown provider in stopId: ${stopId}`);
      }
      
      const axiosInstance = axiosInstances[provider] || createAxiosInstance(apiUrl);
      const response = await axiosInstance.get(`/stops/${stopId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stop details for ${stopId}:`, error instanceof Error ? error.message : 'Unknown error');
      // Always use fallback data if API fails
      return fallbackApi.getStopDetails(stopId).stops?.[0] as OtherStop;
    }
  }
};

export default otherBusApi;

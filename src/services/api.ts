import axios from 'axios';
import io, { type Socket } from 'socket.io-client';
import { generateMockBuses, generateMockRoutes, generateMockStopDetails } from './mockData';
import { isLiveDataEnabled, ENABLE_REALTIME, REALTIME_URL } from '../config/runtime';

// API Base URLs
const BMTC_API_URL = 'https://bmtc-api.onrender.com/api';
const KSRTC_API_URL = 'https://ksrtc-api.onrender.com/api';
const APSRTC_API_URL = 'https://apsrtc-api.onrender.com/api';

const createStubSocket = (): Socket => {
  const noop = () => {};
  // Minimal stub to satisfy callers without opening a network connection
  return {
    on: noop,
    off: noop,
    emit: noop,
    connect: noop,
    disconnect: noop,
    io: {} as any,
    id: undefined,
    connected: false,
    active: false,
    disconnected: true,
    open: noop,
    send: noop,
    close: noop,
    compress: () => ({ on: noop, off: noop, emit: noop } as any),
    volatile: {} as any,
    listeners: () => [],
    listenerCount: () => 0,
    removeAllListeners: noop,
    prependListener: noop,
    prependOnceListener: noop,
    once: noop,
    hasListeners: () => false,
    timeout: () => ({ on: noop, off: noop, emit: noop } as any)
  } as unknown as Socket;
};

// Socket.io connection for real-time updates (local backend by default)
export const socket: Socket = ENABLE_REALTIME
  ? io(REALTIME_URL, {
      transports: ['websocket', 'polling'], // Add polling as fallback
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000 // Increase timeout
    })
  : createStubSocket();

// Initialize socket event listeners
export const initializeSocketListeners = (
  onBusUpdate: (data: any) => void,
  onRouteUpdate: (data: any) => void,
  onError: (error: any) => void
) => {
  if (!ENABLE_REALTIME) {
    console.log('Realtime socket disabled (local/offline mode)');
    return () => undefined;
  }

  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('subscribe', { topics: ['bus_updates', 'route_updates'] });
  });

  socket.on('bus_update', (data) => {
    onBusUpdate(data);
  });

  socket.on('route_update', (data) => {
    onRouteUpdate(data);
  });

  socket.on('connect_error', (error) => {
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? String(error.message) 
      : 'Connection failed';
    console.error('Socket connection error:', errorMessage);
    onError(errorMessage);
    
    // Automatically use fallback data when socket connection fails
    const fallbackBusData = generateMockBuses(30);
    onBusUpdate(fallbackBusData);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return () => {
    socket.off('connect');
    socket.off('bus_update');
    socket.off('route_update');
    socket.off('connect_error');
    socket.off('disconnect');
  };
};

// Create axios instances with better timeout and retry logic
const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 15000, // Increased timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.code === 'ECONNABORTED') {
        console.error(`Request timeout for ${baseURL}`);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const bmtcAxios = createAxiosInstance(BMTC_API_URL);
const ksrtcAxios = createAxiosInstance(KSRTC_API_URL);
const apsrtcAxios = createAxiosInstance(APSRTC_API_URL);

// Error handling for API requests
const handleApiError = (error: any, source: string) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`${source} API Error:`, error.response.data);
    console.error(`Status:`, error.response.status);
  } else if (error.request) {
    // The request was made but no response was received
    console.error(`${source} API Error: No response received`);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(`${source} API Error:`, error.message);
  }
  
  // Return empty data instead of throwing to prevent app crashes
  return null;
};

// API service for all bus providers
export const busApi = {
  // Get all buses from all providers
  getAllBuses: async () => {
    if (!isLiveDataEnabled()) {
      return generateMockBuses(30);
    }
    try {
      const [bmtcResponse, ksrtcResponse, apsrtcResponse] = await Promise.allSettled([
        bmtcAxios.get('/buses'),
        ksrtcAxios.get('/buses'),
        apsrtcAxios.get('/buses')
      ]);
      
      const buses = [];
      
      if (bmtcResponse.status === 'fulfilled' && bmtcResponse.value?.data) {
        buses.push(...bmtcResponse.value.data.map((bus: any) => ({
          ...bus,
          provider: 'BMTC'
        })));
      }
      
      if (ksrtcResponse.status === 'fulfilled' && ksrtcResponse.value?.data) {
        buses.push(...ksrtcResponse.value.data.map((bus: any) => ({
          ...bus,
          provider: 'KSRTC'
        })));
      }
      
      if (apsrtcResponse.status === 'fulfilled' && apsrtcResponse.value?.data) {
        buses.push(...apsrtcResponse.value.data.map((bus: any) => ({
          ...bus,
          provider: 'APSRTC'
        })));
      }
      
      // If no real data was fetched, use fallback data
      if (buses.length === 0) {
        return generateMockBuses(30);
      }
      
      return buses;
    } catch (error) {
      console.error('Error fetching all buses:', error instanceof Error ? error.message : 'Unknown error');
      return generateMockBuses(30); // Always return fallback data on error
    }
  },
  
  // Get buses by provider
  getBusesByProvider: async (provider: string) => {
    if (!isLiveDataEnabled()) {
      return generateMockBuses(10, provider);
    }
    try {
      let response;
      
      switch (provider.toUpperCase()) {
        case 'BMTC':
          response = await bmtcAxios.get('/buses');
          break;
        case 'KSRTC':
          response = await ksrtcAxios.get('/buses');
          break;
        case 'APSRTC':
          response = await apsrtcAxios.get('/buses');
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      return response.data.map((bus: any) => ({
        ...bus,
        provider: provider.toUpperCase()
      }));
    } catch (error) {
      handleApiError(error, provider);
      return generateMockBuses(10, provider); // Always return fallback data on error
    }
  },
  
  // Get buses by route
  getBusesByRoute: async (routeId: string) => {
    if (!isLiveDataEnabled()) {
      const provider = routeId.split('-')[0];
      return generateMockBuses(5, provider.toUpperCase());
    }
    try {
      // Determine provider from routeId
      let provider;
      let apiInstance;
      
      if (routeId.startsWith('bmtc-')) {
        provider = 'BMTC';
        apiInstance = bmtcAxios;
      } else if (routeId.startsWith('ksrtc-')) {
        provider = 'KSRTC';
        apiInstance = ksrtcAxios;
      } else if (routeId.startsWith('apsrtc-')) {
        provider = 'APSRTC';
        apiInstance = apsrtcAxios;
      } else {
        throw new Error(`Unknown route provider: ${routeId}`);
      }
      
      const response = await apiInstance.get(`/routes/${routeId}/buses`);
      
      return response.data.map((bus: any) => ({
        ...bus,
        provider
      }));
    } catch (error) {
      handleApiError(error, 'Route');
      const provider = routeId.split('-')[0];
      return generateMockBuses(5, provider.toUpperCase()); // Always return fallback data on error
    }
  },
  
  // Get all routes from all providers
  getAllRoutes: async () => {
    if (!isLiveDataEnabled()) {
      return generateMockRoutes(15);
    }
    try {
      const [bmtcResponse, ksrtcResponse, apsrtcResponse] = await Promise.allSettled([
        bmtcAxios.get('/routes'),
        ksrtcAxios.get('/routes'),
        apsrtcAxios.get('/routes')
      ]);
      
      const routes = [];
      
      if (bmtcResponse.status === 'fulfilled' && bmtcResponse.value?.data) {
        routes.push(...bmtcResponse.value.data.map((route: any) => ({
          ...route,
          provider: 'BMTC'
        })));
      }
      
      if (ksrtcResponse.status === 'fulfilled' && ksrtcResponse.value?.data) {
        routes.push(...ksrtcResponse.value.data.map((route: any) => ({
          ...route,
          provider: 'KSRTC'
        })));
      }
      
      if (apsrtcResponse.status === 'fulfilled' && apsrtcResponse.value?.data) {
        routes.push(...apsrtcResponse.value.data.map((route: any) => ({
          ...route,
          provider: 'APSRTC'
        })));
      }
      
      // If no real data was fetched, use fallback data
      if (routes.length === 0) {
        return generateMockRoutes(15);
      }
      
      return routes;
    } catch (error) {
      console.error('Error fetching all routes:', error instanceof Error ? error.message : 'Unknown error');
      return generateMockRoutes(15); // Always return fallback data on error
    }
  },
  
  // Get routes by provider
  getRoutesByProvider: async (provider: string) => {
    if (!isLiveDataEnabled()) {
      return generateMockRoutes(5, provider);
    }
    try {
      let response;
      
      switch (provider.toUpperCase()) {
        case 'BMTC':
          response = await bmtcAxios.get('/routes');
          break;
        case 'KSRTC':
          response = await ksrtcAxios.get('/routes');
          break;
        case 'APSRTC':
          response = await apsrtcAxios.get('/routes');
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      return response.data.map((route: any) => ({
        ...route,
        provider: provider.toUpperCase()
      }));
    } catch (error) {
      handleApiError(error, provider);
      return generateMockRoutes(5, provider); // Always return fallback data on error
    }
  },
  
  // Get route details
  getRouteDetails: async (routeId: string) => {
    if (!isLiveDataEnabled()) {
      const routes = generateMockRoutes(10);
      return routes.find(route => route.id === routeId) || routes[0];
    }
    try {
      // Determine provider from routeId
      let apiInstance;
      
      if (routeId.startsWith('bmtc-')) {
        apiInstance = bmtcAxios;
      } else if (routeId.startsWith('ksrtc-')) {
        apiInstance = ksrtcAxios;
      } else if (routeId.startsWith('apsrtc-')) {
        apiInstance = apsrtcAxios;
      } else {
        throw new Error(`Unknown route provider: ${routeId}`);
      }
      
      const response = await apiInstance.get(`/routes/${routeId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Route Details');
      const routes = generateMockRoutes(10);
      return routes.find(route => route.id === routeId) || routes[0]; // Always return fallback data on error
    }
  },
  
  // Get stop details
  getStopDetails: async (stopId: string) => {
    if (!isLiveDataEnabled()) {
      return generateMockStopDetails(stopId);
    }
    try {
      // Determine provider from stopId
      let apiInstance;
      
      if (stopId.startsWith('bmtc-')) {
        apiInstance = bmtcAxios;
      } else if (stopId.startsWith('ksrtc-')) {
        apiInstance = ksrtcAxios;
      } else if (stopId.startsWith('apsrtc-')) {
        apiInstance = apsrtcAxios;
      } else {
        throw new Error(`Unknown stop provider: ${stopId}`);
      }
      
      const response = await apiInstance.get(`/stops/${stopId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Stop Details');
      return generateMockStopDetails(stopId); // Always return fallback data on error
    }
  },
  
  // Search routes
  searchRoutes: async (query: string) => {
    if (!isLiveDataEnabled()) {
      const routes = generateMockRoutes(15);
      return routes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
    try {
      const [bmtcResponse, ksrtcResponse, apsrtcResponse] = await Promise.allSettled([
        bmtcAxios.get('/routes/search', { params: { q: query } }),
        ksrtcAxios.get('/routes/search', { params: { q: query } }),
        apsrtcAxios.get('/routes/search', { params: { q: query } })
      ]);
      
      const results = [];
      
      if (bmtcResponse.status === 'fulfilled' && bmtcResponse.value?.data) {
        results.push(...bmtcResponse.value.data.map((route: any) => ({
          ...route,
          provider: 'BMTC'
        })));
      }
      
      if (ksrtcResponse.status === 'fulfilled' && ksrtcResponse.value?.data) {
        results.push(...ksrtcResponse.value.data.map((route: any) => ({
          ...route,
          provider: 'KSRTC'
        })));
      }
      
      if (apsrtcResponse.status === 'fulfilled' && apsrtcResponse.value?.data) {
        results.push(...apsrtcResponse.value.data.map((route: any) => ({
          ...route,
          provider: 'APSRTC'
        })));
      }
      
      // If no real data was fetched, use fallback data
      if (results.length === 0) {
        const routes = generateMockRoutes(15);
        return routes.filter(route => 
          route.routeName.toLowerCase().includes(query.toLowerCase()) ||
          route.source.toLowerCase().includes(query.toLowerCase()) ||
          route.destination.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      return results;
    } catch (error) {
      console.error('Error searching routes:', error instanceof Error ? error.message : 'Unknown error');
      const routes = generateMockRoutes(15);
      return routes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
  }
};

// Fallback to mock data if API calls fail
export const fallbackApi = {
  getAllBuses: () => generateMockBuses(30),
  getBusesByProvider: (provider: string) => generateMockBuses(10, provider),
  getBusesByRoute: (routeId: string) => {
    const provider = routeId.split('-')[0];
    return generateMockBuses(5, provider.toUpperCase());
  },
  getAllRoutes: () => generateMockRoutes(15),
  getRoutesByProvider: (provider: string) => generateMockRoutes(5, provider),
  getRouteDetails: (routeId: string) => {
    const routes = generateMockRoutes(10);
    return routes.find(route => route.id === routeId) || routes[0];
  },
  getStopDetails: (stopId: string) => generateMockStopDetails(stopId),
  searchRoutes: (query: string) => {
    const routes = generateMockRoutes(15);
    return routes.filter(route => 
      route.routeName.toLowerCase().includes(query.toLowerCase()) ||
      route.source.toLowerCase().includes(query.toLowerCase()) ||
      route.destination.toLowerCase().includes(query.toLowerCase())
    );
  }
};

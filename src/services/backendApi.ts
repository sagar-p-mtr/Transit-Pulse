// Real Backend API - Connect to your Node.js backend!
import axios from 'axios';
import io from 'socket.io-client';

// Backend URL (change if deployed)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// WebSocket connection
export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
  auth: {
    token: localStorage.getItem('accessToken'),
  },
});

// Socket connection management
socket.on('connect', () => {
  console.log('Connected to backend WebSocket');
});

socket.on('disconnect', () => {
  console.log('Disconnected from backend');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

// Authentication APIs
export const authApi = {
  // Send OTP to phone number
  sendOTP: (phoneNumber: string) =>
    api.post('/auth/send-otp', { phoneNumber }),

  // Verify OTP and login
  verifyOTP: (phoneNumber: string, otp: string) =>
    api.post('/auth/verify-otp', { phoneNumber, otp }),

  // Logout
  logout: () => api.post('/auth/logout'),
};

// Bus Tracking APIs
export const busApi = {
  // Get all buses
  getAllBuses: (city?: string, routeId?: string) =>
    api.get('/buses', { params: { city, routeId } }),

  // Get bus by ID
  getBusById: (busId: string) =>
    api.get(`/buses/${busId}`),

  // Search bus by bus number (for "Where is My Bus" feature)
  searchBusByNumber: (busNumber: string) =>
    api.get(`/buses/search/${busNumber}`),

  // Get current stop for a bus
  getBusCurrentStop: (busId: string) =>
    api.get(`/buses/${busId}/current-stop`),

  // Get upcoming stops with ETAs
  getBusUpcomingStops: (busId: string) =>
    api.get(`/buses/${busId}/upcoming-stops`),

  // Get all routes
  getAllRoutes: (city?: string) =>
    api.get('/buses/routes/all', { params: { city } }),
};

// ML Prediction APIs
export const mlApi = {
  // Predict bus ETA
  predictETA: (busId: string, stopId: string) =>
    api.post('/ml/predict-eta', { busId, stopId }),

  // Predict crowd level
  predictCrowd: (routeId: string, stopId: string, time?: string) =>
    api.post('/ml/predict-crowd', { routeId, stopId, time }),
};

// Notification APIs
export const notificationApi = {
  // Get user notifications
  getNotifications: (limit?: number) =>
    api.get('/notifications', { params: { limit } }),

  // Mark notification as read
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),

  // Register FCM token for push notifications
  registerToken: (fcmToken: string) =>
    api.post('/notifications/register-token', { fcm_token: fcmToken }),
};

// Social/Community APIs
export const socialApi = {
  // Post community report
  postReport: (data: {
    type: string;
    routeId?: string;
    busId?: string;
    description: string;
    latitude?: number;
    longitude?: number;
  }) => api.post('/social/reports', data),

  // Get community reports
  getReports: (routeId?: string, type?: string, limit?: number) =>
    api.get('/social/reports', { params: { routeId, type, limit } }),

  // Rate a bus
  rateBus: (data: {
    busId: string;
    routeId: string;
    rating: number;
    cleanliness?: number;
    driverBehavior?: number;
    comfort?: number;
    comment?: string;
  }) => api.post('/social/ratings', data),

  // Get leaderboard
  getLeaderboard: () =>
    api.get('/social/leaderboard'),
};

// WebSocket subscription helpers
export const subscribeToUpdates = {
  // Subscribe to specific bus updates
  subscribeToBus: (busId: string) => {
    socket.emit('subscribe:bus', busId);
  },

  // Subscribe to route updates
  subscribeToRoute: (routeId: string) => {
    socket.emit('subscribe:route', routeId);
  },

  // Subscribe to stop updates
  subscribeToStop: (stopId: string) => {
    socket.emit('subscribe:stop', stopId);
  },

  // Unsubscribe
  unsubscribe: (channel: string) => {
    socket.emit('unsubscribe', channel);
  },
};

// WebSocket event listeners
export const socketEvents = {
  // Listen to bus location updates
  onBusLocationUpdate: (callback: (data: any) => void) => {
    socket.on('bus:location:update', callback);
    return () => socket.off('bus:location:update', callback);
  },

  // Listen to bus arrival notifications
  onBusArrival: (callback: (data: any) => void) => {
    socket.on('bus:arrival', callback);
    return () => socket.off('bus:arrival', callback);
  },

  // Listen to community reports
  onCommunityReport: (callback: (data: any) => void) => {
    socket.on('community:report', callback);
    return () => socket.off('community:report', callback);
  },

  // Listen to notifications
  onNotification: (callback: (data: any) => void) => {
    socket.on('notification', callback);
    return () => socket.off('notification', callback);
  },

  // Listen to alerts
  onAlert: (callback: (data: any) => void) => {
    socket.on('alert', callback);
    return () => socket.off('alert', callback);
  },
};

// Connect socket when user logs in (or for public access)
export const connectSocket = () => {
  if (socket.connected) {
    return; // Already connected
  }
  const token = localStorage.getItem('accessToken');
  if (token) {
    socket.auth = { token };
  }
  socket.connect();
};

// Disconnect socket when user logs out
export const disconnectSocket = () => {
  socket.disconnect();
};

export default api;


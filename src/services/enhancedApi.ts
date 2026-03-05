// Enhanced API - Adds backend features WITHOUT breaking existing mock data!
import axios from 'axios';
import { socket as mockSocket } from './api';

// Backend URL - works if backend is running, falls back to mock if not
const BACKEND_URL = 'http://localhost:5000';
const backendApi = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 3000, // Quick timeout so it falls back fast
});

// Check if backend is available
let backendAvailable = false;

backendApi.get('/health')
  .then(() => {
    backendAvailable = true;
    console.log('Backend connected!');
  })
  .catch(() => {
    backendAvailable = false;
    console.log('Backend not available, using mock data');
  });

// Add token if available
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NEW FEATURES - ML Predictions (only works with backend)
export const mlPredictions = {
  async predictETA(busId: string, stopId: string) {
    if (!backendAvailable) {
      // Fallback: simple calculation
      return {
        success: true,
        data: {
          eta_minutes: Math.floor(Math.random() * 20) + 5,
          confidence: 0.65,
          method: 'mock'
        }
      };
    }
    
    try {
      const res = await backendApi.post('/ml/predict-eta', { busId, stopId });
      return { success: true, ...res.data };
    } catch {
      return {
        success: true,
        data: {
          eta_minutes: Math.floor(Math.random() * 20) + 5,
          confidence: 0.65,
          method: 'fallback'
        }
      };
    }
  },

  async predictCrowd(routeId: string, stopId: string) {
    if (!backendAvailable) {
      const levels = ['Low', 'Medium', 'High'];
      return {
        success: true,
        data: {
          crowd_level: levels[Math.floor(Math.random() * 3)],
          crowd_percentage: Math.floor(Math.random() * 100),
          confidence: 0.6
        }
      };
    }

    try {
      const res = await backendApi.post('/ml/predict-crowd', { routeId, stopId });
      return { success: true, ...res.data };
    } catch {
      return {
        success: true,
        data: {
          crowd_level: 'Medium',
          crowd_percentage: 50,
          confidence: 0.5
        }
      };
    }
  }
};

// NEW FEATURES - Social/Community
export const community = {
  async postReport(type: string, description: string, busId?: string, routeId?: string) {
    if (!backendAvailable) {
      console.log('📝 Report logged (mock):', { type, description });
      return { success: true, message: 'Report logged' };
    }

    try {
      const res = await backendApi.post('/social/reports', {
        type, description, busId, routeId
      });
      return { success: true, ...res.data };
    } catch {
      return { success: false, message: 'Failed to post report' };
    }
  },

  async getReports(routeId?: string) {
    if (!backendAvailable) return { success: true, data: [], count: 0 };

    try {
      const res = await backendApi.get('/social/reports', { params: { routeId } });
      return { success: true, ...res.data };
    } catch {
      return { success: true, data: [], count: 0 };
    }
  },

  async rateBus(busId: string, rating: number, comment?: string) {
    if (!backendAvailable) {
      console.log('⭐ Rating logged (mock):', { busId, rating });
      return { success: true, message: 'Rating saved' };
    }

    try {
      const res = await backendApi.post('/social/ratings', {
        busId, rating, comment, routeId: 'unknown'
      });
      return { success: true, ...res.data };
    } catch {
      return { success: false, message: 'Failed to rate' };
    }
  }
};

// NEW FEATURES - Notifications
export const notifications = {
  async getAll() {
    if (!backendAvailable) return { success: true, data: [], count: 0 };

    try {
      const res = await backendApi.get('/notifications');
      return { success: true, ...res.data };
    } catch {
      return { success: true, data: [], count: 0 };
    }
  },

  async markAsRead(id: string) {
    if (!backendAvailable) return { success: true };

    try {
      await backendApi.put(`/notifications/${id}/read`);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
};

// Export status
export const getBackendStatus = () => backendAvailable;


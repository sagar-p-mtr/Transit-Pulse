// Demo API Service - Fallback to mock data when real APIs fail
import { mockDataService, MockBus, MockRoute } from './mockDataService';
import { isLiveDataEnabled } from '../config/runtime';

class DemoApiService {
  private static instance: DemoApiService;
  private fallbackEnabled = true;

  static getInstance(): DemoApiService {
    if (!DemoApiService.instance) {
      DemoApiService.instance = new DemoApiService();
    }
    return DemoApiService.instance;
  }

  // Wrapper for any API call with automatic fallback
  private async withFallback<T>(
    apiCall: () => Promise<T>,
    fallbackCall: () => Promise<T>,
    apiName: string
  ): Promise<T> {
    if (!isLiveDataEnabled()) {
      return fallbackCall();
    }
    if (!this.fallbackEnabled) {
      return apiCall();
    }

    try {
      // Try the real API first with a short timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API timeout')), 3000);
      });

      return await Promise.race([apiCall(), timeoutPromise]);
    } catch (error) {
      console.warn(`${apiName} failed, using mock data:`, error);
      return fallbackCall();
    }
  }

  // Enhanced bus fetching with fallback
  async getBuses(): Promise<MockBus[]> {
    return this.withFallback(
      async () => {
        // This would be your real API call
        const response = await fetch('https://bmtc-api.onrender.com/api/buses');
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        
        // Transform real API data to match our interface
        return data.map((bus: any) => ({
          id: bus.id || `KA-01-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          routeNumber: bus.routeNumber || bus.route || 'Route Unknown',
          currentLocation: bus.location || { latitude: 12.9716, longitude: 77.5946 },
          crowdLevel: bus.crowdLevel || 'Medium',
          nextStop: bus.nextStop || 'Next Stop',
          eta: bus.eta || '5 mins',
          speed: bus.speed || 30,
          isActive: bus.isActive !== false
        }));
      },
      () => mockDataService.getBuses(),
      'BMTC Bus API'
    );
  }

  async getRoutes(): Promise<MockRoute[]> {
    return this.withFallback(
      async () => {
        const response = await fetch('https://bmtc-api.onrender.com/api/routes');
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        
        return data.map((route: any) => ({
          id: route.id,
          routeNumber: route.routeNumber || route.name,
          startPoint: route.startPoint || route.origin,
          endPoint: route.endPoint || route.destination,
          totalStops: route.totalStops || route.stops?.length || 20,
          estimatedDuration: route.estimatedDuration || '30 mins'
        }));
      },
      () => mockDataService.getRoutes(),
      'BMTC Routes API'
    );
  }

  async getBusByRoute(routeId: string): Promise<MockBus[]> {
    return this.withFallback(
      async () => {
        const response = await fetch(`https://bmtc-api.onrender.com/api/routes/${routeId}/buses`);
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        
        return data.map((bus: any) => ({
          id: bus.id || `KA-01-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          routeNumber: bus.routeNumber || bus.route,
          currentLocation: bus.location || { latitude: 12.9716, longitude: 77.5946 },
          crowdLevel: bus.crowdLevel || 'Medium',
          nextStop: bus.nextStop || 'Next Stop',
          eta: bus.eta || '5 mins',
          speed: bus.speed || 30,
          isActive: bus.isActive !== false
        }));
      },
      () => mockDataService.getBusByRoute(routeId),
      `BMTC Route ${routeId} Buses API`
    );
  }

  // For demo purposes - disable real API calls
  enableDemoMode(): void {
    this.fallbackEnabled = true;
    mockDataService.enableDemoMode();
    console.log('🎯 Demo mode: All API calls will use mock data');
  }

  disableDemoMode(): void {
    this.fallbackEnabled = false;
    mockDataService.disableDemoMode();
    console.log('📡 Live mode: Will attempt real API calls');
  }

  // Quick demo data access
  getDemoData() {
    return {
      sampleBus: {
        id: 'KA-01-AB-1234',
        routeNumber: 'Route 500',
        crowdLevel: 'Medium' as const,
        nextStop: 'MG Road',
        eta: '5 mins',
        speed: 35
      },
      sampleRoute: {
        id: 'bmtc-route-1',
        routeNumber: 'Route 500',
        startPoint: 'Kempegowda Bus Station',
        endPoint: 'Electronic City'
      }
    };
  }
}

export const demoApiService = DemoApiService.getInstance();

// Auto-enable demo mode for smooth demo experience
if (typeof window !== 'undefined') {
  // Enable demo mode by default for demo day
  demoApiService.enableDemoMode();
  
  // Add global helper for demo
  (window as any).demoAPI = {
    enable: () => demoApiService.enableDemoMode(),
    disable: () => demoApiService.disableDemoMode(),
    getData: () => demoApiService.getDemoData()
  };
  
  console.log('🚌 Demo API Service loaded! Use window.demoAPI to control demo mode');
}

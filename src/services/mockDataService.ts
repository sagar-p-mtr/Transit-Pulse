// Mock Data Service for Demo
// This provides offline demo data when external APIs fail

export interface MockBus {
  id: string;
  routeNumber: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  crowdLevel: 'Low' | 'Medium' | 'High';
  nextStop: string;
  eta: string;
  speed: number;
  isActive: boolean;
}

export interface MockRoute {
  id: string;
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  totalStops: number;
  estimatedDuration: string;
}

class MockDataService {
  private demoRoutes: MockRoute[] = [
    {
      id: 'bmtc-route-1',
      routeNumber: 'Route 500',
      startPoint: 'Kempegowda Bus Station',
      endPoint: 'Electronic City',
      totalStops: 25,
      estimatedDuration: '45 mins'
    },
    {
      id: 'bmtc-route-2', 
      routeNumber: 'Route 335E',
      startPoint: 'Silk Board',
      endPoint: 'Whitefield',
      totalStops: 18,
      estimatedDuration: '35 mins'
    },
    {
      id: 'bmtc-route-3',
      routeNumber: 'Route 201',
      startPoint: 'Shivajinagar',
      endPoint: 'BTM Layout',
      totalStops: 22,
      estimatedDuration: '40 mins'
    }
  ];

  private demoBuses: MockBus[] = [
    {
      id: 'KA-01-AB-1234',
      routeNumber: 'Route 500',
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      crowdLevel: 'Medium',
      nextStop: 'MG Road',
      eta: '5 mins',
      speed: 35,
      isActive: true
    },
    {
      id: 'KA-01-AB-5678',
      routeNumber: 'Route 335E', 
      currentLocation: {
        latitude: 12.9352,
        longitude: 77.6245
      },
      crowdLevel: 'Low',
      nextStop: 'Koramangala',
      eta: '8 mins',
      speed: 25,
      isActive: true
    },
    {
      id: 'KA-01-AB-9012',
      routeNumber: 'Route 201',
      currentLocation: {
        latitude: 12.9698,
        longitude: 77.7500
      },
      crowdLevel: 'High',
      nextStop: 'Indiranagar',
      eta: '3 mins',
      speed: 45,
      isActive: true
    }
  ];

  private isOnline(): boolean {
    return navigator.onLine;
  }

  private shouldUseMockData(): boolean {
    // Use mock data if offline or if in demo mode
    return !this.isOnline() || localStorage.getItem('demoMode') === 'true';
  }

  async getBuses(): Promise<MockBus[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (this.shouldUseMockData()) {
      // Randomize some properties for demo effect
      return this.demoBuses.map(bus => ({
        ...bus,
        speed: Math.floor(Math.random() * 30) + 20,
        crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High'
      }));
    }
    
    throw new Error('External APIs not available - using mock data');
  }

  async getRoutes(): Promise<MockRoute[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.demoRoutes;
  }

  async getBusByRoute(routeId: string): Promise<MockBus[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const route = this.demoRoutes.find(r => r.id === routeId);
    if (!route) {
      throw new Error('Route not found');
    }
    
    return this.demoBuses.filter(bus => bus.routeNumber === route.routeNumber);
  }

  // Enable demo mode for offline testing
  enableDemoMode(): void {
    localStorage.setItem('demoMode', 'true');
    console.log('🎯 Demo mode enabled - using mock data');
  }

  disableDemoMode(): void {
    localStorage.removeItem('demoMode');
    console.log('📡 Demo mode disabled - will try external APIs');
  }

  isDemoMode(): boolean {
    return localStorage.getItem('demoMode') === 'true';
  }
}

export const mockDataService = new MockDataService();

// Auto-enable demo mode if external APIs are failing
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Check if we should auto-enable demo mode
    setTimeout(() => {
      if (!mockDataService.isDemoMode()) {
        console.log('🚌 Starting in demo mode for better experience');
        mockDataService.enableDemoMode();
      }
    }, 2000);
  });
}

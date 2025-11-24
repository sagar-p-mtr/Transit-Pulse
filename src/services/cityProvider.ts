import axios from 'axios';

// City and Provider Configuration
export interface CityConfig {
  id: string;
  name: string;
  state: string;
  providers: TransportProvider[];
  coordinates: {
    lat: number;
    lng: number;
  };
  mapCenter: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export interface TransportProvider {
  id: string;
  name: string;
  fullName: string;
  apiUrl: string;
  isActive: boolean;
  colorScheme: {
    primary: string;
    secondary: string;
  };
}

// Indian Cities Configuration
export const INDIAN_CITIES: Record<string, CityConfig> = {
  'bangalore': {
    id: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    mapCenter: { lat: 12.9716, lng: 77.5946, zoom: 11 },
    providers: [
      {
        id: 'bmtc',
        name: 'BMTC',
        fullName: 'Bangalore Metropolitan Transport Corporation',
        apiUrl: 'https://bmtc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#e74c3c', secondary: '#c0392b' }
      },
      {
        id: 'ksrtc',
        name: 'KSRTC',
        fullName: 'Karnataka State Road Transport Corporation',
        apiUrl: 'https://ksrtc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#f39c12', secondary: '#e67e22' }
      }
    ]
  },
  'delhi': {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    mapCenter: { lat: 28.6139, lng: 77.2090, zoom: 10 },
    providers: [
      {
        id: 'dtc',
        name: 'DTC',
        fullName: 'Delhi Transport Corporation',
        apiUrl: 'https://dtc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#2ecc71', secondary: '#27ae60' }
      },
      {
        id: 'cluster',
        name: 'Cluster',
        fullName: 'Delhi Cluster Bus Service',
        apiUrl: 'https://cluster-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#3498db', secondary: '#2980b9' }
      }
    ]
  },
  'mumbai': {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    mapCenter: { lat: 19.0760, lng: 72.8777, zoom: 11 },
    providers: [
      {
        id: 'best',
        name: 'BEST',
        fullName: 'Brihanmumbai Electric Supply and Transport',
        apiUrl: 'https://best-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#9b59b6', secondary: '#8e44ad' }
      },
      {
        id: 'msrtc',
        name: 'MSRTC',
        fullName: 'Maharashtra State Road Transport Corporation',
        apiUrl: 'https://msrtc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#e67e22', secondary: '#d35400' }
      }
    ]
  },
  'chennai': {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    mapCenter: { lat: 13.0827, lng: 80.2707, zoom: 11 },
    providers: [
      {
        id: 'mtc',
        name: 'MTC',
        fullName: 'Metropolitan Transport Corporation',
        apiUrl: 'https://mtc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#1abc9c', secondary: '#16a085' }
      },
      {
        id: 'tnstc',
        name: 'TNSTC',
        fullName: 'Tamil Nadu State Transport Corporation',
        apiUrl: 'https://tnstc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#f1c40f', secondary: '#f39c12' }
      }
    ]
  },
  'hyderabad': {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    mapCenter: { lat: 17.3850, lng: 78.4867, zoom: 11 },
    providers: [
      {
        id: 'tsrtc',
        name: 'TSRTC',
        fullName: 'Telangana State Road Transport Corporation',
        apiUrl: 'https://tsrtc-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#e74c3c', secondary: '#c0392b' }
      }
    ]
  },
  'pune': {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    mapCenter: { lat: 18.5204, lng: 73.8567, zoom: 11 },
    providers: [
      {
        id: 'pmpml',
        name: 'PMPML',
        fullName: 'Pune Mahanagar Parivahan Mahamandal Limited',
        apiUrl: 'https://pmpml-api.onrender.com/api',
        isActive: true,
        colorScheme: { primary: '#9b59b6', secondary: '#8e44ad' }
      }
    ]
  }
};

// Common types used across all cities
export interface CityBus {
  id: string;
  cityId: string;
  providerId: string;
  routeId: string;
  routeName: string;
  vehicleNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number;
  lastUpdated: string;
  crowdLevel: 'Low' | 'Medium' | 'High';
  crowdPercentage: number;
  isActive: boolean;
}

export interface CityRoute {
  id: string;
  cityId: string;
  providerId: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  via: string;
  distance: number;
  duration: string;
  frequency: string;
  fare: {
    minimum: number;
    maximum: number;
    currency: string;
  };
  stops: CityStop[];
  isActive: boolean;
}

export interface CityStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  amenities?: string[];
}

// City Provider Service
export class CityProviderService {
  private axiosInstances: Record<string, ReturnType<typeof axios.create>> = {};

  constructor() {
    this.initializeAxiosInstances();
  }

  private initializeAxiosInstances() {
    Object.values(INDIAN_CITIES).forEach(city => {
      city.providers.forEach(provider => {
        if (provider.isActive) {
          this.axiosInstances[provider.id] = axios.create({
            baseURL: provider.apiUrl,
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'WhereIsMyBusIndia/1.0'
            }
          });
        }
      });
    });
  }

  // Get all supported cities
  getAllCities(): CityConfig[] {
    return Object.values(INDIAN_CITIES);
  }

  // Get city by ID
  getCityById(cityId: string): CityConfig | undefined {
    return INDIAN_CITIES[cityId];
  }

  // Get cities by state
  getCitiesByState(state: string): CityConfig[] {
    return Object.values(INDIAN_CITIES).filter(city => 
      city.state.toLowerCase() === state.toLowerCase()
    );
  }

  // Get provider by ID
  getProviderById(providerId: string): TransportProvider | undefined {
    for (const city of Object.values(INDIAN_CITIES)) {
      const provider = city.providers.find(p => p.id === providerId);
      if (provider) return provider;
    }
    return undefined;
  }

  // Auto-detect city based on coordinates
  detectCity(lat: number, lng: number): CityConfig | undefined {
    const threshold = 0.5; // Degree threshold for city detection
    
    return Object.values(INDIAN_CITIES).find(city => {
      const distance = Math.sqrt(
        Math.pow(city.coordinates.lat - lat, 2) + 
        Math.pow(city.coordinates.lng - lng, 2)
      );
      return distance < threshold;
    });
  }

  // Get buses for a specific city and provider
  async getBuses(cityId: string, providerId?: string): Promise<CityBus[]> {
    const city = this.getCityById(cityId);
    if (!city) throw new Error(`City not found: ${cityId}`);

    const providers = providerId 
      ? city.providers.filter(p => p.id === providerId)
      : city.providers;

    const busPromises = providers.map(provider => 
      this.fetchBusesFromProvider(cityId, provider)
    );

    const results = await Promise.allSettled(busPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<CityBus[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);
  }

  // Get routes for a specific city and provider
  async getRoutes(cityId: string, providerId?: string): Promise<CityRoute[]> {
    const city = this.getCityById(cityId);
    if (!city) throw new Error(`City not found: ${cityId}`);

    const providers = providerId 
      ? city.providers.filter(p => p.id === providerId)
      : city.providers;

    const routePromises = providers.map(provider => 
      this.fetchRoutesFromProvider(cityId, provider)
    );

    const results = await Promise.allSettled(routePromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<CityRoute[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);
  }

  // Search routes across a city
  async searchRoutes(cityId: string, query: string): Promise<CityRoute[]> {
    const routes = await this.getRoutes(cityId);
    
    return routes.filter(route => 
      route.routeName.toLowerCase().includes(query.toLowerCase()) ||
      route.routeNumber.toLowerCase().includes(query.toLowerCase()) ||
      route.source.toLowerCase().includes(query.toLowerCase()) ||
      route.destination.toLowerCase().includes(query.toLowerCase()) ||
      route.via.toLowerCase().includes(query.toLowerCase())
    );
  }

  private async fetchBusesFromProvider(cityId: string, provider: TransportProvider): Promise<CityBus[]> {
    try {
      const axiosInstance = this.axiosInstances[provider.id];
      if (!axiosInstance) {
        throw new Error(`No axios instance for provider: ${provider.id}`);
      }

      const response = await axiosInstance.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId,
        providerId: provider.id,
        crowdLevel: bus.crowdLevel || this.estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || this.estimateCrowdPercentage(),
        isActive: bus.isActive !== undefined ? bus.isActive : true
      }));
    } catch (error) {
      console.error(`Error fetching buses from ${provider.name}:`, error);
      return this.generateMockBuses(cityId, provider.id, 5);
    }
  }

  private async fetchRoutesFromProvider(cityId: string, provider: TransportProvider): Promise<CityRoute[]> {
    try {
      const axiosInstance = this.axiosInstances[provider.id];
      if (!axiosInstance) {
        throw new Error(`No axios instance for provider: ${provider.id}`);
      }

      const response = await axiosInstance.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId,
        providerId: provider.id,
        fare: route.fare || this.estimateFare(route.distance || 10),
        isActive: route.isActive !== undefined ? route.isActive : true
      }));
    } catch (error) {
      console.error(`Error fetching routes from ${provider.name}:`, error);
      return this.generateMockRoutes(cityId, provider.id, 3);
    }
  }

  // Helper functions for mock data
  private estimateCrowdLevel(): 'Low' | 'Medium' | 'High' {
    const random = Math.random();
    if (random < 0.33) return 'Low';
    if (random < 0.66) return 'Medium';
    return 'High';
  }

  private estimateCrowdPercentage(): number {
    return Math.floor(Math.random() * 100);
  }

  private estimateFare(distance: number) {
    const baseRate = 5; // Base fare in INR
    const perKmRate = 2; // Per km rate in INR
    const minimum = baseRate;
    const maximum = baseRate + (distance * perKmRate);
    
    return {
      minimum,
      maximum,
      currency: 'INR'
    };
  }

  private generateMockBuses(cityId: string, providerId: string, count: number): CityBus[] {
    const city = this.getCityById(cityId);
    if (!city) return [];

    return Array.from({ length: count }, (_, i) => ({
      id: `${providerId}-bus-${i + 1}`,
      cityId,
      providerId,
      routeId: `${providerId}-route-${i + 1}`,
      routeName: `Route ${i + 1}`,
      vehicleNumber: `${providerId.toUpperCase()}-${1000 + i}`,
      latitude: city.coordinates.lat + (Math.random() - 0.5) * 0.1,
      longitude: city.coordinates.lng + (Math.random() - 0.5) * 0.1,
      speed: Math.floor(Math.random() * 50) + 10,
      heading: Math.floor(Math.random() * 360),
      lastUpdated: new Date().toISOString(),
      crowdLevel: this.estimateCrowdLevel(),
      crowdPercentage: this.estimateCrowdPercentage(),
      isActive: true
    }));
  }

  private generateMockRoutes(cityId: string, providerId: string, count: number): CityRoute[] {
    const city = this.getCityById(cityId);
    if (!city) return [];

    const mockLocations = [
      'Central Station', 'Airport', 'Bus Stand', 'City Center', 'Tech Park',
      'University', 'Hospital', 'Mall', 'Stadium', 'Railway Station'
    ];

    return Array.from({ length: count }, (_, i) => {
      const source = mockLocations[i % mockLocations.length];
      const destination = mockLocations[(i + 1) % mockLocations.length];
      const distance = Math.floor(Math.random() * 20) + 5;
      
      return {
        id: `${providerId}-route-${i + 1}`,
        cityId,
        providerId,
        routeNumber: `${(i + 1) * 10}`,
        routeName: `${source} - ${destination}`,
        source,
        destination,
        via: 'Main Road',
        distance,
        duration: `${Math.floor(distance * 2.5)} mins`,
        frequency: '10-15 mins',
        fare: this.estimateFare(distance),
        stops: this.generateMockStops(3),
        isActive: true
      };
    });
  }

  private generateMockStops(count: number): CityStop[] {
    const stopNames = ['Main Stop', 'Junction', 'Circle', 'Cross', 'Terminal'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `stop-${i + 1}`,
      name: `${stopNames[i % stopNames.length]} ${i + 1}`,
      latitude: 12.9716 + (Math.random() - 0.5) * 0.05,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.05,
      address: `Address ${i + 1}, City`,
      amenities: ['Shelter', 'Seating'].slice(0, Math.floor(Math.random() * 2) + 1)
    }));
  }
}

// Export singleton instance
export const cityProviderService = new CityProviderService();
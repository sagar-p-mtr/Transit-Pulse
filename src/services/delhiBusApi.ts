import axios from 'axios';
import { CityBus, CityRoute, CityStop } from './cityProvider';
import { isLiveDataEnabled } from '../config/runtime';

// Delhi Transport Corporation API Service
// Using local mock data only - external APIs removed
const DTC_API_BASE_URL = '';
const CLUSTER_API_BASE_URL = '';

// Types specific to Delhi transport
export interface DTCBus extends CityBus {
  busType: 'AC' | 'Non-AC' | 'Low Floor' | 'CNG';
  depot: string;
  fleetNumber: string;
}

export interface DTCRoute extends CityRoute {
  serviceType: 'Ordinary' | 'Express' | 'AC';
  operationalHours: {
    start: string;
    end: string;
  };
}

// Create axios instances
const dtcAxios = axios.create({
  baseURL: DTC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'WhereIsMyBusIndia/1.0'
  }
});

const clusterAxios = axios.create({
  baseURL: CLUSTER_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'WhereIsMyBusIndia/1.0'
  }
});

// Delhi Bus API Service
export const delhiBusApi = {
  // Get all DTC buses
  getAllDTCBuses: async (): Promise<DTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockDTCBuses(10);
    }
    try {
      const response = await dtcAxios.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'delhi',
        providerId: 'dtc',
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching DTC buses:', error);
      return generateMockDTCBuses(10);
    }
  },

  // Get all Cluster buses
  getAllClusterBuses: async (): Promise<DTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockClusterBuses(8);
    }
    try {
      const response = await clusterAxios.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'delhi',
        providerId: 'cluster',
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching Cluster buses:', error);
      return generateMockClusterBuses(8);
    }
  },

  // Get all Delhi buses (DTC + Cluster)
  getAllBuses: async (): Promise<DTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return [...generateMockDTCBuses(10), ...generateMockClusterBuses(8)];
    }
    try {
      const [dtcBuses, clusterBuses] = await Promise.all([
        delhiBusApi.getAllDTCBuses(),
        delhiBusApi.getAllClusterBuses()
      ]);
      
      return [...dtcBuses, ...clusterBuses];
    } catch (error) {
      console.error('Error fetching all Delhi buses:', error);
      return [...generateMockDTCBuses(10), ...generateMockClusterBuses(8)];
    }
  },

  // Get DTC routes
  getDTCRoutes: async (): Promise<DTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockDTCRoutes(12);
    }
    try {
      const response = await dtcAxios.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'delhi',
        providerId: 'dtc',
        serviceType: route.serviceType || 'Ordinary',
        operationalHours: route.operationalHours || { start: '05:00', end: '23:00' },
        fare: route.fare || generateDelhiFare(route.distance || 15),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching DTC routes:', error);
      return generateMockDTCRoutes(12);
    }
  },

  // Get Cluster routes
  getClusterRoutes: async (): Promise<DTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockClusterRoutes(8);
    }
    try {
      const response = await clusterAxios.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'delhi',
        providerId: 'cluster',
        serviceType: route.serviceType || 'Ordinary',
        operationalHours: route.operationalHours || { start: '06:00', end: '22:00' },
        fare: route.fare || generateDelhiFare(route.distance || 12),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching Cluster routes:', error);
      return generateMockClusterRoutes(8);
    }
  },

  // Get all Delhi routes
  getAllRoutes: async (): Promise<DTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return [...generateMockDTCRoutes(12), ...generateMockClusterRoutes(8)];
    }
    try {
      const [dtcRoutes, clusterRoutes] = await Promise.all([
        delhiBusApi.getDTCRoutes(),
        delhiBusApi.getClusterRoutes()
      ]);
      
      return [...dtcRoutes, ...clusterRoutes];
    } catch (error) {
      console.error('Error fetching all Delhi routes:', error);
      return [...generateMockDTCRoutes(12), ...generateMockClusterRoutes(8)];
    }
  },

  // Search routes in Delhi
  searchRoutes: async (query: string): Promise<DTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      const allRoutes = await delhiBusApi.getAllRoutes();
      return allRoutes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
    try {
      const [dtcResults, clusterResults] = await Promise.all([
        dtcAxios.get('/routes/search', { params: { q: query } }),
        clusterAxios.get('/routes/search', { params: { q: query } })
      ]);
      
      const allResults = [
        ...dtcResults.data.map((route: any) => ({ ...route, providerId: 'dtc' })),
        ...clusterResults.data.map((route: any) => ({ ...route, providerId: 'cluster' }))
      ];
      
      return allResults.map((route: any) => ({
        ...route,
        cityId: 'delhi',
        serviceType: route.serviceType || 'Ordinary',
        operationalHours: route.operationalHours || { start: '05:00', end: '23:00' },
        fare: route.fare || generateDelhiFare(route.distance || 10),
        isActive: true
      }));
    } catch (error) {
      console.error('Error searching Delhi routes:', error);
      const allRoutes = await delhiBusApi.getAllRoutes();
      return allRoutes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Get buses by route
  getBusesByRoute: async (routeId: string): Promise<DTCBus[]> => {
    if (!isLiveDataEnabled()) {
      const provider = routeId.startsWith('dtc-') ? 'dtc' : 'cluster';
      return provider === 'dtc' ? generateMockDTCBuses(3) : generateMockClusterBuses(3);
    }
    try {
      const provider = routeId.startsWith('dtc-') ? 'dtc' : 'cluster';
      const axiosInstance = provider === 'dtc' ? dtcAxios : clusterAxios;
      
      const response = await axiosInstance.get(`/routes/${routeId}/buses`);
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'delhi',
        providerId: provider,
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error(`Error fetching buses for route ${routeId}:`, error);
      const provider = routeId.startsWith('dtc-') ? 'dtc' : 'cluster';
      return provider === 'dtc' ? generateMockDTCBuses(3) : generateMockClusterBuses(3);
    }
  }
};

// Helper functions
function estimateCrowdLevel(): 'Low' | 'Medium' | 'High' {
  const random = Math.random();
  if (random < 0.33) return 'Low';
  if (random < 0.66) return 'Medium';
  return 'High';
}

function estimateCrowdPercentage(): number {
  return Math.floor(Math.random() * 100);
}

function generateDelhiFare(distance: number) {
  // Delhi bus fare structure
  const baseFare = 10; // Base fare in INR
  const perKmRate = 1.5; // Per km rate in INR
  const minimum = baseFare;
  const maximum = Math.min(baseFare + (distance * perKmRate), 25); // Max fare cap
  
  return {
    minimum,
    maximum,
    currency: 'INR'
  };
}

function generateMockDTCBuses(count: number): DTCBus[] {
  const delhiCenter = { lat: 28.6139, lng: 77.2090 };
  const busTypes: ('AC' | 'Non-AC' | 'Low Floor' | 'CNG')[] = ['AC', 'Non-AC', 'Low Floor', 'CNG'];
  const depots = ['Rajghat', 'Anand Vihar', 'Sarai Kale Khan', 'IP Estate', 'Nehru Place'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `dtc-bus-${i + 1}`,
    cityId: 'delhi',
    providerId: 'dtc',
    routeId: `dtc-route-${i + 1}`,
    routeName: `DTC Route ${i + 1}`,
    vehicleNumber: `DL-1P-${1000 + i}`,
    latitude: delhiCenter.lat + (Math.random() - 0.5) * 0.1,
    longitude: delhiCenter.lng + (Math.random() - 0.5) * 0.1,
    speed: Math.floor(Math.random() * 40) + 15,
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date().toISOString(),
    crowdLevel: estimateCrowdLevel(),
    crowdPercentage: estimateCrowdPercentage(),
    isActive: true,
    busType: busTypes[i % busTypes.length],
    depot: depots[i % depots.length],
    fleetNumber: `DTC-${1000 + i}`
  }));
}

function generateMockClusterBuses(count: number): DTCBus[] {
  const delhiCenter = { lat: 28.6139, lng: 77.2090 };
  const busTypes: ('AC' | 'Non-AC' | 'Low Floor' | 'CNG')[] = ['Non-AC', 'CNG', 'Low Floor'];
  const operators = ['DIMTS', 'Delhi Integrated', 'Cluster Operator'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `cluster-bus-${i + 1}`,
    cityId: 'delhi',
    providerId: 'cluster',
    routeId: `cluster-route-${i + 1}`,
    routeName: `Cluster Route ${i + 1}`,
    vehicleNumber: `DL-1C-${2000 + i}`,
    latitude: delhiCenter.lat + (Math.random() - 0.5) * 0.1,
    longitude: delhiCenter.lng + (Math.random() - 0.5) * 0.1,
    speed: Math.floor(Math.random() * 35) + 10,
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date().toISOString(),
    crowdLevel: estimateCrowdLevel(),
    crowdPercentage: estimateCrowdPercentage(),
    isActive: true,
    busType: busTypes[i % busTypes.length],
    depot: operators[i % operators.length],
    fleetNumber: `CLU-${2000 + i}`
  }));
}

function generateMockDTCRoutes(count: number): DTCRoute[] {
  const delhiLocations = [
    'Connaught Place', 'Red Fort', 'India Gate', 'Jantar Mantar', 'Karol Bagh',
    'Lajpat Nagar', 'Nehru Place', 'Dwarka', 'Rohini', 'Laxmi Nagar',
    'Anand Vihar', 'New Delhi Railway Station', 'Old Delhi Railway Station'
  ];
  
  const serviceTypes: ('Ordinary' | 'Express' | 'AC')[] = ['Ordinary', 'Express', 'AC'];
  
  return Array.from({ length: count }, (_, i) => {
    const source = delhiLocations[i % delhiLocations.length];
    const destination = delhiLocations[(i + 1) % delhiLocations.length];
    const distance = Math.floor(Math.random() * 25) + 8;
    
    return {
      id: `dtc-route-${i + 1}`,
      cityId: 'delhi',
      providerId: 'dtc',
      routeNumber: `${(i + 1) * 100}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: 'Ring Road',
      distance,
      duration: `${Math.floor(distance * 3)} mins`,
      frequency: '8-12 mins',
      fare: generateDelhiFare(distance),
      stops: generateDelhiStops(4),
      isActive: true,
      serviceType: serviceTypes[i % serviceTypes.length],
      operationalHours: { start: '05:00', end: '23:00' }
    };
  });
}

function generateMockClusterRoutes(count: number): DTCRoute[] {
  const delhiLocations = [
    'Gurgaon', 'Faridabad', 'Noida', 'Ghaziabad', 'Badarpur',
    'Mayur Vihar', 'Yamuna Vihar', 'Shahdara', 'Dilshad Garden'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const source = delhiLocations[i % delhiLocations.length];
    const destination = 'ISBT Kashmere Gate';
    const distance = Math.floor(Math.random() * 20) + 10;
    
    return {
      id: `cluster-route-${i + 1}`,
      cityId: 'delhi',
      providerId: 'cluster',
      routeNumber: `C-${i + 1}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: 'NH-24/NH-1',
      distance,
      duration: `${Math.floor(distance * 3.5)} mins`,
      frequency: '10-15 mins',
      fare: generateDelhiFare(distance),
      stops: generateDelhiStops(3),
      isActive: true,
      serviceType: 'Ordinary',
      operationalHours: { start: '06:00', end: '22:00' }
    };
  });
}

function generateDelhiStops(count: number): CityStop[] {
  const stopNames = ['Metro Station', 'Bus Terminal', 'Market', 'Hospital', 'School'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `delhi-stop-${i + 1}`,
    name: `${stopNames[i % stopNames.length]} ${i + 1}`,
    latitude: 28.6139 + (Math.random() - 0.5) * 0.05,
    longitude: 77.2090 + (Math.random() - 0.5) * 0.05,
    address: `Delhi ${i + 1}`,
    amenities: ['Shelter', 'Digital Display', 'CCTV'].slice(0, Math.floor(Math.random() * 3) + 1)
  }));
}

export default delhiBusApi;

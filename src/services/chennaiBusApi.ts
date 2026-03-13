import axios from 'axios';
import { CityBus, CityRoute, CityStop } from './cityProvider';
import { isLiveDataEnabled } from '../config/runtime';

// Chennai MTC API Service
// Using local mock data only - external APIs removed
const MTC_API_BASE_URL = '';
const TNSTC_API_BASE_URL = '';

// Types specific to Chennai transport
export interface MTCBus extends CityBus {
  busType: 'AC' | 'Non-AC' | 'Deluxe' | 'Express' | 'Ordinary' | 'Electric';
  depot: string;
  fleetNumber: string;
  serviceType: 'Metropolitan' | 'Express' | 'Deluxe' | 'Ordinary';
  division: string;
}

export interface MTCRoute extends CityRoute {
  serviceCategory: 'Metropolitan' | 'Express' | 'Deluxe' | 'Ordinary' | 'Special';
  division: string;
  operationalHours: {
    start: string;
    end: string;
  };
  direction: 'UP' | 'DOWN' | 'CIRCULAR';
}

// Create axios instances
const mtcAxios = axios.create({
  baseURL: MTC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'TransitPulse/1.0'
  }
});

const tnstcAxios = axios.create({
  baseURL: TNSTC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'TransitPulse/1.0'
  }
});

// Chennai Bus API Service
export const chennaiBusApi = {
  // Get all MTC buses
  getAllMTCBuses: async (): Promise<MTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockMTCBuses(18);
    }
    try {
      const response = await mtcAxios.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'chennai',
        providerId: 'mtc',
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown Depot',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        serviceType: bus.serviceType || 'Ordinary',
        division: bus.division || 'Central',
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching MTC buses:', error);
      return generateMockMTCBuses(18);
    }
  },

  // Get all TNSTC buses in Chennai region
  getAllTNSTCBuses: async (): Promise<MTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockTNSTCBuses(10);
    }
    try {
      const response = await tnstcAxios.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'chennai',
        providerId: 'tnstc',
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Chennai Region',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        serviceType: bus.serviceType || 'Express',
        division: bus.division || 'Chennai',
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching TNSTC buses:', error);
      return generateMockTNSTCBuses(10);
    }
  },

  // Get all Chennai buses (MTC + TNSTC)
  getAllBuses: async (): Promise<MTCBus[]> => {
    if (!isLiveDataEnabled()) {
      return [...generateMockMTCBuses(18), ...generateMockTNSTCBuses(10)];
    }
    try {
      const [mtcBuses, tnstcBuses] = await Promise.all([
        chennaiBusApi.getAllMTCBuses(),
        chennaiBusApi.getAllTNSTCBuses()
      ]);
      
      return [...mtcBuses, ...tnstcBuses];
    } catch (error) {
      console.error('Error fetching all Chennai buses:', error);
      return [...generateMockMTCBuses(18), ...generateMockTNSTCBuses(10)];
    }
  },

  // Get MTC routes
  getMTCRoutes: async (): Promise<MTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockMTCRoutes(25);
    }
    try {
      const response = await mtcAxios.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'chennai',
        providerId: 'mtc',
        serviceCategory: route.serviceCategory || 'Ordinary',
        division: route.division || 'Central',
        operationalHours: route.operationalHours || { start: '05:00', end: '23:00' },
        direction: route.direction || 'UP',
        fare: route.fare || generateChennaiFare(route.distance || 15),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching MTC routes:', error);
      return generateMockMTCRoutes(25);
    }
  },

  // Get TNSTC routes
  getTNSTCRoutes: async (): Promise<MTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockTNSTCRoutes(15);
    }
    try {
      const response = await tnstcAxios.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'chennai',
        providerId: 'tnstc',
        serviceCategory: route.serviceCategory || 'Express',
        division: route.division || 'Chennai',
        operationalHours: route.operationalHours || { start: '06:00', end: '22:00' },
        direction: route.direction || 'UP',
        fare: route.fare || generateChennaiFare(route.distance || 25),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching TNSTC routes:', error);
      return generateMockTNSTCRoutes(15);
    }
  },

  // Get all Chennai routes
  getAllRoutes: async (): Promise<MTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      return [...generateMockMTCRoutes(25), ...generateMockTNSTCRoutes(15)];
    }
    try {
      const [mtcRoutes, tnstcRoutes] = await Promise.all([
        chennaiBusApi.getMTCRoutes(),
        chennaiBusApi.getTNSTCRoutes()
      ]);
      
      return [...mtcRoutes, ...tnstcRoutes];
    } catch (error) {
      console.error('Error fetching all Chennai routes:', error);
      return [...generateMockMTCRoutes(25), ...generateMockTNSTCRoutes(15)];
    }
  },

  // Search routes in Chennai
  searchRoutes: async (query: string): Promise<MTCRoute[]> => {
    try {
      const [mtcResults, tnstcResults] = await Promise.all([
        mtcAxios.get('/routes/search', { params: { q: query } }),
        tnstcAxios.get('/routes/search', { params: { q: query } })
      ]);
      
      const allResults = [
        ...mtcResults.data.map((route: any) => ({ ...route, providerId: 'mtc' })),
        ...tnstcResults.data.map((route: any) => ({ ...route, providerId: 'tnstc' }))
      ];
      
      return allResults.map((route: any) => ({
        ...route,
        cityId: 'chennai',
        serviceCategory: route.serviceCategory || 'Ordinary',
        division: route.division || 'Central',
        operationalHours: route.operationalHours || { start: '05:00', end: '23:00' },
        direction: route.direction || 'UP',
        fare: route.fare || generateChennaiFare(route.distance || 15),
        isActive: true
      }));
    } catch (error) {
      console.error('Error searching Chennai routes:', error);
      const allRoutes = await chennaiBusApi.getAllRoutes();
      return allRoutes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.routeNumber.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Get buses by route
  getBusesByRoute: async (routeId: string): Promise<MTCBus[]> => {
    if (!isLiveDataEnabled()) {
      const provider = routeId.startsWith('mtc-') ? 'mtc' : 'tnstc';
      return provider === 'mtc' ? generateMockMTCBuses(4) : generateMockTNSTCBuses(4);
    }
    try {
      const provider = routeId.startsWith('mtc-') ? 'mtc' : 'tnstc';
      const axiosInstance = provider === 'mtc' ? mtcAxios : tnstcAxios;
      
      const response = await axiosInstance.get(`/routes/${routeId}/buses`);
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'chennai',
        providerId: provider,
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        serviceType: bus.serviceType || 'Ordinary',
        division: bus.division || 'Central',
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error(`Error fetching buses for route ${routeId}:`, error);
      const provider = routeId.startsWith('mtc-') ? 'mtc' : 'tnstc';
      return provider === 'mtc' ? generateMockMTCBuses(4) : generateMockTNSTCBuses(4);
    }
  },

  // Get routes by division
  getRoutesByDivision: async (division: string): Promise<MTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      const allRoutes = await chennaiBusApi.getMTCRoutes();
      return allRoutes.filter(route => 
        route.division.toLowerCase().includes(division.toLowerCase())
      );
    }
    try {
      const response = await mtcAxios.get(`/routes/division/${division}`);
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'chennai',
        providerId: 'mtc',
        serviceCategory: route.serviceCategory || 'Ordinary',
        division: division,
        operationalHours: route.operationalHours || { start: '05:00', end: '23:00' },
        direction: route.direction || 'UP',
        fare: route.fare || generateChennaiFare(route.distance || 15),
        isActive: true
      }));
    } catch (error) {
      console.error(`Error fetching routes for division ${division}:`, error);
      const allRoutes = await chennaiBusApi.getMTCRoutes();
      return allRoutes.filter(route => 
        route.division.toLowerCase().includes(division.toLowerCase())
      );
    }
  },

  // Get routes by service type
  getRoutesByServiceType: async (serviceType: string): Promise<MTCRoute[]> => {
    if (!isLiveDataEnabled()) {
      const allRoutes = await chennaiBusApi.getMTCRoutes();
      return allRoutes.filter(route => 
        route.serviceCategory.toLowerCase().includes(serviceType.toLowerCase())
      );
    }
    try {
      const response = await mtcAxios.get(`/routes/service/${serviceType}`);
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'chennai',
        providerId: 'mtc',
        serviceCategory: serviceType,
        division: route.division || 'Central',
        operationalHours: route.operationalHours || { start: '05:00', end: '23:00' },
        direction: route.direction || 'UP',
        fare: route.fare || generateChennaiFare(route.distance || 15),
        isActive: true
      }));
    } catch (error) {
      console.error(`Error fetching routes for service type ${serviceType}:`, error);
      const allRoutes = await chennaiBusApi.getMTCRoutes();
      return allRoutes.filter(route => 
        route.serviceCategory.toLowerCase().includes(serviceType.toLowerCase())
      );
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

function generateChennaiFare(distance: number) {
  // Chennai MTC fare structure
  const baseFare = 5; // Base fare in INR
  const perKmRate = 1.0; // Per km rate in INR
  const minimum = baseFare;
  const maximum = Math.min(baseFare + (distance * perKmRate), 20); // Max fare cap
  
  return {
    minimum,
    maximum,
    currency: 'INR'
  };
}

function generateMockMTCBuses(count: number): MTCBus[] {
  const chennaiCenter = { lat: 13.0827, lng: 80.2707 };
  const busTypes: ('AC' | 'Non-AC' | 'Deluxe' | 'Express' | 'Ordinary' | 'Electric')[] = 
    ['AC', 'Non-AC', 'Deluxe', 'Express', 'Ordinary', 'Electric'];
  const serviceTypes: ('Metropolitan' | 'Express' | 'Deluxe' | 'Ordinary')[] = 
    ['Metropolitan', 'Express', 'Deluxe', 'Ordinary'];
  const divisions = ['Central', 'North', 'South', 'West', 'East'];
  const depots = ['Broadway', 'Tambaram', 'Adyar', 'Anna Nagar', 'Avadi', 'Chromepet'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `mtc-bus-${i + 1}`,
    cityId: 'chennai',
    providerId: 'mtc',
    routeId: `mtc-route-${i + 1}`,
    routeName: `MTC Route ${i + 1}`,
    vehicleNumber: `TN-09-${5000 + i}`,
    latitude: chennaiCenter.lat + (Math.random() - 0.5) * 0.15,
    longitude: chennaiCenter.lng + (Math.random() - 0.5) * 0.15,
    speed: Math.floor(Math.random() * 40) + 15,
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date().toISOString(),
    crowdLevel: estimateCrowdLevel(),
    crowdPercentage: estimateCrowdPercentage(),
    isActive: true,
    busType: busTypes[i % busTypes.length],
    depot: depots[i % depots.length],
    fleetNumber: `MTC-${5000 + i}`,
    serviceType: serviceTypes[i % serviceTypes.length],
    division: divisions[i % divisions.length]
  }));
}

function generateMockTNSTCBuses(count: number): MTCBus[] {
  const chennaiCenter = { lat: 13.0827, lng: 80.2707 };
  const busTypes: ('AC' | 'Non-AC' | 'Deluxe' | 'Express' | 'Ordinary' | 'Electric')[] = 
    ['AC', 'Non-AC', 'Express'];
  const serviceTypes: ('Metropolitan' | 'Express' | 'Deluxe' | 'Ordinary')[] = 
    ['Express', 'Deluxe'];
  const divisions = ['Chennai', 'Villupuram', 'Chengalpattu'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `tnstc-bus-${i + 1}`,
    cityId: 'chennai',
    providerId: 'tnstc',
    routeId: `tnstc-route-${i + 1}`,
    routeName: `TNSTC Route ${i + 1}`,
    vehicleNumber: `TN-05-${6000 + i}`,
    latitude: chennaiCenter.lat + (Math.random() - 0.5) * 0.2,
    longitude: chennaiCenter.lng + (Math.random() - 0.5) * 0.2,
    speed: Math.floor(Math.random() * 55) + 25,
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date().toISOString(),
    crowdLevel: estimateCrowdLevel(),
    crowdPercentage: estimateCrowdPercentage(),
    isActive: true,
    busType: busTypes[i % busTypes.length],
    depot: `TNSTC ${divisions[i % divisions.length]}`,
    fleetNumber: `TNSTC-${6000 + i}`,
    serviceType: serviceTypes[i % serviceTypes.length],
    division: divisions[i % divisions.length]
  }));
}

function generateMockMTCRoutes(count: number): MTCRoute[] {
  const chennaiLocations = [
    'Central Railway Station', 'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery',
    'Tambaram', 'Chromepet', 'Guindy', 'Nandanam', 'Mylapore', 'Triplicane',
    'Broadway', 'Egmore', 'Kilpauk', 'Kodambakkam', 'Saidapet', 'Vadapalani',
    'Ashok Nagar', 'K.K. Nagar', 'Porur', 'Avadi', 'Red Hills'
  ];
  
  const serviceCategories: ('Metropolitan' | 'Express' | 'Deluxe' | 'Ordinary' | 'Special')[] = 
    ['Metropolitan', 'Express', 'Deluxe', 'Ordinary'];
  
  const divisions = ['Central', 'North', 'South', 'West', 'East'];
  const directions: ('UP' | 'DOWN' | 'CIRCULAR')[] = ['UP', 'DOWN', 'CIRCULAR'];
  
  return Array.from({ length: count }, (_, i) => {
    const source = chennaiLocations[i % chennaiLocations.length];
    const destination = chennaiLocations[(i + 1) % chennaiLocations.length];
    const distance = Math.floor(Math.random() * 25) + 5;
    
    return {
      id: `mtc-route-${i + 1}`,
      cityId: 'chennai',
      providerId: 'mtc',
      routeNumber: `${i + 1}${String.fromCharCode(65 + (i % 26))}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: 'Main Road/GST Road',
      distance,
      duration: `${Math.floor(distance * 3.5)} mins`,
      frequency: '7-12 mins',
      fare: generateChennaiFare(distance),
      stops: generateChennaiStops(6),
      isActive: true,
      serviceCategory: serviceCategories[i % serviceCategories.length],
      division: divisions[i % divisions.length],
      operationalHours: { start: '05:00', end: '23:00' },
      direction: directions[i % directions.length]
    };
  });
}

function generateMockTNSTCRoutes(count: number): MTCRoute[] {
  const satelliteLocations = [
    'Kanchipuram', 'Mahabalipuram', 'Chengalpattu', 'Villupuram', 'Cuddalore',
    'Pondicherry', 'Vellore', 'Tiruvannamalai', 'Kancheepuram', 'Arakkonam',
    'Poonamallee', 'Sriperumbudur', 'Melmaruvathur'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const source = satelliteLocations[i % satelliteLocations.length];
    const destination = 'Chennai Central';
    const distance = Math.floor(Math.random() * 50) + 20;
    
    return {
      id: `tnstc-route-${i + 1}`,
      cityId: 'chennai',
      providerId: 'tnstc',
      routeNumber: `TNS-${i + 1}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: 'GST Road/ECR',
      distance,
      duration: `${Math.floor(distance * 2.5)} mins`,
      frequency: '20-30 mins',
      fare: generateChennaiFare(distance),
      stops: generateChennaiStops(4),
      isActive: true,
      serviceCategory: 'Express',
      division: 'Chennai',
      operationalHours: { start: '06:00', end: '22:00' },
      direction: 'UP'
    };
  });
}

function generateChennaiStops(count: number): CityStop[] {
  const stopNames = ['Junction', 'Bus Stand', 'Railway Station', 'Market', 'Hospital'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `chennai-stop-${i + 1}`,
    name: `${stopNames[i % stopNames.length]} ${i + 1}`,
    latitude: 13.0827 + (Math.random() - 0.5) * 0.1,
    longitude: 80.2707 + (Math.random() - 0.5) * 0.1,
    address: `Chennai ${i + 1}`,
    amenities: ['Shelter', 'Digital Board', 'Seating', 'Water'].slice(0, Math.floor(Math.random() * 4) + 1)
  }));
}

export default chennaiBusApi;

import axios from 'axios';
import { CityBus, CityRoute, CityStop } from './cityProvider';
import { isLiveDataEnabled } from '../config/runtime';

// Mumbai BEST API Service
const BEST_API_BASE_URL = 'https://best-api.onrender.com/api';
const MSRTC_API_BASE_URL = 'https://msrtc-api.onrender.com/api';

// Types specific to Mumbai transport
export interface BESTBus extends CityBus {
  busType: 'AC' | 'Non-AC' | 'Electric' | 'CNG' | 'MIDI';
  depot: string;
  fleetNumber: string;
  serviceType: 'Limited' | 'Ordinary' | 'Express' | 'Night';
}

export interface BESTRoute extends CityRoute {
  serviceCategory: 'Limited' | 'Ordinary' | 'Express' | 'Night' | 'Festival';
  zoneInfo: {
    startZone: string;
    endZone: string;
  };
  operationalHours: {
    start: string;
    end: string;
  };
}

// Create axios instances
const bestAxios = axios.create({
  baseURL: BEST_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'WhereIsMyBusIndia/1.0'
  }
});

const msrtcAxios = axios.create({
  baseURL: MSRTC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'WhereIsMyBusIndia/1.0'
  }
});

// Mumbai Bus API Service
export const mumbaiBusApi = {
  // Get all BEST buses
  getAllBESTBuses: async (): Promise<BESTBus[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockBESTBuses(15);
    }
    try {
      const response = await bestAxios.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'mumbai',
        providerId: 'best',
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown Depot',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        serviceType: bus.serviceType || 'Ordinary',
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching BEST buses:', error);
      return generateMockBESTBuses(15);
    }
  },

  // Get all MSRTC buses in Mumbai region
  getAllMSRTCBuses: async (): Promise<BESTBus[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockMSRTCBuses(8);
    }
    try {
      const response = await msrtcAxios.get('/buses');
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'mumbai',
        providerId: 'msrtc',
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Mumbai Region',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        serviceType: bus.serviceType || 'Ordinary',
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching MSRTC buses:', error);
      return generateMockMSRTCBuses(8);
    }
  },

  // Get all Mumbai buses (BEST + MSRTC)
  getAllBuses: async (): Promise<BESTBus[]> => {
    if (!isLiveDataEnabled()) {
      return [...generateMockBESTBuses(15), ...generateMockMSRTCBuses(8)];
    }
    try {
      const [bestBuses, msrtcBuses] = await Promise.all([
        mumbaiBusApi.getAllBESTBuses(),
        mumbaiBusApi.getAllMSRTCBuses()
      ]);
      
      return [...bestBuses, ...msrtcBuses];
    } catch (error) {
      console.error('Error fetching all Mumbai buses:', error);
      return [...generateMockBESTBuses(15), ...generateMockMSRTCBuses(8)];
    }
  },

  // Get BEST routes
  getBESTRoutes: async (): Promise<BESTRoute[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockBESTRoutes(20);
    }
    try {
      const response = await bestAxios.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'mumbai',
        providerId: 'best',
        serviceCategory: route.serviceCategory || 'Ordinary',
        zoneInfo: route.zoneInfo || { startZone: 'South', endZone: 'Central' },
        operationalHours: route.operationalHours || { start: '05:30', end: '23:30' },
        fare: route.fare || generateMumbaiFare(route.distance || 12),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching BEST routes:', error);
      return generateMockBESTRoutes(20);
    }
  },

  // Get MSRTC routes
  getMSRTCRoutes: async (): Promise<BESTRoute[]> => {
    if (!isLiveDataEnabled()) {
      return generateMockMSRTCRoutes(12);
    }
    try {
      const response = await msrtcAxios.get('/routes');
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'mumbai',
        providerId: 'msrtc',
        serviceCategory: route.serviceCategory || 'Express',
        zoneInfo: route.zoneInfo || { startZone: 'Mumbai', endZone: 'Satellite' },
        operationalHours: route.operationalHours || { start: '06:00', end: '22:00' },
        fare: route.fare || generateMumbaiFare(route.distance || 25),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching MSRTC routes:', error);
      return generateMockMSRTCRoutes(12);
    }
  },

  // Get all Mumbai routes
  getAllRoutes: async (): Promise<BESTRoute[]> => {
    if (!isLiveDataEnabled()) {
      return [...generateMockBESTRoutes(20), ...generateMockMSRTCRoutes(12)];
    }
    try {
      const [bestRoutes, msrtcRoutes] = await Promise.all([
        mumbaiBusApi.getBESTRoutes(),
        mumbaiBusApi.getMSRTCRoutes()
      ]);
      
      return [...bestRoutes, ...msrtcRoutes];
    } catch (error) {
      console.error('Error fetching all Mumbai routes:', error);
      return [...generateMockBESTRoutes(20), ...generateMockMSRTCRoutes(12)];
    }
  },

  // Search routes in Mumbai
  searchRoutes: async (query: string): Promise<BESTRoute[]> => {
    if (!isLiveDataEnabled()) {
      const allRoutes = await mumbaiBusApi.getAllRoutes();
      return allRoutes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.routeNumber.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
    try {
      const [bestResults, msrtcResults] = await Promise.all([
        bestAxios.get('/routes/search', { params: { q: query } }),
        msrtcAxios.get('/routes/search', { params: { q: query } })
      ]);
      
      const allResults = [
        ...bestResults.data.map((route: any) => ({ ...route, providerId: 'best' })),
        ...msrtcResults.data.map((route: any) => ({ ...route, providerId: 'msrtc' }))
      ];
      
      return allResults.map((route: any) => ({
        ...route,
        cityId: 'mumbai',
        serviceCategory: route.serviceCategory || 'Ordinary',
        zoneInfo: route.zoneInfo || { startZone: 'South', endZone: 'Central' },
        operationalHours: route.operationalHours || { start: '05:30', end: '23:30' },
        fare: route.fare || generateMumbaiFare(route.distance || 12),
        isActive: true
      }));
    } catch (error) {
      console.error('Error searching Mumbai routes:', error);
      const allRoutes = await mumbaiBusApi.getAllRoutes();
      return allRoutes.filter(route => 
        route.routeName.toLowerCase().includes(query.toLowerCase()) ||
        route.routeNumber.toLowerCase().includes(query.toLowerCase()) ||
        route.source.toLowerCase().includes(query.toLowerCase()) ||
        route.destination.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Get buses by route
  getBusesByRoute: async (routeId: string): Promise<BESTBus[]> => {
    if (!isLiveDataEnabled()) {
      const provider = routeId.startsWith('best-') ? 'best' : 'msrtc';
      return provider === 'best' ? generateMockBESTBuses(4) : generateMockMSRTCBuses(4);
    }
    try {
      const provider = routeId.startsWith('best-') ? 'best' : 'msrtc';
      const axiosInstance = provider === 'best' ? bestAxios : msrtcAxios;
      
      const response = await axiosInstance.get(`/routes/${routeId}/buses`);
      
      return response.data.map((bus: any) => ({
        ...bus,
        cityId: 'mumbai',
        providerId: provider,
        busType: bus.busType || 'Non-AC',
        depot: bus.depot || 'Unknown',
        fleetNumber: bus.fleetNumber || bus.vehicleNumber,
        serviceType: bus.serviceType || 'Ordinary',
        crowdLevel: bus.crowdLevel || estimateCrowdLevel(),
        crowdPercentage: bus.crowdPercentage || estimateCrowdPercentage(),
        isActive: true
      }));
    } catch (error) {
      console.error(`Error fetching buses for route ${routeId}:`, error);
      const provider = routeId.startsWith('best-') ? 'best' : 'msrtc';
      return provider === 'best' ? generateMockBESTBuses(4) : generateMockMSRTCBuses(4);
    }
  },

  // Get route by zone
  getRoutesByZone: async (zone: string): Promise<BESTRoute[]> => {
    if (!isLiveDataEnabled()) {
      const allRoutes = await mumbaiBusApi.getBESTRoutes();
      return allRoutes.filter(route => 
        route.zoneInfo.startZone.toLowerCase().includes(zone.toLowerCase()) ||
        route.zoneInfo.endZone.toLowerCase().includes(zone.toLowerCase())
      );
    }
    try {
      const response = await bestAxios.get(`/routes/zone/${zone}`);
      
      return response.data.map((route: any) => ({
        ...route,
        cityId: 'mumbai',
        providerId: 'best',
        serviceCategory: route.serviceCategory || 'Ordinary',
        zoneInfo: route.zoneInfo || { startZone: zone, endZone: 'Central' },
        operationalHours: route.operationalHours || { start: '05:30', end: '23:30' },
        fare: route.fare || generateMumbaiFare(route.distance || 12),
        isActive: true
      }));
    } catch (error) {
      console.error(`Error fetching routes for zone ${zone}:`, error);
      const allRoutes = await mumbaiBusApi.getBESTRoutes();
      return allRoutes.filter(route => 
        route.zoneInfo.startZone.toLowerCase().includes(zone.toLowerCase()) ||
        route.zoneInfo.endZone.toLowerCase().includes(zone.toLowerCase())
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

function generateMumbaiFare(distance: number) {
  // Mumbai BEST fare structure
  const baseFare = 8; // Base fare in INR
  const perKmRate = 1.2; // Per km rate in INR
  const minimum = baseFare;
  const maximum = Math.min(baseFare + (distance * perKmRate), 35); // Max fare cap
  
  return {
    minimum,
    maximum,
    currency: 'INR'
  };
}

function generateMockBESTBuses(count: number): BESTBus[] {
  const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
  const busTypes: ('AC' | 'Non-AC' | 'Electric' | 'CNG' | 'MIDI')[] = ['AC', 'Non-AC', 'Electric', 'CNG', 'MIDI'];
  const serviceTypes: ('Limited' | 'Ordinary' | 'Express' | 'Night')[] = ['Limited', 'Ordinary', 'Express', 'Night'];
  const depots = ['Colaba', 'Bandra', 'Kurla', 'Goregaon', 'Mulund', 'Andheri', 'Borivali'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `best-bus-${i + 1}`,
    cityId: 'mumbai',
    providerId: 'best',
    routeId: `best-route-${i + 1}`,
    routeName: `BEST Route ${i + 1}`,
    vehicleNumber: `MH-01-${3000 + i}`,
    latitude: mumbaiCenter.lat + (Math.random() - 0.5) * 0.15,
    longitude: mumbaiCenter.lng + (Math.random() - 0.5) * 0.15,
    speed: Math.floor(Math.random() * 45) + 10,
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date().toISOString(),
    crowdLevel: estimateCrowdLevel(),
    crowdPercentage: estimateCrowdPercentage(),
    isActive: true,
    busType: busTypes[i % busTypes.length],
    depot: depots[i % depots.length],
    fleetNumber: `BEST-${3000 + i}`,
    serviceType: serviceTypes[i % serviceTypes.length]
  }));
}

function generateMockMSRTCBuses(count: number): BESTBus[] {
  const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
  const busTypes: ('AC' | 'Non-AC' | 'Electric' | 'CNG' | 'MIDI')[] = ['AC', 'Non-AC', 'CNG'];
  const serviceTypes: ('Limited' | 'Ordinary' | 'Express' | 'Night')[] = ['Express', 'Ordinary'];
  const depots = ['Thane', 'Kalyan', 'Panvel', 'Vasai', 'Virar'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `msrtc-bus-${i + 1}`,
    cityId: 'mumbai',
    providerId: 'msrtc',
    routeId: `msrtc-route-${i + 1}`,
    routeName: `MSRTC Route ${i + 1}`,
    vehicleNumber: `MH-04-${4000 + i}`,
    latitude: mumbaiCenter.lat + (Math.random() - 0.5) * 0.2,
    longitude: mumbaiCenter.lng + (Math.random() - 0.5) * 0.2,
    speed: Math.floor(Math.random() * 50) + 20,
    heading: Math.floor(Math.random() * 360),
    lastUpdated: new Date().toISOString(),
    crowdLevel: estimateCrowdLevel(),
    crowdPercentage: estimateCrowdPercentage(),
    isActive: true,
    busType: busTypes[i % busTypes.length],
    depot: depots[i % depots.length],
    fleetNumber: `MSRTC-${4000 + i}`,
    serviceType: serviceTypes[i % serviceTypes.length]
  }));
}

function generateMockBESTRoutes(count: number): BESTRoute[] {
  const mumbaiLocations = [
    'Colaba', 'Churchgate', 'Fort', 'CST', 'Dadar', 'Bandra', 'Andheri',
    'Borivali', 'Malad', 'Goregaon', 'Juhu', 'Versova', 'Kurla', 'Mulund',
    'Thane', 'Powai', 'Vikhroli', 'Ghatkopar', 'Chembur'
  ];
  
  const serviceCategories: ('Limited' | 'Ordinary' | 'Express' | 'Night' | 'Festival')[] = 
    ['Limited', 'Ordinary', 'Express', 'Night'];
  
  const zones = ['South', 'Central', 'Western', 'Eastern', 'Harbor'];
  
  return Array.from({ length: count }, (_, i) => {
    const source = mumbaiLocations[i % mumbaiLocations.length];
    const destination = mumbaiLocations[(i + 1) % mumbaiLocations.length];
    const distance = Math.floor(Math.random() * 30) + 5;
    
    return {
      id: `best-route-${i + 1}`,
      cityId: 'mumbai',
      providerId: 'best',
      routeNumber: `${i + 1}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: 'SV Road/LBS Road',
      distance,
      duration: `${Math.floor(distance * 4)} mins`,
      frequency: '5-10 mins',
      fare: generateMumbaiFare(distance),
      stops: generateMumbaiStops(5),
      isActive: true,
      serviceCategory: serviceCategories[i % serviceCategories.length],
      zoneInfo: {
        startZone: zones[i % zones.length],
        endZone: zones[(i + 1) % zones.length]
      },
      operationalHours: { start: '05:30', end: '23:30' }
    };
  });
}

function generateMockMSRTCRoutes(count: number): BESTRoute[] {
  const satelliteLocations = [
    'Thane', 'Kalyan', 'Dombivli', 'Panvel', 'Vasai', 'Virar', 'Bhiwandi',
    'Ulhasnagar', 'Ambarnath', 'Badlapur', 'Karjat', 'Lonavala'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const source = satelliteLocations[i % satelliteLocations.length];
    const destination = 'Mumbai Central';
    const distance = Math.floor(Math.random() * 40) + 15;
    
    return {
      id: `msrtc-route-${i + 1}`,
      cityId: 'mumbai',
      providerId: 'msrtc',
      routeNumber: `MS-${i + 1}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: 'Eastern Express Highway',
      distance,
      duration: `${Math.floor(distance * 3)} mins`,
      frequency: '15-20 mins',
      fare: generateMumbaiFare(distance),
      stops: generateMumbaiStops(4),
      isActive: true,
      serviceCategory: 'Express',
      zoneInfo: {
        startZone: 'Satellite',
        endZone: 'Central'
      },
      operationalHours: { start: '06:00', end: '22:00' }
    };
  });
}

function generateMumbaiStops(count: number): CityStop[] {
  const stopNames = ['Station', 'Market', 'Hospital', 'Junction', 'Circle'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `mumbai-stop-${i + 1}`,
    name: `${stopNames[i % stopNames.length]} ${i + 1}`,
    latitude: 19.0760 + (Math.random() - 0.5) * 0.1,
    longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
    address: `Mumbai ${i + 1}`,
    amenities: ['Shelter', 'Digital Display', 'Seating', 'CCTV'].slice(0, Math.floor(Math.random() * 4) + 1)
  }));
}

export default mumbaiBusApi;

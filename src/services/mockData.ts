// Types
import { BMTCBus, BMTCRoute, BMTCStop } from './bmtcApi';
import { OtherBus, OtherRoute, OtherStop } from './otherBusApi';

// Helper functions for generating random data
export function getRandomLatLng(baseLocation: [number, number], radius: number = 0.1): [number, number] {
  const [baseLat, baseLng] = baseLocation;
  return [
    baseLat + (Math.random() * radius * 2 - radius),
    baseLng + (Math.random() * radius * 2 - radius)
  ];
}

export function getRandomCrowdLevel(): 'Low' | 'Medium' | 'High' {
  const random = Math.random();
  if (random < 0.33) return 'Low';
  if (random < 0.66) return 'Medium';
  return 'High';
}

export function getRandomCrowdPercentage(crowdLevel: 'Low' | 'Medium' | 'High'): number {
  switch (crowdLevel) {
    case 'Low':
      return Math.floor(Math.random() * 30) + 10; // 10-40%
    case 'Medium':
      return Math.floor(Math.random() * 25) + 40; // 40-65%
    case 'High':
      return Math.floor(Math.random() * 35) + 65; // 65-100%
  }
}

export function getRandomStatus(): 'On time' | 'Slight delay' | 'Delayed' {
  const random = Math.random();
  if (random < 0.6) return 'On time';
  if (random < 0.9) return 'Slight delay';
  return 'Delayed';
}

// City locations in India
const cityLocations: Record<string, [number, number]> = {
  'Bangalore': [12.9716, 77.5946],
  'Mysore': [12.2958, 76.6394],
  'Hyderabad': [17.3850, 78.4867],
  'Chennai': [13.0827, 80.2707],
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.6139, 77.2090],
  'Kolkata': [22.5726, 88.3639],
  'Ahmedabad': [23.0225, 72.5714],
  'Pune': [18.5204, 73.8567],
  'Jaipur': [26.9124, 75.7873]
};

// Provider-specific locations
const providerLocations: Record<string, [number, number]> = {
  'BMTC': cityLocations['Bangalore']
};

// Generate mock buses
export function generateMockBuses(count: number, provider?: string): (BMTCBus | OtherBus)[] {
  const buses: (BMTCBus | OtherBus)[] = [];
  
  // If provider is specified, use that provider for all buses
  // Otherwise, distribute buses among different providers
  const providers = provider ? [provider] : Object.keys(providerLocations);
  
  for (let i = 0; i < count; i++) {
    const busProvider = provider || providers[i % providers.length];
    const baseLocation = providerLocations[busProvider] || cityLocations['Bangalore'];
    const [latitude, longitude] = getRandomLatLng(baseLocation);
    const crowdLevel = getRandomCrowdLevel();
    
    buses.push({
      id: `${busProvider.toLowerCase()}-bus-${i + 1}`,
      provider: busProvider,
      routeId: `${busProvider.toLowerCase()}-route-${Math.floor(i / 3) + 1}`,
      routeName: `${busProvider} Route ${Math.floor(i / 3) + 1}`,
      vehicleNumber: `${busProvider.substring(0, 2)}-${1000 + i}`,
      latitude,
      longitude,
      speed: Math.floor(Math.random() * 60),
      lastUpdated: new Date().toISOString(),
      crowdLevel,
      crowdPercentage: getRandomCrowdPercentage(crowdLevel)
    });
  }
  
  return buses;
}

// Generate mock routes
export function generateMockRoutes(count: number, provider?: string): (BMTCRoute | OtherRoute)[] {
  const routes: (BMTCRoute | OtherRoute)[] = [];
  
  // If provider is specified, use that provider for all routes
  // Otherwise, distribute routes among different providers
  const providers = provider ? [provider] : Object.keys(providerLocations);
  
  // Popular destinations for each provider
  const destinations: Record<string, string[]> = {
    'BMTC': ['Majestic', 'Whitefield', 'Electronic City', 'Hebbal', 'Silk Board', 'Jayanagar', 'Koramangala']
  };
  
  for (let i = 0; i < count; i++) {
    const routeProvider = provider || providers[i % providers.length];
    const baseLocation = providerLocations[routeProvider] || cityLocations['Bangalore'];
    const providerDestinations = destinations[routeProvider] || destinations['BMTC'];
    
    // Generate random source and destination
    const sourceIndex = Math.floor(Math.random() * providerDestinations.length);
    let destIndex = Math.floor(Math.random() * providerDestinations.length);
    while (destIndex === sourceIndex) {
      destIndex = Math.floor(Math.random() * providerDestinations.length);
    }
    
    const source = providerDestinations[sourceIndex];
    const destination = providerDestinations[destIndex];
    
    // Generate stops
    const stopCount = 5 + Math.floor(Math.random() * 5);
    const stops: (BMTCStop | OtherStop)[] = [];
    
    for (let j = 0; j < stopCount; j++) {
      const [latitude, longitude] = getRandomLatLng(baseLocation);
      stops.push({
        id: `${routeProvider.toLowerCase()}-stop-${i * 10 + j + 1}`,
        name: j === 0 ? source : j === stopCount - 1 ? destination : `Stop ${j}`,
        latitude,
        longitude
      });
    }
    
    routes.push({
      id: `${routeProvider.toLowerCase()}-route-${i + 1}`,
      provider: routeProvider,
      routeNumber: `${routeProvider.substring(0, 2)}${500 + i}`,
      routeName: `${source} to ${destination}`,
      source,
      destination,
      via: `Via ${providerDestinations[Math.floor(Math.random() * providerDestinations.length)]}`,
      frequency: `${5 + Math.floor(Math.random() * 15)} min`,
      stops
    });
  }
  
  return routes;
}

// Generate mock stop details
export interface StopDetails {
  id: string;
  name: string;
  address: string;
  amenities: string[];
  routes: string[];
  provider: string;
  crowdLevel: 'Low' | 'Medium' | 'High';
  crowdPercentage: number;
  crowdHistory: {
    time: string;
    level: 'Low' | 'Medium' | 'High';
    percentage: number;
  }[];
  upcomingBuses: {
    route: string;
    destination: string;
    time: string;
    status: string;
    crowdLevel: 'Low' | 'Medium' | 'High';
    crowdPercentage: number;
  }[];
  alerts: {
    type: string;
    message: string;
  }[];
}

export function generateMockStopDetails(stopId: string): StopDetails {
  // Extract provider from stopId
  const provider = stopId.split('-')[0].toUpperCase();
  const stopNumber = stopId.split('-').pop() || '1';
  
  // Generate random amenities
  const allAmenities = ['Shelter', 'Bench', 'Lighting', 'Real-time display', 'Ticket machine', 'Restrooms', 'WiFi', 'Water fountain'];
  const amenityCount = Math.floor(Math.random() * 5) + 1;
  const amenities: string[] = [];
  
  for (let i = 0; i < amenityCount; i++) {
    const amenity = allAmenities[Math.floor(Math.random() * allAmenities.length)];
    if (!amenities.includes(amenity)) {
      amenities.push(amenity);
    }
  }
  
  // Generate random routes
  const routeCount = Math.floor(Math.random() * 3) + 1;
  const routes: string[] = [];
  
  for (let i = 0; i < routeCount; i++) {
    const routeNumber = Math.floor(Math.random() * 100) + 1;
    routes.push(`${provider} Route ${routeNumber}`);
  }
  
  // Generate crowd history
  const crowdHistory = [];
  
  for (let hour = 6; hour <= 21; hour += 3) {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    let level: 'Low' | 'Medium' | 'High';
    let percentage: number;
    
    if (hour >= 7 && hour <= 9) {
      // Morning rush
      level = 'High';
      percentage = 75 + Math.floor(Math.random() * 25);
    } else if (hour >= 17 && hour <= 19) {
      // Evening rush
      level = 'High';
      percentage = 75 + Math.floor(Math.random() * 25);
    } else if (hour >= 10 && hour <= 16) {
      // Regular hours
      level = 'Medium';
      percentage = 40 + Math.floor(Math.random() * 35);
    } else {
      // Off-peak
      level = 'Low';
      percentage = 10 + Math.floor(Math.random() * 30);
    }
    
    crowdHistory.push({ time: timeStr, level, percentage });
  }
  
  // Generate upcoming buses
  const busCount = Math.floor(Math.random() * 5) + 2;
  const destinations = ['Central Station', 'Airport', 'University', 'Market', 'Hospital', 'Mall', 'Tech Park'];
  const upcomingBuses = [];
  
  for (let i = 0; i < busCount; i++) {
    const routeNumber = Math.floor(Math.random() * 100) + 1;
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    const minutes = (i + 1) * 5 + Math.floor(Math.random() * 5);
    const status = getRandomStatus();
    const crowdLevel = getRandomCrowdLevel();
    
    upcomingBuses.push({
      route: routeNumber.toString(),
      destination,
      time: `${minutes} min`,
      status,
      crowdLevel,
      crowdPercentage: getRandomCrowdPercentage(crowdLevel)
    });
  }
  
  // Generate alerts
  const alerts = [];
  
  if (Math.random() > 0.7) {
    const alertTypes = ['info', 'warning'];
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    const infoMessages = [
      'Construction nearby may cause slight delays',
      'Bus stop will be relocated next week',
      'New route added starting tomorrow'
    ];
    
    const warningMessages = [
      'Road construction may cause delays during rush hour',
      'Special event today may increase passenger volume',
      'Weather alert: Expect delays due to heavy rain'
    ];
    
    const message = type === 'info' 
      ? infoMessages[Math.floor(Math.random() * infoMessages.length)]
      : warningMessages[Math.floor(Math.random() * warningMessages.length)];
    
    alerts.push({ type, message });
  }
  
  // Generate random address
  const streets = ['Main Street', 'Park Road', 'Station Road', 'Market Street', 'Temple Road', 'Gandhi Road', 'Nehru Avenue'];
  const areas = ['Indiranagar', 'Koramangala', 'Jayanagar', 'Malleshwaram', 'Whitefield', 'Electronic City', 'HSR Layout'];
  
  const street = streets[Math.floor(Math.random() * streets.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const number = Math.floor(Math.random() * 1000) + 1;
  
  let city = 'Bangalore';
  if (provider === 'KSRTC') city = 'Mysore';
  else if (provider === 'APSRTC') city = 'Hyderabad';
  else if (provider === 'TNSTC') city = 'Chennai';
  else if (provider === 'BEST') city = 'Mumbai';
  else if (provider === 'DTC') city = 'Delhi';
  
  const address = `${number} ${street}, ${area}, ${city}`;
  
  // Generate current crowd level
  const crowdLevel = getRandomCrowdLevel();
  
  return {
    id: stopId,
    name: `${provider} Stop ${stopNumber}`,
    address,
    amenities,
    routes,
    provider,
    crowdLevel,
    crowdPercentage: getRandomCrowdPercentage(crowdLevel),
    crowdHistory,
    upcomingBuses,
    alerts
  };
}
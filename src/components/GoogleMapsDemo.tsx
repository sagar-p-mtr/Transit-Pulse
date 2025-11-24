import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Zap, Users, Bus as BusIcon } from 'lucide-react';
import GoogleMapsWrapper, { BusMarkerData, StopMarkerData, RouteData } from './GoogleMapsWrapper';
import { generateMockBuses, generateMockRoutes } from '../services/mockData';

const GoogleMapsDemo: React.FC = () => {
  const [buses, setBuses] = useState<BusMarkerData[]>([]);
  const [stops, setStops] = useState<StopMarkerData[]>([]);
  const [routeData, setRouteData] = useState<RouteData | undefined>();
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedCity, setSelectedCity] = useState('bangalore');
  const [showDemo, setShowDemo] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // City configurations for multi-city demo
  const cities = {
    bangalore: {
      name: 'Bangalore',
      center: { lat: 12.9716, lng: 77.5946 },
      zoom: 12,
      providers: ['BMTC', 'KSRTC']
    },
    delhi: {
      name: 'Delhi',
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 11,
      providers: ['DTC', 'Cluster']
    },
    mumbai: {
      name: 'Mumbai',
      center: { lat: 19.0760, lng: 72.8777 },
      zoom: 11,
      providers: ['BEST', 'MSRTC']
    },
    chennai: {
      name: 'Chennai',
      center: { lat: 13.0827, lng: 80.2707 },
      zoom: 11,
      providers: ['MTC', 'TNSTC']
    }
  };

  // Handle city selection
  const handleCityChange = (cityKey: string) => {
    const city = cities[cityKey as keyof typeof cities];
    if (city) {
      setSelectedCity(cityKey);
      setMapCenter(city.center);
      setMapZoom(city.zoom);
      generateDemoData(cityKey);
    }
  };

  // Generate demo data for selected city
  const generateDemoData = (cityKey: string) => {
    const city = cities[cityKey as keyof typeof cities];
    if (!city) return;

    // Generate mock buses for the city
    const mockBuses = generateMockBuses(15, city.providers[0]);
    const busMarkers: BusMarkerData[] = mockBuses.map(bus => {
      // Randomize positions around city center
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      return {
        id: bus.id,
        position: {
          lat: city.center.lat + latOffset,
          lng: city.center.lng + lngOffset
        },
        title: `${bus.routeName} - ${bus.vehicleNumber}`,
        content: '',
        crowdLevel: bus.crowdLevel,
        provider: city.providers[Math.floor(Math.random() * city.providers.length)],
        vehicleNumber: bus.vehicleNumber,
        routeName: bus.routeName,
        lastUpdated: bus.lastUpdated,
        crowdPercentage: bus.crowdPercentage
      };
    });

    setBuses(busMarkers);

    // Generate mock stops
    const mockRoutes = generateMockRoutes(1);
    if (mockRoutes.length > 0 && mockRoutes[0].stops) {
      const stopMarkers: StopMarkerData[] = mockRoutes[0].stops.map(stop => ({
        id: stop.id,
        position: { lat: stop.latitude, lng: stop.longitude },
        title: stop.name,
        content: '',
        onStopSelect: (stopId: string) => {
          console.log('Selected stop:', stopId);
          alert(`Stop selected: ${stop.name}`);
        }
      }));

      setStops(stopMarkers);

      // Create route path
      const routePath: RouteData = {
        path: mockRoutes[0].stops.map(stop => ({ lat: stop.latitude, lng: stop.longitude })),
        color: '#3B82F6',
        weight: 4,
        opacity: 0.7
      };

      setRouteData(routePath);
    }
  };

  // Initialize demo data
  useEffect(() => {
    if (showDemo) {
      generateDemoData(selectedCity);
    }
  }, [showDemo, selectedCity]);

  // Handle map load
  const handleMapLoad = (loadedMap: google.maps.Map) => {
    setMap(loadedMap);
    console.log('Google Maps loaded successfully!', loadedMap);
  };

  // Real-time simulation
  useEffect(() => {
    if (!showDemo) return;

    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => {
          // Simulate bus movement
          const latOffset = (Math.random() - 0.5) * 0.001;
          const lngOffset = (Math.random() - 0.5) * 0.001;
          
          return {
            ...bus,
            position: {
              lat: bus.position.lat + latOffset,
              lng: bus.position.lng + lngOffset
            },
            lastUpdated: new Date().toISOString(),
            crowdPercentage: Math.floor(Math.random() * 100)
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [showDemo]);

  if (!showDemo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Google Maps Integration Demo
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Experience real-time bus tracking with Google Maps across multiple Indian cities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Navigation className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
                <p className="text-sm text-gray-600">Live bus positions and route visualization</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Multi-city Support</h3>
                <p className="text-sm text-gray-600">Bangalore, Delhi, Mumbai, Chennai</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Crowd Analytics</h3>
                <p className="text-sm text-gray-600">Real-time occupancy levels</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Demo Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This demo uses your Google Maps API key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDemo(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md"
            >
              Launch Google Maps Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <MapPin className="h-6 w-6 mr-2" />
                Google Maps Bus Tracking Demo
              </h1>
              <p className="text-blue-100 mt-1">
                Real-time multi-city bus tracking with Google Maps
              </p>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm"
            >
              Exit Demo
            </button>
          </div>
        </div>

        {/* City Selector */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Select City:</span>
            {Object.entries(cities).map(([key, city]) => (
              <button
                key={key}
                onClick={() => handleCityChange(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCity === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{buses.length}</div>
              <div className="text-sm text-gray-600">Active Buses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stops.length}</div>
              <div className="text-sm text-gray-600">Bus Stops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {cities[selectedCity as keyof typeof cities]?.providers.length || 0}
              </div>
              <div className="text-sm text-gray-600">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(buses.reduce((acc, bus) => acc + (bus.crowdPercentage || 0), 0) / buses.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Occupancy</div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[600px]">
          <GoogleMapsWrapper
            center={mapCenter}
            zoom={mapZoom}
            buses={buses}
            stops={stops}
            routePath={routeData}
            onMapLoad={handleMapLoad}
            className="w-full h-full"
          />

          {/* Real-time indicator */}
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center z-10">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-sm text-gray-700 font-medium">Live Updates</span>
          </div>

          {/* City info */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-10">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <BusIcon className="h-4 w-4 mr-1 text-blue-600" />
              {cities[selectedCity as keyof typeof cities]?.name}
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              Providers: {cities[selectedCity as keyof typeof cities]?.providers.join(', ')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              ✅ Google Maps integration successful • ⚡ Real-time updates active • 🗺️ Multi-city support enabled
            </div>
            <div className="text-xs">
              API Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 12)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsDemo;
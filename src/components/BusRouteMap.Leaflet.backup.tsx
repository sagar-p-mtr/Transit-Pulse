import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Users, Bus as BusIcon } from 'lucide-react';
import bmtcApi, { BMTCBus, BMTCStop } from '../services/bmtcApi';
import otherBusApi, { OtherBus } from '../services/otherBusApi';
import { socket, initializeSocketListeners } from '../services/api';
import { generateMockBuses, generateMockRoutes } from '../services/mockData';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom bus icon
const busIcon = (crowdLevel: string) => {
  const color = crowdLevel === 'Low' ? '#10B981' : 
                crowdLevel === 'Medium' ? '#F59E0B' : '#EF4444';
  
  return L.divIcon({
    html: `
      <div style="background-color: ${color}; color: white; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 12px; display: flex; items-center; justify-content: center;">
        <span>BUS</span>
      </div>
    `,
    className: 'bus-icon',
    iconSize: [40, 20],
    iconAnchor: [20, 10],
    popupAnchor: [0, -10]
  });
};

// Custom stop icon
const stopIcon = L.divIcon({
  html: `
    <div style="background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>
  `,
  className: 'stop-icon',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6]
});

interface BusRouteMapProps {
  selectedRoute: string | null;
  onStopSelect: (stopId: string) => void;
  filters?: {
    providers: string[];
    crowdLevels: string[];
    routeTypes: string[];
  };
  searchQuery?: string;
}

// Component to recenter map when selectedRoute changes
const MapController: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const BusRouteMap: React.FC<BusRouteMapProps> = ({ selectedRoute, onStopSelect, filters, searchQuery }) => {
  const [buses, setBuses] = useState<(BMTCBus | OtherBus)[]>([]);
  const [stops, setStops] = useState<BMTCStop[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Default: Bangalore
  const [mapZoom, setMapZoom] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({
    BMTC: true,
    KSRTC: true,
    APSRTC: true,
    TNSTC: true,
    BEST: true,
    DTC: true
  });
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // Function to update bus positions from socket events
  const handleBusUpdate = useCallback((data: any) => {
    if (data && Array.isArray(data)) {
      setBuses(prevBuses => {
        // Create a map of existing buses by ID for quick lookup
        const busMap = new Map(prevBuses.map(bus => [bus.id, bus]));
        
        // Update or add buses from the socket data
        data.forEach(updatedBus => {
          busMap.set(updatedBus.id, {
            ...busMap.get(updatedBus.id),
            ...updatedBus,
            lastUpdated: new Date().toISOString()
          });
        });
        
        return Array.from(busMap.values());
      });
    } else if (data && data.id) {
      // Single bus update
      setBuses(prevBuses => {
        const index = prevBuses.findIndex(bus => bus.id === data.id);
        if (index >= 0) {
          const updatedBuses = [...prevBuses];
          updatedBuses[index] = {
            ...updatedBuses[index],
            ...data,
            lastUpdated: new Date().toISOString()
          };
          return updatedBuses;
        } else {
          return [...prevBuses, {
            ...data,
            lastUpdated: new Date().toISOString()
          }];
        }
      });
    }
  }, []);

  // Function to handle route updates from socket
  const handleRouteUpdate = useCallback((data: any) => {
    if (selectedRoute && data && data.id === selectedRoute) {
      // Update route details if it's the currently selected route
      if (data.stops) {
        setStops(data.stops);
        
        // Update route path
        const path = data.stops.map((stop: BMTCStop) => [stop.latitude, stop.longitude] as [number, number]);
        setRoutePath(path);
      }
    }
  }, [selectedRoute]);

  // Function to handle errors
  const handleError = useCallback((error: any) => {
    console.error('Socket error:', typeof error === 'string' ? error : 'Connection error');
    setError('Connection error. Using fallback data for real-time updates.');
    setUsingFallbackData(true);
    
    // Generate fallback data when socket connection fails
    if (selectedRoute) {
      const provider = selectedRoute.split('-')[0];
      const mockBuses = generateMockBuses(5, provider.toUpperCase());
      setBuses(mockBuses);
    } else {
      const mockBuses = generateMockBuses(30);
      setBuses(mockBuses);
    }
  }, [selectedRoute]);

  // Initialize socket connection
  useEffect(() => {
    const cleanup = initializeSocketListeners(
      handleBusUpdate,
      handleRouteUpdate,
      handleError
    );
    
    return () => {
      cleanup();
    };
  }, [handleBusUpdate, handleRouteUpdate, handleError]);

  // Fetch buses and stops when selectedRoute changes
  useEffect(() => {
    const fetchBusesAndStops = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (selectedRoute) {
          // Check if it's a BMTC route or other provider
          if (selectedRoute.startsWith('bmtc-')) {
            // BMTC route
            const [routeBuses, routeDetails] = await Promise.all([
              bmtcApi.getBusesByRoute(selectedRoute),
              bmtcApi.getRouteDetails(selectedRoute)
            ]);
            
            setBuses(routeBuses);
            
            if (routeDetails && routeDetails.stops) {
              setStops(routeDetails.stops);
              
              // Create route path from stops
              const path = routeDetails.stops.map(stop => [stop.latitude, stop.longitude] as [number, number]);
              setRoutePath(path);
              
              // Center map on first stop
              if (path.length > 0) {
                setMapCenter(path[0]);
                setMapZoom(13);
              }
            }
          } else {
            // Other provider route
            const provider = selectedRoute.split('-')[0];
            const routeBuses = await otherBusApi.getBusesByProvider(provider);
            const routeDetails = await otherBusApi.getRouteDetails(selectedRoute);
            
            setBuses(routeBuses.filter(bus => bus.routeId === selectedRoute));
            
            if (routeDetails && routeDetails.stops) {
              setStops(routeDetails.stops);
              
              // Create route path from stops
              const path = routeDetails.stops.map(stop => [stop.latitude, stop.longitude] as [number, number]);
              setRoutePath(path);
              
              // Center map on first stop
              if (path.length > 0) {
                setMapCenter(path[0]);
                setMapZoom(13);
              }
            }
          }
          
          // Subscribe to specific route updates
          socket.emit('subscribe', { route: selectedRoute });
        } else {
          // No route selected, show all buses from selected providers
          const allBusesPromises = Object.entries(selectedProviders)
            .filter(([_, isSelected]) => isSelected)
            .map(([provider]) => {
              if (provider === 'BMTC') {
                return bmtcApi.getAllBuses();
              } else {
                return otherBusApi.getBusesByProvider(provider);
              }
            });
          
          const results = await Promise.allSettled(allBusesPromises);
          const allBuses = results
            .filter((result): result is PromiseFulfilledResult<(BMTCBus | OtherBus)[]> => 
              result.status === 'fulfilled'
            )
            .flatMap(result => result.value);
          
          if (allBuses.length === 0) {
            // If no buses were fetched, use fallback data
            const mockBuses = generateMockBuses(30);
            setBuses(mockBuses);
            setUsingFallbackData(true);
          } else {
            setBuses(allBuses);
            setUsingFallbackData(false);
          }
          
          setStops([]);
          setRoutePath([]);
          setMapCenter([12.9716, 77.5946]); // Bangalore
          setMapZoom(12);
          
          // Subscribe to all bus updates
          socket.emit('subscribe', { topics: ['all_buses'] });
        }
      } catch (err) {
        console.error('Error fetching bus data:', err);
        setError('Failed to load bus data. Using fallback data.');
        setUsingFallbackData(true);
        
        // Use fallback data
        if (selectedRoute) {
          const provider = selectedRoute.split('-')[0];
          const mockBuses = generateMockBuses(5, provider.toUpperCase());
          setBuses(mockBuses);
          
          const mockRoutes = generateMockRoutes(10);
          const mockRoute = mockRoutes.find(route => route.id === selectedRoute) || mockRoutes[0];
          
          if (mockRoute && mockRoute.stops) {
            setStops(mockRoute.stops);
            
            // Create route path from stops
            const path = mockRoute.stops.map(stop => [stop.latitude, stop.longitude] as [number, number]);
            setRoutePath(path);
            
            // Center map on first stop
            if (path.length > 0) {
              setMapCenter(path[0]);
              setMapZoom(13);
            }
          }
        } else {
          const mockBuses = generateMockBuses(30);
          setBuses(mockBuses);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusesAndStops();
    
    // Set up interval to refresh bus positions
    const intervalId = setInterval(() => {
      fetchBusesAndStops();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(intervalId);
      // Unsubscribe from specific route updates when component unmounts or route changes
      if (selectedRoute) {
        socket.emit('unsubscribe', { route: selectedRoute });
      } else {
        socket.emit('unsubscribe', { topics: ['all_buses'] });
      }
    };
  }, [selectedRoute, selectedProviders]);

  // Handle provider filter changes
  const handleProviderFilterChange = (provider: string) => {
    setSelectedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  // Filter buses based on selected providers
  const filteredBuses = buses.filter(bus => {
    const provider = bus.provider || (bus.id.startsWith('bmtc-') ? 'BMTC' : 
                                     bus.id.startsWith('ksrtc-') ? 'KSRTC' : 
                                     bus.id.startsWith('apsrtc-') ? 'APSRTC' : 
                                     bus.id.startsWith('tnstc-') ? 'TNSTC' : 
                                     bus.id.startsWith('best-') ? 'BEST' : 
                                     bus.id.startsWith('dtc-') ? 'DTC' : 'Unknown');
    
    return selectedProviders[provider];
  });

  // Function to get crowd level color
  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative h-[500px] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-blue-600">Loading bus data...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md shadow-md">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {usingFallbackData && !error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-md shadow-md">
          <p className="text-sm">Using simulated data for demonstration purposes.</p>
        </div>
      )}
      
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {/* Route path */}
        {routePath.length > 1 && (
          <Polyline 
            positions={routePath}
            color="#3B82F6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
        
        {/* Bus stops */}
        {stops.map((stop) => (
          <Marker 
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={stopIcon}
            eventHandlers={{
              click: () => onStopSelect(stop.id)
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{stop.name}</p>
                <button 
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => onStopSelect(stop.id)}
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Buses */}
        {filteredBuses.map((bus) => (
          <Marker 
            key={bus.id}
            position={[bus.latitude, bus.longitude]}
            icon={busIcon(bus.crowdLevel || 'Medium')}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{bus.routeName}</p>
                <p className="text-gray-600">Bus: {bus.vehicleNumber}</p>
                <p className="text-gray-600">Provider: {bus.provider || (
                  bus.id.startsWith('bmtc-') ? 'BMTC' : 
                  bus.id.startsWith('ksrtc-') ? 'KSRTC' : 
                  bus.id.startsWith('apsrtc-') ? 'APSRTC' : 
                  bus.id.startsWith('tnstc-') ? 'TNSTC' : 
                  bus.id.startsWith('best-') ? 'BEST' : 
                  bus.id.startsWith('dtc-') ? 'DTC' : 'Unknown'
                )}</p>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCrowdLevelColor(bus.crowdLevel || 'Medium')}`}>
                    <Users className="h-3 w-3 mr-1" />
                    {bus.crowdLevel || 'Medium'} ({bus.crowdPercentage || 50}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(bus.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={() => setMapZoom(prev => Math.max(prev - 1, 5))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Crowd level legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Users className="h-4 w-4 mr-1 text-gray-500" />
          Crowd Levels
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-gray-700">Low</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-xs text-gray-700">Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-xs text-gray-700">High</span>
          </div>
        </div>
      </div>
      
      {/* Bus providers filter */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <BusIcon className="h-4 w-4 mr-1 text-gray-500" />
          Bus Providers
        </h4>
        <div className="space-y-1.5">
          {Object.entries(selectedProviders).map(([provider, isSelected]) => (
            <div key={provider} className="flex items-center">
              <input 
                type="checkbox" 
                id={provider} 
                className="mr-2" 
                checked={isSelected}
                onChange={() => handleProviderFilterChange(provider)}
              />
              <label htmlFor={provider} className="text-xs text-gray-700">
                {provider} {provider === 'BMTC' ? '(Bangalore)' : 
                           provider === 'KSRTC' ? '(Karnataka)' : 
                           provider === 'APSRTC' ? '(Andhra Pradesh)' : 
                           provider === 'TNSTC' ? '(Tamil Nadu)' : 
                           provider === 'BEST' ? '(Mumbai)' : 
                           provider === 'DTC' ? '(Delhi)' : ''}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {!selectedRoute && !loading && filteredBuses.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
          <MapPin className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Bus Route</h3>
          <p className="text-gray-600 text-center max-w-md">
            Choose a bus route from the list to view its current location and stops on the map.
          </p>
        </div>
      )}
      
      {/* Real-time indicator */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
        <span className="text-xs text-gray-700">{usingFallbackData ? 'Simulated' : 'Live'} Updates</span>
      </div>
    </div>
  );
};

export default BusRouteMap;
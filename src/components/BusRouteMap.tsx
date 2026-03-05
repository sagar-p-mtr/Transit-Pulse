import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapPin, Users, Bus as BusIcon, Navigation } from 'lucide-react';
import bmtcApi, { BMTCBus, BMTCStop } from '../services/bmtcApi';
import otherBusApi, { OtherBus } from '../services/otherBusApi';
import { socket, initializeSocketListeners } from '../services/api';
import { generateMockBuses, generateMockRoutes } from '../services/mockData';
import GoogleMapsWrapper, { BusMarkerData, StopMarkerData, RouteData } from './GoogleMapsWrapper';

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

const BusRouteMap: React.FC<BusRouteMapProps> = ({ selectedRoute, onStopSelect }) => {
  const [buses, setBuses] = useState<(BMTCBus | OtherBus)[]>([]);
  const [stops, setStops] = useState<BMTCStop[]>([]);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 12.9716, lng: 77.5946 }); // Default: Bangalore
  const [mapZoom, setMapZoom] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({
    BMTC: true
  });
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  // Get user's current location and center map
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        setMapCenter(userPos);
        setMapZoom(15);
        if (map) {
          map.panTo(userPos);
          map.setZoom(15);
        }
        setLocatingUser(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Could not get your location. Please enable location permissions.');
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

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
        const path = data.stops.map((stop: BMTCStop) => ({ lat: stop.latitude, lng: stop.longitude }));
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
            // BMTC route - use allSettled for better error handling
            const results = await Promise.allSettled([
              bmtcApi.getBusesByRoute(selectedRoute),
              bmtcApi.getRouteDetails(selectedRoute)
            ]);
            
            const routeBuses = results[0].status === 'fulfilled' ? results[0].value : [];
            const routeDetails = results[1].status === 'fulfilled' ? results[1].value : null;
            
            setBuses(routeBuses);
            
            if (routeDetails && routeDetails.stops) {
              setStops(routeDetails.stops);
              
              // Create route path from stops
              const path = routeDetails.stops.map(stop => ({ lat: stop.latitude, lng: stop.longitude }));
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
              const path = routeDetails.stops.map(stop => ({ lat: stop.latitude, lng: stop.longitude }));
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
          setMapCenter({ lat: 12.9716, lng: 77.5946 }); // Bangalore
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
            const path = mockRoute.stops.map(stop => ({ lat: stop.latitude, lng: stop.longitude }));
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
    const provider = (bus as any).provider || (bus.id.startsWith('bmtc-') ? 'BMTC' : 
                                     bus.id.startsWith('ksrtc-') ? 'KSRTC' : 
                                     bus.id.startsWith('apsrtc-') ? 'APSRTC' : 
                                     bus.id.startsWith('tnstc-') ? 'TNSTC' : 
                                     bus.id.startsWith('best-') ? 'BEST' : 
                                     bus.id.startsWith('dtc-') ? 'DTC' : 'Unknown');
    
    return selectedProviders[provider];
  });

  // Convert filtered buses to Google Maps format with memoization
  const busMarkers: BusMarkerData[] = useMemo(() => filteredBuses.map(bus => ({
    id: bus.id,
    position: { lat: bus.latitude, lng: bus.longitude },
    title: `${bus.routeName} - ${bus.vehicleNumber}`,
    content: '', // Content is handled inside GoogleMapsWrapper
    crowdLevel: bus.crowdLevel,
    provider: (bus as any).provider || (bus.id.startsWith('bmtc-') ? 'BMTC' : 
                              bus.id.startsWith('ksrtc-') ? 'KSRTC' : 
                              bus.id.startsWith('apsrtc-') ? 'APSRTC' : 
                              bus.id.startsWith('tnstc-') ? 'TNSTC' : 
                              bus.id.startsWith('best-') ? 'BEST' : 
                              bus.id.startsWith('dtc-') ? 'DTC' : 'Unknown'),
    vehicleNumber: bus.vehicleNumber,
    routeName: bus.routeName,
    lastUpdated: bus.lastUpdated,
    crowdPercentage: bus.crowdPercentage
  })), [filteredBuses]);

  // Convert stops to Google Maps format with memoization
  const stopMarkers: StopMarkerData[] = useMemo(() => stops.map(stop => ({
    id: stop.id,
    position: { lat: stop.latitude, lng: stop.longitude },
    title: stop.name,
    content: '', // Content is handled inside GoogleMapsWrapper
    onStopSelect
  })), [stops, onStopSelect]);

  // Create route data for Google Maps with memoization
  const routeData: RouteData | undefined = useMemo(() => 
    routePath.length > 1 ? {
      path: routePath,
      color: '#3B82F6',
      weight: 4,
      opacity: 0.7
    } : undefined,
  [routePath]);

  // Handle map load
  const handleMapLoad = (loadedMap: google.maps.Map) => {
    setMap(loadedMap);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 12;
      map.setZoom(Math.min(currentZoom + 1, 18));
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 12;
      map.setZoom(Math.max(currentZoom - 1, 5));
    }
  };

  return (
    <div className="relative h-[500px] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
            </div>
            <p className="text-blue-600 font-medium mt-3">Loading map...</p>
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
      
      {/* Google Maps Component */}
      <GoogleMapsWrapper
        center={mapCenter}
        zoom={mapZoom}
        buses={busMarkers}
        stops={stopMarkers}
        routePath={routeData}
        userLocation={userLocation}
        onMapLoad={handleMapLoad}
        className="w-full h-full"
      />
      
      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
        {/* Locate Me Button */}
        <button 
          className={`bg-white p-2 rounded-full shadow-md hover:bg-gray-100 border transition-all ${locatingUser ? 'animate-pulse' : ''} ${userLocation ? 'ring-2 ring-blue-500' : ''}`}
          onClick={handleLocateUser}
          disabled={locatingUser}
          title="Find my location"
        >
          {locatingUser ? (
            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Navigation className={`h-6 w-6 ${userLocation ? 'text-blue-500' : 'text-gray-600'}`} />
          )}
        </button>
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 border"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 border"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Crowd level legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-10">
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
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md max-h-64 overflow-y-auto z-10">
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
              <label htmlFor={provider} className="text-xs text-gray-700 cursor-pointer">
                {provider} {provider === 'BMTC' ? '(Bangalore)' : ''}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {!selectedRoute && !loading && filteredBuses.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-10">
          <MapPin className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Bus Route</h3>
          <p className="text-gray-600 text-center max-w-md">
            Choose a bus route from the list to view its current location and stops on the map.
          </p>
        </div>
      )}
      
      {/* Real-time indicator */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center z-10">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
        <span className="text-xs text-gray-700">{usingFallbackData ? 'Simulated' : 'Live'} Updates</span>
      </div>

      {/* Google Maps attribution */}
      <div className="absolute bottom-1 right-1 bg-white px-2 py-1 text-xs text-gray-500 rounded z-10">
        Powered by Google Maps
      </div>
    </div>
  );
};

export default BusRouteMap;
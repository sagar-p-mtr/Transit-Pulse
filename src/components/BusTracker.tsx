import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Clock, Route, Navigation, AlertCircle, RefreshCw, X, Bus, TrendingUp } from 'lucide-react';
import { busApi, subscribeToUpdates, socketEvents } from '../services/backendApi';
import { fallbackApi } from '../services/api';
import { toast } from 'react-hot-toast';
import BusRouteMap from './BusRouteMap';
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const isMockLikeBusId = (busId: string) =>
  busId.startsWith('mock') ||
  busId.startsWith('BUS-') ||
  busId.includes('-bus-');

const getRouteMeta = (routeId?: string) => {
  if (!routeId) return { routeName: '', routeNumber: '', source: '', destination: '', stops: [] as any[], provider: '' };
  const route = fallbackApi.getRouteDetails(routeId) as any;
  return {
    routeName: route?.routeName || route?.route_name || '',
    routeNumber: route?.routeNumber || route?.route_number || '',
    source: route?.source || '',
    destination: route?.destination || '',
    stops: route?.stops || [],
    provider: route?.provider || ''
  };
};

interface BusSearchResult {
  id: string;
  bus_number: string;
  route_id: string;
  route_name: string;
  route_number: string;
  current_lat: number;
  current_lng: number;
  speed: number;
  crowd_level: string;
  crowd_percentage: number;
  city: string;
  source: string;
  destination: string;
}

interface CurrentStop {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  isAtStop: boolean;
}

interface UpcomingStop {
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  eta: number;
  etaFormatted: string;
}

const BusTracker: React.FC = () => {
  const { t } = useTranslation();
  const [busNumber, setBusNumber] = useState('');
  const [searchResults, setSearchResults] = useState<BusSearchResult[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusSearchResult | null>(null);
  const [currentStop, setCurrentStop] = useState<CurrentStop | null>(null);
  const [upcomingStops, setUpcomingStops] = useState<UpcomingStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);

  // Search for bus by number
  const handleSearch = async (inputBusNumber?: string) => {
    const query = (inputBusNumber ?? busNumber).trim();
    if (!query) {
      toast.error('Please enter a bus number');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedBus(null);

    const useMockSearch = async () => {
      const fallbackBuses = fallbackApi.getAllBuses();
      const matches = fallbackBuses.filter((b: any) =>
        (b.bus_number || b.vehicleNumber || '').toLowerCase().includes(query.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(query.toLowerCase())
      );
      if (matches.length > 0) {
        const mapped = matches.map((b: any) => {
          const routeMeta = getRouteMeta(b.route_id || b.routeId || b.route);
          return {
            id: b.id || `mock-${query}`,
            bus_number: b.bus_number || b.vehicleNumber || query,
            route_id: b.route_id || b.routeId || b.route || 'mock-route',
            route_name: b.route_name || b.routeName || routeMeta.routeName || 'Mock Route',
            route_number: b.route_number || b.routeNumber || routeMeta.routeNumber || '',
            current_lat: b.latitude || b.current_lat || routeMeta.stops?.[0]?.latitude || 0,
            current_lng: b.longitude || b.current_lng || routeMeta.stops?.[0]?.longitude || 0,
            speed: b.speed || 0,
            crowd_level: b.crowdLevel || b.crowd_level || 'Medium',
            crowd_percentage: b.crowdPercentage || b.crowd_percentage || 50,
            city: b.city || '',
            source: b.source || routeMeta.source || '',
            destination: b.destination || routeMeta.destination || ''
          };
        });
        setSearchResults(mapped as any);
        if (mapped.length === 1) {
          await handleSelectBus(mapped[0]);
        }
        return true;
      }
      return false;
    };

    try {
      const response = await busApi.searchBusByNumber(query);
      if (response.data.success && response.data.data.length > 0) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 1) {
          // Auto-select if only one result
          handleSelectBus(response.data.data[0]);
        }
      } else {
        const found = await useMockSearch();
        if (!found) {
          setError('Bus not found. Please check the bus number.');
          setSearchResults([]);
        }
      }
    } catch (err: any) {
      console.error('Error searching bus:', err);
      const found = await useMockSearch();
      if (!found) {
        setError(err.response?.data?.message || 'Failed to search bus. Please try again.');
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Select a bus and start tracking
  const handleSelectBus = async (bus: BusSearchResult) => {
    setSelectedBus(bus);
    setSearchResults([]);
    setIsTracking(true);
    
    // Fetch current stop and upcoming stops
    await fetchBusDetails(bus.id);
    
    // Ensure socket is connected before subscribing
    const { socket, connectSocket } = await import('../services/backendApi');
    if (!socket.connected) {
      connectSocket();
      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Subscribe to real-time updates
    subscribeToUpdates.subscribeToBus(bus.id);
  };

  // Fetch current stop and upcoming stops
  const fetchBusDetails = async (busId: string) => {
    const applyMockDetails = (bus: BusSearchResult | null) => {
      const routeMeta = getRouteMeta(bus?.route_id);
      const stops = routeMeta.stops || [];
      setCurrentStop({
        name: bus?.source || routeMeta.source || 'En route',
        latitude: bus?.current_lat || stops[0]?.latitude || 0,
        longitude: bus?.current_lng || stops[0]?.longitude || 0,
        distance: 0,
        isAtStop: false
      });
      setStatus('Tracking');
      const upcoming = stops.slice(1, 5).map((stop: any, idx: number) => ({
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        distance: (idx + 1) * 500,
        eta: (idx + 1) * 240,
        etaFormatted: `${(idx + 1) * 4}m`
      }));
      setUpcomingStops(upcoming);
    };

    // If this is a mock/synthetic bus, provide lightweight fallback data
    if (isMockLikeBusId(busId)) {
      applyMockDetails(selectedBus);
      return;
    }

    try {
      // Fetch current stop
      const currentStopResponse = await busApi.getBusCurrentStop(busId);
      if (currentStopResponse.data.success) {
        setCurrentStop(currentStopResponse.data.data.currentStop);
        setStatus(currentStopResponse.data.data.status);
      }

      // Fetch upcoming stops
      const upcomingStopsResponse = await busApi.getBusUpcomingStops(busId);
      if (upcomingStopsResponse.data.success) {
        setUpcomingStops(upcomingStopsResponse.data.data.upcomingStops);
      }
    } catch (err: any) {
      console.error('Error fetching bus details:', err);
      toast.error('Using demo data for this bus');
      applyMockDetails(selectedBus);
    }
  };

  // Handle real-time updates
  useEffect(() => {
    if (!selectedBus) return;

    const unsubscribe = socketEvents.onBusLocationUpdate((data: any) => {
      if (data.busId === selectedBus.id) {
        // Update bus location
        setSelectedBus(prev => prev ? {
          ...prev,
          current_lat: data.location?.lat || prev.current_lat,
          current_lng: data.location?.lng || prev.current_lng,
          speed: data.speed || prev.speed,
          crowd_level: data.crowdLevel || prev.crowd_level,
          crowd_percentage: data.crowdPercentage || prev.crowd_percentage
        } : null);

        // Refresh bus details periodically
        fetchBusDetails(selectedBus.id);
      }
    });

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchBusDetails(selectedBus.id);
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      subscribeToUpdates.unsubscribe(`bus:${selectedBus.id}`);
    };
  }, [selectedBus]);

  // Handle Enter key in search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setBusNumber('');
    setSelectedBus(null);
    setSearchResults([]);
    setCurrentStop(null);
    setUpcomingStops([]);
    setIsTracking(false);
    setError(null);
  };

  // Allow other components to open tracker directly (e.g., "Track Live" buttons)
  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      try {
        if (detail.busId) {
          const res = await busApi.getBusById(detail.busId);
          const bus = res.data?.data || res.data;
          if (bus) {
            const routeMeta = getRouteMeta(bus.route_id);
            const mapped: BusSearchResult = {
              id: bus.id,
              bus_number: bus.bus_number || busNumber || bus.id,
              route_id: bus.route_id,
              route_name: bus.route_name || routeMeta.routeName,
              route_number: bus.route_number || routeMeta.routeNumber || '',
              current_lat: parseFloat(bus.current_lat),
              current_lng: parseFloat(bus.current_lng),
              speed: bus.speed || 0,
              crowd_level: bus.crowd_level || 'Medium',
              crowd_percentage: bus.crowd_percentage || 50,
              city: bus.city || '',
              source: bus.source || routeMeta.source || '',
              destination: bus.destination || routeMeta.destination || ''
            };
            setBusNumber(mapped.bus_number);
            await handleSelectBus(mapped);
            return;
          }
        }

        if (detail.busNumber) {
          setBusNumber(detail.busNumber);
          await handleSearch(detail.busNumber);
          return;
        }

        if (detail.routeId) {
          setLoading(true);
          try {
            const routeMeta = getRouteMeta(detail.routeId);
            let target: any = null;

            try {
              const res = await busApi.getAllBuses(undefined, detail.routeId);
              const list = res.data?.data || res.data;
              target = Array.isArray(list) && list.length > 0 ? list[0] : null;
            } catch {
              // ignore network errors, fallback below
            }

            if (!target) {
              const mock = fallbackApi.getBusesByRoute(detail.routeId);
              if (Array.isArray(mock) && mock.length > 0) {
                target = mock[0];
              }
            }

            if (!target) {
              target = {
                id: `mock-${detail.routeId}-bus-1`,
                bus_number: routeMeta.routeNumber || `BUS-${detail.routeId}`,
                route_id: detail.routeId,
                route_name: routeMeta.routeName || 'Demo Route',
                route_number: routeMeta.routeNumber || '',
                current_lat: routeMeta.stops?.[0]?.latitude || 12.9716,
                current_lng: routeMeta.stops?.[0]?.longitude || 77.5946,
                speed: 22,
                crowd_level: 'Medium',
                crowd_percentage: 48,
                city: routeMeta.provider || '',
                source: routeMeta.source || 'Origin',
                destination: routeMeta.destination || 'Destination'
              };
            }

            const mapped: BusSearchResult = {
              id: target.id || `mock-${detail.routeId}-1`,
              bus_number: target.bus_number || target.busNumber || target.vehicleNumber || `BUS-${detail.routeId}`,
              route_id: target.route_id || detail.routeId,
              route_name: target.route_name || target.routeName || routeMeta.routeName || '',
              route_number: target.route_number || target.routeNumber || routeMeta.routeNumber || '',
              current_lat: parseFloat(target.current_lat ?? target.latitude ?? target.location?.lat ?? routeMeta.stops?.[0]?.latitude ?? 0),
              current_lng: parseFloat(target.current_lng ?? target.longitude ?? target.location?.lng ?? routeMeta.stops?.[0]?.longitude ?? 0),
              speed: target.speed || 0,
              crowd_level: target.crowd_level || target.crowdLevel || 'Medium',
              crowd_percentage: target.crowd_percentage || target.crowdPercentage || 50,
              city: target.city || '',
              source: target.source || routeMeta.source || '',
              destination: target.destination || routeMeta.destination || ''
            };
            setBusNumber(mapped.bus_number);
            await handleSelectBus(mapped);
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auto-track failed:', err);
        toast.error('Could not auto-track this bus');
      }
    };

    window.addEventListener('open-bus-tracker', handler as EventListener);
    return () => window.removeEventListener('open-bus-tracker', handler as EventListener);
  }, []);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'At Station': return 'bg-green-500';
      case 'Approaching Station': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const timelineStops = React.useMemo(() => {
    const stops: Array<{
      name: string;
      meta?: string;
      eta?: string;
      distance?: number;
      kind: 'start' | 'current' | 'upcoming' | 'end';
    }> = [];

    // Start/source marker
    if (selectedBus?.source) {
      stops.push({
        name: selectedBus.source,
        meta: 'Journey started',
        kind: 'start',
      });
    }

    // Current live marker
    if (currentStop) {
      stops.push({
        name: currentStop.name,
        meta: status || 'In transit',
        eta: currentStop.isAtStop ? 'Now' : undefined,
        distance: currentStop.distance,
        kind: 'current',
      });
    } else if (selectedBus?.source) {
      // Fallback marker when no stop detected yet
      stops.push({
        name: 'Live tracking',
        meta: 'En route',
        kind: 'current',
      });
    }

    // Upcoming stops from API
    upcomingStops.forEach((stop) => {
      stops.push({
        name: stop.name,
        meta: `${stop.distance}m away`,
        eta: stop.etaFormatted,
        distance: stop.distance,
        kind: 'upcoming',
      });
    });

    // Destination marker
    if (selectedBus?.destination) {
      stops.push({
        name: selectedBus.destination,
        meta: 'Destination',
        kind: 'end',
      });
    }

    return stops;
  }, [currentStop, upcomingStops, status, selectedBus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚌 Where is My Bus?
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track your bus in real-time by entering the bus number
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Bus className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter bus number (e.g., KA-01-AB-1234 or 1234)"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isTracking}
              />
              {busNumber && (
                <button
                  onClick={() => setBusNumber('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || isTracking}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Search
                </>
              )}
            </button>
            {selectedBus && (
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && !selectedBus && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Found {searchResults.length} bus(es):
              </p>
              {searchResults.map((bus) => (
                <div
                  key={bus.id}
                  onClick={() => handleSelectBus(bus)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {bus.bus_number}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bus.route_name} ({bus.route_number})
                      </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {`${bus.source} -> ${bus.destination}`}
                        </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCrowdColor(bus.crowd_level)}`}>
                        {bus.crowd_level} ({bus.crowd_percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bus Tracking Section */}
        {selectedBus && (
          <div className="space-y-6">
            {/* Snapshot cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Bus Number</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{selectedBus.bus_number}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedBus.route_name} ({selectedBus.route_number})
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCrowdColor(selectedBus.crowd_level)}`}>
                    {selectedBus.crowd_level} • {selectedBus.crowd_percentage}%
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Speed</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBus.speed.toFixed(1)} km/h</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(status || '')}`}>
                      {status || 'Tracking'}
                    </span>
                  </div>
                </div>

                {currentStop && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Live update</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{currentStop.name}</p>
                        {!currentStop.isAtStop && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{currentStop.distance}m away</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Route overview</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {`${selectedBus.source} -> ${selectedBus.destination}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">On time / live</span>
                  </div>
                </div>

                {/* Journey timeline inspired by train tracker */}
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500 via-blue-400 to-gray-200 dark:to-gray-700" />
                  <div className="space-y-4">
                    {timelineStops.map((stop, index) => {
                      const isCurrent = stop.kind === 'current';
                      const isLast = index === timelineStops.length - 1;
                      return (
                        <div key={`${stop.name}-${index}`} className="relative pl-10">
                        <div
                            className={cx(
                              'absolute left-0 top-2 h-6 w-6 rounded-full flex items-center justify-center text-white shadow',
                              stop.kind === 'start'
                                ? 'bg-green-500'
                                : stop.kind === 'end'
                                  ? 'bg-purple-500'
                                  : isCurrent
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 dark:bg-gray-600'
                            )}
                          >
                            {isCurrent ? <Navigation className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          </div>
                          <div className={cx(
                            'rounded-lg border p-3 transition-colors',
                            isCurrent
                              ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30'
                              : stop.kind === 'start'
                                ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                                : stop.kind === 'end'
                                  ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                          )}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{stop.name}</p>
                                {stop.meta && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stop.meta}</p>
                                )}
                              </div>
                              <div className="text-right">
                                {stop.eta && (
                                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                                    ETA {stop.eta}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isCurrent && (
                              <div className="mt-2 inline-flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                <Bus className="h-3.5 w-3.5" />
                                Live - updated just now
                              </div>
                            )}
                          </div>
                          {!isLast && (
                            <div className="absolute left-[11px] top-8 bottom-[-4px] w-[2px] bg-blue-200 dark:bg-gray-700" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Location Map</h3>
              </div>
              <div className="h-[600px]">
                {selectedBus && (
                  <BusRouteMap
                    selectedRoute={selectedBus.route_id}
                    onStopSelect={() => {}}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedBus && !loading && !error && busNumber === '' && (
          <div className="text-center py-12">
            <Bus className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Enter a bus number above to start tracking
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusTracker;




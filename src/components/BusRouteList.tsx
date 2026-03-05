import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bus, Clock, Users, AlertCircle, Search, Info, CloudRain, SunMedium, MapPin, Navigation } from 'lucide-react';
import bmtcApi, { BMTCRoute } from '../services/bmtcApi';
import otherBusApi, { OtherRoute } from '../services/otherBusApi';
import { busApi } from '../services/api';
import { generateMockRoutes } from '../services/mockData';
import RouteDetailsModal from './RouteDetailsModal';

interface BusRouteListProps {
  onRouteSelect: (routeId: string) => void;
  selectedRoute: string | null;
  showAll?: boolean;
  searchQuery?: string;
  filters?: {
    providers: string[];
    crowdLevels: string[];
    routeTypes: string[];
  };
}

type RouteWithProvider = (BMTCRoute | OtherRoute) & {
  provider: string;
  frequency: string;
  status: string;
  crowdLevel: string;
  crowdPercentage: number;
  nextBus: string;
  weatherHint?: {
    label: string;
    detail: string;
    icon: 'rain' | 'sun';
  };
  eventHint?: {
    label: string;
    detail: string;
    severity: 'low' | 'med' | 'high';
  };
  transferHint?: string;
};

const BusRouteList: React.FC<BusRouteListProps> = ({ 
  onRouteSelect, 
  selectedRoute, 
  showAll = false,
  searchQuery: propSearchQuery = '',
  filters: propFilters
}) => {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<RouteWithProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(propSearchQuery);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState<RouteWithProvider | null>(null);
  const [showAllLocal, setShowAllLocal] = useState(showAll);
  const providersList = ['BMTC'];

  useEffect(() => {
    setShowAllLocal(showAll);
  }, [showAll]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRoutes = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use the unified API to fetch all routes
        const allRoutes = await busApi.getAllRoutes();
        
        if (!isMounted) return;
        
        // Enhance routes with additional info (stable random values)
        const enhancedRoutes = allRoutes.map((route, index) => {
          const provider = route.provider || (
            route.id.startsWith('bmtc-') ? 'BMTC' : 
            route.id.startsWith('ksrtc-') ? 'KSRTC' : 
            route.id.startsWith('apsrtc-') ? 'APSRTC' : 
            route.id.startsWith('tnstc-') ? 'TNSTC' : 
            route.id.startsWith('best-') ? 'BEST' : 
            route.id.startsWith('dtc-') ? 'DTC' : 'Unknown'
          );
          
          // Use index for stable random values to prevent constant changes
          const crowdLevels = ['Low', 'Medium', 'High'];
          const statuses = ['On time', 'Slight delay', 'Delayed'];
          const crowdLevel = crowdLevels[index % 3];
          const status = statuses[index % 3];
          const weatherHint = buildWeatherHint(index);
          const eventHint = buildEventHint(index);
          const transferHint = buildTransferHint(index, provider);
          
          // Generate stable crowd percentage based on crowd level
          let crowdPercentage: number;
          if (crowdLevel === 'Low') {
            crowdPercentage = 20 + (index % 20); // 20-39%
          } else if (crowdLevel === 'Medium') {
            crowdPercentage = 45 + (index % 20); // 45-64%
          } else {
            crowdPercentage = 75 + (index % 20); // 75-94%
          }
          
          return {
            ...route,
            provider,
            frequency: route.frequency || `${5 + (index % 10)} min`,
            status: status,
            crowdLevel: crowdLevel,
            crowdPercentage: crowdPercentage,
            nextBus: `${1 + (index % 15)} min`,
            weatherHint,
            eventHint,
            transferHint
          };
        });
        const expandedRoutes = ensureMinimumRoutes(enhancedRoutes, 12);
        
        if (isMounted) {
          setRoutes(expandedRoutes);
          setUsingFallbackData(false);
        }
      } catch (err) {
        console.error('Error fetching routes:', err);
        
        if (!isMounted) return;
        
        setError('Failed to load routes. Using fallback data.');
        setUsingFallbackData(true);
        
        // Use the generateMockRoutes function defined below
        const mockRoutes = createMockRoutes(15);
        if (isMounted) {
          setRoutes(mockRoutes);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchRoutes();
    
    // Set up interval to refresh route data every 2 minutes (less frequent to reduce blinking)
    const intervalId = setInterval(fetchRoutes, 120000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to prevent re-running

  // Generate mock routes as a last resort
  const generateMockRoutes = (count: number): RouteWithProvider[] => {
    const routes: RouteWithProvider[] = [];
    for (let i = 0; i < count; i++) {
      const provider = providersList[i % providersList.length];
      routes.push(createSyntheticRoute(provider, i));
    }
    return ensureMinimumRoutes(routes, 12);
  };

  // Filter routes based on search query and selected provider
  const filteredRoutes = routes.filter(route => {
    // If search query is empty, show all routes
    if (searchQuery === '') {
      const matchesProvider = selectedProvider === null || route.provider === selectedProvider;
      return matchesProvider;
    }
    
    // When searching, prioritize showing routes GOING TO the searched destination
    const searchLower = searchQuery.toLowerCase();
    const matchesDestination = route.destination?.toLowerCase().includes(searchLower);
    
    // Also match route number for convenience
    const matchesRouteNumber = route.routeNumber?.toLowerCase().includes(searchLower);
    
    const matchesSearch = matchesDestination || matchesRouteNumber;
    const matchesProvider = selectedProvider === null || route.provider === selectedProvider;
    
    return matchesSearch && matchesProvider;
  });

  // If not showing all routes, only show the first 5
  const displayedRoutes = showAllLocal ? filteredRoutes : filteredRoutes.slice(0, 5);

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

  const createSyntheticRoute = (provider: string, index: number): RouteWithProvider => {
    const crowdLevel = getRandomCrowdLevel();
    const weatherHint = buildWeatherHint(index);
    const eventHint = buildEventHint(index);
    const transferHint = buildTransferHint(index, provider);

    // Real Bangalore locations for BMTC routes
    const bangaloreLocations = [
      'Whitefield', 'Electronic City', 'Hebbal', 'Silk Board',
      'Jayanagar', 'Koramangala', 'Indiranagar', 'BTM Layout', 'Banashankari',
      'Yeshwanthpur', 'Marathahalli', 'KR Puram', 'Kengeri', 'Peenya',
      'HSR Layout', 'Sarjapur', 'Bellandur', 'Yelahanka', 'Rajajinagar',
      'JP Nagar', 'Vijayanagar', 'Malleswaram', 'Kammanahalli', 'RT Nagar',
      'Bannerghatta Road', 'Bommanahalli', 'Dairy Circle', 'Shivajinagar'
    ];

    // Ensure many routes connect to/from Majestic (main bus station)
    let source: string;
    let destination: string;
    
    if (index % 3 === 0) {
      // Routes FROM Majestic to various locations
      source = 'Majestic';
      destination = bangaloreLocations[index % bangaloreLocations.length];
    } else if (index % 3 === 1) {
      // Routes TO Majestic from various locations
      source = bangaloreLocations[index % bangaloreLocations.length];
      destination = 'Majestic';
    } else {
      // Routes between other locations
      source = bangaloreLocations[index % bangaloreLocations.length];
      destination = bangaloreLocations[(index + 5) % bangaloreLocations.length];
    }
    
    const viaLocations = bangaloreLocations.filter(loc => loc !== source && loc !== destination);
    const via = viaLocations[index % viaLocations.length] || 'City Center';

    let crowdPercentage: number;
    if (crowdLevel === 'Low') {
      crowdPercentage = Math.floor(Math.random() * 30) + 10;
    } else if (crowdLevel === 'Medium') {
      crowdPercentage = Math.floor(Math.random() * 30) + 40;
    } else {
      crowdPercentage = Math.floor(Math.random() * 25) + 70;
    }

    return {
      id: `${provider.toLowerCase()}-route-synth-${index}`,
      provider,
      routeNumber: `${index % 100 < 50 ? '' : 'V'}${200 + index}${index % 10 === 0 ? 'E' : index % 7 === 0 ? 'A' : ''}`,
      routeName: `${source} - ${destination}`,
      source,
      destination,
      via: `Via ${via}`,
      frequency: `${6 + (index % 10)} min`,
      stops: [],
      status: getRandomStatus(),
      crowdLevel,
      crowdPercentage,
      nextBus: `${1 + (index % 12)} min`,
      weatherHint,
      eventHint,
      transferHint
    };
  };

  const ensureMinimumRoutes = (routes: RouteWithProvider[], minPerProvider: number): RouteWithProvider[] => {
    const existingByProvider: Record<string, RouteWithProvider[]> = {};
    routes.forEach(r => {
      existingByProvider[r.provider] = existingByProvider[r.provider] || [];
      existingByProvider[r.provider].push(r);
    });

    const expanded: RouteWithProvider[] = [...routes];
    providersList.forEach(provider => {
      const current = existingByProvider[provider]?.length || 0;
      if (current < minPerProvider) {
        const toAdd = minPerProvider - current;
        for (let i = 0; i < toAdd; i++) {
          expanded.push(createSyntheticRoute(provider, current + i));
        }
      }
    });

    return expanded;
  };

  const buildWeatherHint = (index: number): RouteWithProvider['weatherHint'] => {
    const rainMode = index % 2 === 0;
    if (rainMode) {
      return {
        label: 'Weather-smart',
        detail: 'Shortest uncovered walk; sheltered stop suggested',
        icon: 'rain'
      };
    }
    return {
      label: 'Heat-safe',
      detail: 'Lower sun exposure; shaded stop nearby',
      icon: 'sun'
    };
  };

  const buildEventHint = (index: number): RouteWithProvider['eventHint'] => {
    const severity = index % 3 === 0 ? 'high' : index % 3 === 1 ? 'med' : 'low';
    const detail = severity === 'high'
      ? 'Event surge expected—board 1 stop earlier'
      : severity === 'med'
        ? 'Minor event traffic—plan a few extra minutes'
        : 'No major events on this route';
    return {
      label: 'Event-aware',
      detail,
      severity
    };
  };

  const buildTransferHint = (index: number, provider: string): string => {
    const feederCrowd = index % 2 === 0 ? 'High' : 'Low';
    if (feederCrowd === 'High') {
      return `${provider} leg is Low — skip crowded feeder, board next stop`;
    }
    return `Smooth transfer — feeder ${feederCrowd}, bus Moderate`;
  };

  // Helper functions for random data
  function getRandomStatus() {
    const statuses = ['On time', 'Slight delay', 'Delayed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  function getRandomCrowdLevel() {
    const levels = ['Low', 'Medium', 'High'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  const truncate = (text: string, max = 52) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  // Get provider badge color
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'BMTC':
        return 'bg-blue-100 text-blue-800';
      case 'KSRTC':
        return 'bg-purple-100 text-purple-800';
      case 'APSRTC':
        return 'bg-green-100 text-green-800';
      case 'TNSTC':
        return 'bg-yellow-100 text-yellow-800';
      case 'BEST':
        return 'bg-red-100 text-red-800';
      case 'DTC':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-y-auto max-h-[500px]">
      {/* Search and filter */}
      <div className="p-4 border-b">
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('busRouteList.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`text-xs px-2 py-1 rounded-full ${selectedProvider === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setSelectedProvider(null)}
          >
            {t('busRouteList.allProviders')}
          </button>
          <button
            className={`text-xs px-2 py-1 rounded-full ${selectedProvider === 'BMTC' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setSelectedProvider('BMTC')}
          >
            BMTC
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('busRouteList.loadingRoutes')}</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-yellow-50 text-yellow-700">
          <AlertCircle className="h-5 w-5 text-yellow-500 mb-2 mx-auto" />
          <p className="text-center">{error}</p>
          <div className="mt-4">
            <p className="text-xs text-center text-gray-600">{t('busRouteList.fallbackDataNotice')}</p>
          </div>
        </div>
      ) : displayedRoutes.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600">{t('busRouteList.noRoutesFound')}</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {displayedRoutes.map((route) => (
              <li
                key={route.id}
                className={`hover:bg-gray-50 cursor-pointer transition ${selectedRoute === route.id ? 'bg-blue-50' : ''}`}
                onClick={() => onRouteSelect(route.id)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        route.provider === 'BMTC' ? 'bg-blue-100 text-blue-800' :
                        route.provider === 'KSRTC' ? 'bg-purple-100 text-purple-800' :
                        route.provider === 'APSRTC' ? 'bg-green-100 text-green-800' :
                        route.provider === 'TNSTC' ? 'bg-yellow-100 text-yellow-800' :
                        route.provider === 'BEST' ? 'bg-red-100 text-red-800' :
                        route.provider === 'DTC' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {route.routeNumber?.substring(0, 3) || route.provider.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {route.routeName || `${route.provider} ${route.routeNumber}`}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${getProviderColor(route.provider)}`}>
                            {route.provider}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">From:</span>
                            <span className="truncate">{route.source}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">To:</span>
                            <span className="truncate">{route.destination}</span>
                          </div>
                          {route.via && (
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700 mr-2">Via:</span>
                              <span className="truncate text-gray-500">{route.via}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRouteDetails(route);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View detailed route information"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        route.status === 'On time' ? 'bg-green-100 text-green-800' :
                        route.status === 'Slight delay' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {route.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCrowdLevelColor(route.crowdLevel)}`}>
                        {route.crowdLevel}
                      </span>
                    </div>
                  </div>
                  {(route.weatherHint || route.eventHint || route.transferHint) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-700">
                      {route.weatherHint && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {route.weatherHint.icon === 'rain' ? <CloudRain className="w-3 h-3 mr-1" /> : <SunMedium className="w-3 h-3 mr-1" />}
                          {route.weatherHint.label}
                        </span>
                      )}
                      {route.eventHint && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full border ${
                          route.eventHint.severity === 'high'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : route.eventHint.severity === 'med'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                              : 'bg-green-50 text-green-700 border-green-100'
                        }`}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {route.eventHint.label}
                        </span>
                      )}
                      {route.transferHint && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                          <Navigation className="w-3 h-3 mr-1" />
                          {truncate(route.transferHint, 34)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {/* Timing Information */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium">Every {route.frequency}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Bus className="flex-shrink-0 mr-2 h-4 w-4 text-blue-500" />
                        <span className="text-gray-700">
                          <span className="font-medium">Next:</span> {route.nextBus}
                        </span>
                      </div>
                    </div>

                    {/* Crowd Information */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                          <span className="font-medium">Occupancy</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{route.crowdPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            route.crowdPercentage <= 40 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            route.crowdPercentage <= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                            'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${Math.min(route.crowdPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {!showAllLocal && routes.length > 5 && (
            <div className="px-4 py-3 bg-gray-50 text-center">
              <button
                onClick={() => setShowAllLocal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('busRouteList.viewAllRoutes', { count: routes.length })}
              </button>
            </div>
          )}
        </>
      )}

      {/* Real-time indicator */}
      <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
        <span className="text-xs text-gray-600">
          {usingFallbackData ? t('busRouteList.simulatedData') : t('busRouteList.liveData')} • {t('busRouteList.autoRefreshes')}
        </span>
      </div>
      
      {/* Route Details Modal */}
      {showRouteDetails && (
        <RouteDetailsModal
          route={showRouteDetails}
          onClose={() => setShowRouteDetails(null)}
          onTrackLive={(routeId) => {
            onRouteSelect(routeId);
            window.dispatchEvent(new CustomEvent('open-bus-tracker', { detail: { routeId } }));
            setShowRouteDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default BusRouteList;

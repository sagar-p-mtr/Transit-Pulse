import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Route, Users, Filter, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronRight, Bus } from 'lucide-react';
import BusRouteMap from './BusRouteMap';
import BusSchedule from './BusSchedule';
import BusRouteList from './BusRouteList';
import CrowdDetectionInfo from './CrowdDetectionInfo';
import BusTracker from './BusTracker';

interface LiveTrackingSectionProps {
  selectedRoute: string | null;
  onRouteSelect: (routeId: string) => void;
  onStopSelect: (stopId: string) => void;
  searchQuery: string;
  user: any;
  isOnline?: boolean;
  isDataStale?: boolean;
}

const LiveTrackingSection: React.FC<LiveTrackingSectionProps> = ({
  selectedRoute,
  onRouteSelect,
  onStopSelect,
  searchQuery,
  user,
  isOnline = true,
  isDataStale = false
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'map' | 'schedule' | 'routes' | 'crowd' | 'tracker'>('map');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [locationRequested, setLocationRequested] = useState(false);
  const [filters, setFilters] = useState({
    providers: ['BMTC'],
    crowdLevels: ['Low', 'Medium', 'High'],
    routeTypes: ['Express', 'Ordinary', 'Volvo']
  });

  const requestLocation = () => {
    setLocationRequested(true);
    setShowLocationPrompt(false);
    
    // Get user's current location with high accuracy using Google Maps Geocoding API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Current coordinates:', latitude, longitude);
          
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            console.warn('Google Maps API key not found, using default location');
            setCurrentLocation('Bengaluru, Karnataka');
            return;
          }
          
          try {
            // Use Google Maps Geocoding API for accurate reverse geocoding
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Google Maps Geocoding data:', data);
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const result = data.results[0];
              console.log('Address components:', result.address_components);
              console.log('Formatted address:', result.formatted_address);
              
              // Extract location components with priority for most specific details
              let road = '';
              let premise = '';
              let sublocality_level_2 = '';
              let sublocality_level_1 = '';
              let locality = '';
              let city = '';
              let state = '';
              
              result.address_components.forEach((component: any) => {
                if (component.types.includes('route') || component.types.includes('road')) {
                  road = component.long_name;
                } else if (component.types.includes('premise')) {
                  premise = component.long_name;
                } else if (component.types.includes('sublocality_level_2')) {
                  sublocality_level_2 = component.long_name;
                } else if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
                  sublocality_level_1 = component.long_name;
                } else if (component.types.includes('locality')) {
                  locality = component.long_name;
                } else if (component.types.includes('administrative_area_level_2')) {
                  city = city || component.long_name;
                } else if (component.types.includes('administrative_area_level_1')) {
                  state = component.long_name;
                }
              });
              
              // Build the most specific location string
              // Priority: sublocality_level_2 > sublocality_level_1 > locality
              const specificArea = sublocality_level_2 || sublocality_level_1 || locality || city;
              const mainCity = locality || city || 'Bengaluru';
              const finalState = state || 'Karnataka';
              
              console.log('Extracted details:');
              console.log('- Road/Street:', road);
              console.log('- Sublocality L2:', sublocality_level_2);
              console.log('- Sublocality L1:', sublocality_level_1);
              console.log('- Locality:', locality);
              console.log('- City:', city);
              console.log('- State:', state);
              
              // Create location string with most specific area
              if (specificArea && specificArea !== mainCity) {
                setCurrentLocation(`${specificArea}, ${mainCity}, ${finalState}`);
              } else if (mainCity && finalState) {
                setCurrentLocation(`${mainCity}, ${finalState}`);
              } else {
                // Use first part of formatted address as fallback
                const addressParts = result.formatted_address.split(',').slice(0, 2).map((p: string) => p.trim());
                setCurrentLocation(addressParts.join(', '));
              }
            } else {
              console.error('Geocoding failed:', data.status);
              setCurrentLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            console.error('Error fetching location from Google Maps:', error);
            setCurrentLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.error('Geolocation error:', error.message, error.code);
          // Set empty location when permission is denied or location fails
          setCurrentLocation('');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      setCurrentLocation('');
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.routeId) {
        onRouteSelect(detail.routeId);
      }
      setActiveTab('tracker');
    };
    window.addEventListener('open-bus-tracker', handler as EventListener);
    return () => window.removeEventListener('open-bus-tracker', handler as EventListener);
  }, [onRouteSelect]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleFilterChange = (category: string, value: string) => {
    setFilters(prev => {
      const categoryKey = category as keyof typeof prev;
      const currentValues = prev[categoryKey];
      
      if (Array.isArray(currentValues)) {
        return {
          ...prev,
          [category]: currentValues.includes(value)
            ? currentValues.filter((item: string) => item !== value)
            : [...currentValues, value]
        };
      }
      return prev;
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('tracking.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {isOnline 
                  ? t('tracking.subtitle') 
                  : t('tracking.offlineSubtitle')}
                {isDataStale && ` (${t('tracking.dataStale')})`}
              </p>
            </div>
            
            {/* Location Prompt - Ask user to enable location */}
            {showLocationPrompt && !locationRequested && (
              <div className="flex-shrink-0 lg:mx-4">
                <button
                  onClick={requestLocation}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 hover:border-blue-600 rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Enable Location</p>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Click to share your location</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
            
            {/* Current Location Box - Only show if location is available */}
            {currentLocation && (
              <div className="flex-shrink-0 lg:mx-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 rounded-xl px-6 py-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Current Location</p>
                      <p className="text-sm font-bold text-green-900 dark:text-green-100">{currentLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || !isOnline}
                aria-label={isRefreshing ? t('common.refreshing') : t('common.refresh')}
                className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ${
                  isRefreshing || !isOnline ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? t('common.refreshing') : t('common.refresh')}</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? t('common.hideFilters') : t('common.showFilters')}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common.filter')}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'map' 
                  ? 'bg-blue-600 shadow-md text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tracking.tabs.liveMap')}</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'schedule' 
                  ? 'bg-blue-600 shadow-md text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tracking.tabs.schedules')}</span>
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'routes' 
                  ? 'bg-blue-600 shadow-md text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tracking.tabs.allRoutes')}</span>
            </button>
            <button
              onClick={() => setActiveTab('crowd')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'crowd' 
                  ? 'bg-blue-600 shadow-md text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tracking.tabs.crowdInfo')}</span>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'tracker' 
                  ? 'bg-blue-600 shadow-md text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Bus className="h-4 w-4" />
              <span className="hidden sm:inline">Transit Pulse</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('tracking.filterOptions')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bus Providers */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('tracking.busProviders')}</h4>
                <div className="space-y-2">
                  {['BMTC'].map(provider => (
                    <label key={provider} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.providers.includes(provider)}
                        onChange={() => handleFilterChange('providers', provider)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Crowd Levels */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('tracking.crowdLevels')}</h4>
                <div className="space-y-2">
                  {['Low', 'Medium', 'High'].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.crowdLevels.includes(level)}
                        onChange={() => handleFilterChange('crowdLevels', level)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          level === 'Low' ? 'bg-green-500' :
                          level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Route Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('tracking.routeTypes')}</h4>
                <div className="space-y-2">
                  {['Express', 'Ordinary', 'Volvo', 'AC', 'Non-AC'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.routeTypes.includes(type)}
                        onChange={() => handleFilterChange('routeTypes', type)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-96'} ${activeTab === 'routes' ? 'order-2 lg:order-1' : 'order-1'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Route className="mr-2 h-5 w-5 text-blue-500" />
                    {t('tracking.busRoutes')}
                  </h3>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  aria-label={sidebarCollapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
              </div>
              {!sidebarCollapsed && (
                <BusRouteList 
                  onRouteSelect={onRouteSelect} 
                  selectedRoute={selectedRoute}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 order-1 ${activeTab === 'routes' ? 'lg:order-2' : 'lg:order-2'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[600px]">
              {activeTab === 'map' && (
                <div className="h-full">
                  <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                      {t('tracking.liveBusMap')}
                      {selectedRoute && (
                        <span className="ml-3 text-sm text-gray-600">
                          {t('tracking.route')}: {selectedRoute}
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {showMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="text-sm">{showMap ? t('tracking.hideMap') : t('tracking.showMap')}</span>
                    </button>
                  </div>
                  {showMap ? (
                    <BusRouteMap
                      selectedRoute={selectedRoute}
                      onStopSelect={onStopSelect}
                      filters={filters}
                      searchQuery={searchQuery}
                    />
                  ) : (
                    <div className="p-8 text-center bg-gray-50 h-96 flex items-center justify-center">
                      <div>
                        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">{t('tracking.mapHidden')}</p>
                        <button
                          onClick={() => setShowMap(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {t('tracking.showMap')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="h-full">
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-blue-500" />
                      {t('tracking.busSchedules')}
                    </h3>
                  </div>
                  <BusSchedule
                    selectedRoute={selectedRoute}
                  />
                </div>
              )}

              {activeTab === 'routes' && (
                <div className="h-full">
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Route className="mr-2 h-5 w-5 text-blue-500" />
                      {t('tracking.allBusRoutes')}
                    </h3>
                  </div>
                  <div className="p-4">
                    <BusRouteList
                      onRouteSelect={onRouteSelect}
                      selectedRoute={selectedRoute}
                      showAll={true}
                      searchQuery={searchQuery}
                      filters={filters}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'crowd' && (
                <div className="h-full">
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-500" />
                      {t('tracking.crowdDetectionInfo')}
                    </h3>
                  </div>
                  <CrowdDetectionInfo
                    selectedRoute={selectedRoute}
                    user={user}
                  />
                </div>
              )}

              {activeTab === 'tracker' && (
                <div className="h-full">
                  <BusTracker />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveTrackingSection;

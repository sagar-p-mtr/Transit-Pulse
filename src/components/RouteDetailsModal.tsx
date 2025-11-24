import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Clock, Users, Navigation, Zap, AlertTriangle, 
  Star, ThermometerSun, Wifi, CreditCard, Shield, Info,
  TrendingUp, TrendingDown, Activity, CheckCircle, XCircle,
  Phone, MessageSquare, Heart, Share2, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveBusTracker from './LiveBusTracker';

interface RouteDetailsModalProps {
  route: {
    id: string;
    routeNumber?: string;
    name: string;
    from: string;
    to: string;
    provider: string;
    crowdLevel: string;
    crowdPercentage: number;
    status: string;
    frequency: string;
    nextBus: string;
  } | null;
  onClose: () => void;
  onTrackLive?: (routeId: string) => void;
}

interface StationInfo {
  id: string;
  name: string;
  crowdLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  crowdPercentage: number;
  facilities: string[];
  waitTime: number;
  nextBus: string;
  coordinates: { lat: number; lng: number };
  amenities: {
    shelter: boolean;
    seating: boolean;
    lighting: boolean;
    digital_display: boolean;
    accessibility: boolean;
    parking: boolean;
  };
  safety: {
    cctv: boolean;
    security: boolean;
    emergency_contact: boolean;
  };
  connectivity: {
    wifi: boolean;
    charging: boolean;
    mobile_signal: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  };
}

const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({ route, onClose, onTrackLive }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stations' | 'schedule' | 'alerts'>('overview');
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(false);

  useEffect(() => {
    if (route) {
      // Generate comprehensive station data based on route
      generateStationData();
    }
  }, [route]);

  const generateStationData = () => {
    if (!route) return;

    // Create realistic station data based on route
    const stationNames = getStationNames(route);
    const generatedStations: StationInfo[] = stationNames.map((name, index) => ({
      id: `station-${index}`,
      name,
      crowdLevel: (['Low', 'Medium', 'High', 'Critical'] as const)[Math.floor(Math.random() * 4)],
      crowdPercentage: Math.floor(Math.random() * 90) + 10,
      facilities: generateFacilities(),
      waitTime: Math.floor(Math.random() * 15) + 2,
      nextBus: `${Math.floor(Math.random() * 20) + 3} min`,
      coordinates: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lng: 77.5946 + (Math.random() - 0.5) * 0.1
      },
      amenities: {
        shelter: Math.random() > 0.3,
        seating: Math.random() > 0.4,
        lighting: Math.random() > 0.2,
        digital_display: Math.random() > 0.6,
        accessibility: Math.random() > 0.5,
        parking: Math.random() > 0.7
      },
      safety: {
        cctv: Math.random() > 0.4,
        security: Math.random() > 0.8,
        emergency_contact: Math.random() > 0.3
      },
      connectivity: {
        wifi: Math.random() > 0.6,
        charging: Math.random() > 0.7,
        mobile_signal: (['Excellent', 'Good', 'Fair', 'Poor'] as const)[Math.floor(Math.random() * 4)]
      }
    }));

    setStations(generatedStations);
  };

  const getStationNames = (route: any): string[] => {
    // Generate realistic station names based on route
    const commonStations = [
      'Majestic', 'MG Road', 'Brigade Road', 'Cubbon Park', 'Vidhana Soudha',
      'Indiranagar', 'Koramangala', 'HSR Layout', 'BTM Layout', 'Jayanagar',
      'Electronic City', 'Whitefield', 'Marathahalli', 'Silk Board', 'Hebbal',
      'Yelahanka', 'Banashankari', 'JP Nagar', 'Wilson Garden', 'Shivajinagar'
    ];

    // Include from and to stations
    const stationSet = new Set([route.from, route.to]);
    
    // Add 4-8 intermediate stations
    const numStations = Math.floor(Math.random() * 5) + 4;
    while (stationSet.size < numStations + 2) {
      const randomStation = commonStations[Math.floor(Math.random() * commonStations.length)];
      stationSet.add(randomStation);
    }

    return Array.from(stationSet);
  };

  const generateFacilities = (): string[] => {
    const allFacilities = [
      'Bus Shelter', 'Seating', 'LED Display', 'CCTV', 'WiFi', 'Charging Points',
      'Restrooms', 'Food Stalls', 'ATM', 'Parking', 'Wheelchair Access', 'Security'
    ];
    
    const numFacilities = Math.floor(Math.random() * 6) + 3;
    const shuffled = allFacilities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numFacilities);
  };

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-700 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'High': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'BMTC': return 'from-blue-700 to-blue-900 text-white';
      case 'KSRTC': return 'from-purple-700 to-purple-900 text-white';
      case 'APSRTC': return 'from-green-700 to-green-900 text-white';
      case 'TNSTC': return 'from-yellow-600 to-amber-700 text-white';
      case 'BEST': return 'from-rose-700 to-rose-900 text-white';
      case 'DTC': return 'from-indigo-700 to-indigo-900 text-white';
      default: return 'from-gray-600 to-gray-800 text-white';
    }
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/route/${route?.id}`;
    const text = `Check out this bus route: ${route?.name}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  if (!route) return null;

  return (
    <>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 pb-8 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-none min-h-fit overflow-hidden mx-4 my-auto border border-gray-200/80 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-4 sm:p-6 text-white ${getProviderColor(route.provider)} bg-gradient-to-r`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg flex-shrink-0">
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">
                      {route.routeNumber || route.name}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                      <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                        {route.provider}
                      </span>
                      <span className="bg-white/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex-shrink-0">
                        {route.crowdLevel} {route.crowdPercentage}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm sm:text-base truncate">
                    {route.from} → {route.to}
                  </p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-1 text-xs sm:text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        route.crowdLevel === 'Low' ? 'bg-green-400' :
                        route.crowdLevel === 'Medium' ? 'bg-yellow-400' :
                        route.crowdLevel === 'High' ? 'bg-orange-400' : 'bg-red-400'
                      }`} />
                      <span className="text-white/80">Live Data</span>
                    </div>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-white/80 text-xs sm:text-sm">
                      Updated {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isBookmarked ? "Remove from favorites" : "Add to favorites"}
                >
                  <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Share route"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 min-w-[150px] z-10">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        📱 WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('telegram')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        ✈️ Telegram
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <div className="flex space-x-0">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'stations', label: 'Stations', icon: MapPin },
                { id: 'schedule', label: 'Schedule', icon: Clock },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-bold text-blue-900 dark:text-blue-100">{route.frequency}</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">Frequency</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <Navigation className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="font-bold text-green-900 dark:text-green-100">{route.nextBus}</div>
                      <div className="text-xs text-green-700 dark:text-green-300">Next Bus</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                      <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-bold text-orange-900 dark:text-orange-100">{route.crowdPercentage}%</div>
                      <div className="text-xs text-orange-700 dark:text-orange-300">Occupancy</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                      <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-purple-900 dark:text-purple-100">4.2</div>
                      <div className="text-xs text-purple-700 dark:text-purple-300">Rating</div>
                    </div>
                  </div>

                  {/* Route Status */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Status</h3>
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                        route.status === 'On time' ? 'bg-green-100 text-green-800' :
                        route.status === 'Slight delay' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {route.status === 'On time' ? <CheckCircle className="w-4 h-4" /> :
                         route.status === 'Slight delay' ? <Clock className="w-4 h-4" /> :
                         <XCircle className="w-4 h-4" />}
                        <span className="text-sm font-medium">{route.status}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Route Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { icon: Wifi, label: 'WiFi Available', available: Math.random() > 0.4 },
                        { icon: CreditCard, label: 'Card Payment', available: Math.random() > 0.3 },
                        { icon: Shield, label: 'CCTV Security', available: Math.random() > 0.2 },
                        { icon: ThermometerSun, label: 'AC Available', available: route.provider === 'BMTC' },
                        { icon: Phone, label: 'GPS Tracking', available: true },
                        { icon: Heart, label: 'Accessibility', available: Math.random() > 0.5 }
                      ].map((feature, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-3 rounded-lg ${
                            feature.available 
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <feature.icon className="w-4 h-4" />
                          <span className="text-sm">{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stations' && (
                <motion.div
                  key="stations"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Route Stations ({stations.length})
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Live crowd data
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {stations.map((station, index) => (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${
                                station.crowdPercentage <= 40 ? 'bg-green-500' :
                                station.crowdPercentage <= 70 ? 'bg-yellow-500' :
                                station.crowdPercentage <= 85 ? 'bg-orange-500' : 'bg-red-500'
                              }`} />
                              {index < stations.length - 1 && (
                                <div className="w-px h-8 bg-gray-300 dark:bg-gray-500 mt-2" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{station.name}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCrowdLevelColor(station.crowdLevel)}`}>
                                  {station.crowdLevel}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Next: {station.nextBus}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {station.crowdPercentage}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {station.waitTime}m wait
                            </div>
                          </div>
                        </div>
                        
                        {/* Station Facilities */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {station.facilities.slice(0, 4).map((facility, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                              >
                                {facility}
                              </span>
                            ))}
                            {station.facilities.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                +{station.facilities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Peak Hours</h4>
                        <div className="space-y-2">
                          {['07:00 - 09:30', '17:30 - 20:00'].map((time, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <span className="text-red-700 dark:text-red-300 font-medium">{time}</span>
                              <span className="text-xs text-red-600 dark:text-red-400">High Demand</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Off-Peak Hours</h4>
                        <div className="space-y-2">
                          {['10:00 - 16:00', '21:00 - 06:00'].map((time, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-green-700 dark:text-green-300 font-medium">{time}</span>
                              <span className="text-xs text-green-600 dark:text-green-400">Low Demand</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Frequency Pattern</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Frequency</span>
                        <span className="font-bold text-gray-900 dark:text-white">{route.frequency}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'alerts' && (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">Live Alerts & Updates</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Traffic Alert</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                            Heavy traffic reported near {stations[Math.floor(stations.length / 2)]?.name}. 
                            Expect 5-10 minute delays.
                          </p>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                            2 minutes ago
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Service Update</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                            Additional buses deployed during peak hours. Frequency improved to every 3-4 minutes.
                          </p>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            15 minutes ago
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100">Good News!</h4>
                          <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                            Route is running on time with comfortable crowd levels. Great time to travel!
                          </p>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                            1 hour ago
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Alert Preferences</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">High crowd alerts</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Delay notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-blue-600" />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Service updates</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4 mr-1 inline" />
                  Feedback
                </button>
                <button 
                  onClick={() => {
                    if (onTrackLive && route?.id) {
                      onTrackLive(route.id);
                    }
                    setShowLiveTracking(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Track Live
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    {/* Live Tracking Modal */}
  {showLiveTracking && route && (
    <LiveBusTracker
      busId={route.id || '1'}
      routeId={route.id}
      busNumber={route.routeNumber || route.name}
      onClose={() => setShowLiveTracking(false)}
    />
  )}
    </>
  );
};

export default RouteDetailsModal;

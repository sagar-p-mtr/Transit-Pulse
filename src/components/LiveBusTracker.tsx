import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, MapPin, Clock, Users, Gauge, Navigation, 
  AlertCircle, ChevronRight, Wifi, WifiOff, Circle,
  Activity, TrendingUp, Target, Route, Timer,
  ChevronLeft, X, Maximize2, Minimize2
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import io from 'socket.io-client';
import axios from 'axios';

interface LiveBusTrackerProps {
  busId: string;
  routeId: string;
  busNumber: string;
  onClose?: () => void;
}

interface BusPosition {
  lat: number;
  lng: number;
  heading: number;
}

interface LiveData {
  position: BusPosition;
  speed: number;
  crowdLevel: string;
  crowdPercentage: number;
  lastUpdated: string;
  isActive: boolean;
}

interface JourneyData {
  currentStopIndex: number;
  totalStops: number;
  progressPercentage: number;
  upcomingStops: any[];
  previousStops: any[];
  etaToNextStop: number;
  etaToDestination: number;
  totalDistance: number;
  estimatedTime: number;
}

interface Stop {
  name: string;
  latitude: number;
  longitude: number;
  isPassed: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
}

const LiveBusTracker: React.FC<LiveBusTrackerProps> = ({ 
  busId, 
  routeId, 
  busNumber, 
  onClose 
}) => {
  const [busData, setBusData] = useState<any>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [trail, setTrail] = useState<BusPosition[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ 
    lat: 12.9716, 
    lng: 77.5946 
  });
  
  const socketRef = useRef<any>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const busMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry']
  });

  // Fetch initial bus data
  useEffect(() => {
    fetchBusData();
    connectToWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [busId]);

  const fetchBusData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/live-tracking/${busId}/live`
      );
      
      if (response.data.success) {
        const { data } = response.data;
        setBusData(data.bus);
        setLiveData(data.liveData);
        setJourneyData(data.journey);
        setStops(data.stops);
        setTrail(data.trail || []);
        
        if (data.liveData.position) {
          setMapCenter({
            lat: data.liveData.position.lat,
            lng: data.liveData.position.lng
          });
        }
      }
    } catch (error) {
      console.error('Error fetching bus data:', error);
    }
  };

  const connectToWebSocket = () => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      socket.emit('joinBusRoom', { busId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    socket.on('busPositionUpdate', (data: any) => {
      handlePositionUpdate(data);
    });
  };

  const handlePositionUpdate = (data: any) => {
    if (data.busId === busId) {
      // Update live data
      setLiveData(prev => ({
        ...prev!,
        position: data.position,
        speed: data.speed,
        lastUpdated: data.timestamp
      }));

      // Add to trail
      setTrail(prev => {
        const newTrail = [...prev, data.position];
        return newTrail.slice(-30); // Keep last 30 positions
      });

      // Update journey progress if current stop changed
      if (data.currentStopIndex !== undefined) {
        setJourneyData(prev => ({
          ...prev!,
          currentStopIndex: data.currentStopIndex,
          progressPercentage: (data.currentStopIndex / (prev?.totalStops || 1)) * 100
        }));

        // Update stops status
        setStops(prev => prev.map((stop, index) => ({
          ...stop,
          isPassed: index < data.currentStopIndex,
          isCurrent: index === data.currentStopIndex,
          isUpcoming: index > data.currentStopIndex
        })));
      }

      // Animate bus movement
      animateBusMovement(data.position);
    }
  };

  const animateBusMovement = (newPosition: BusPosition) => {
    if (!busMarkerRef.current || !liveData) return;

    const startPosition = liveData.position;
    const endPosition = newPosition;
    const duration = 2000; // 2 seconds animation
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Interpolate position
      const lat = startPosition.lat + (endPosition.lat - startPosition.lat) * progress;
      const lng = startPosition.lng + (endPosition.lng - startPosition.lng) * progress;

      if (busMarkerRef.current) {
        busMarkerRef.current.setPosition({ lat, lng });
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  const getCrowdColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCrowdBgColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return date.toLocaleTimeString();
  };

  if (!isLoaded || !busData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-white dark:bg-gray-900 ${isFullscreen ? '' : 'lg:inset-4 lg:rounded-2xl lg:shadow-2xl'}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Bus className="w-6 h-6 mr-2 text-blue-600" />
                Bus {busNumber}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {busData.routeName} • {busData.source} → {busData.destination}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isConnected ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
              <span className="text-xs font-medium">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
            >
              <Gauge className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {liveData?.speed || 0} km/h
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`flex items-center px-3 py-2 rounded-lg ${getCrowdBgColor(liveData?.crowdLevel || '')}`}
            >
              <Users className={`w-4 h-4 mr-2 ${getCrowdColor(liveData?.crowdLevel || '')}`} />
              <span className="text-sm font-medium">
                {liveData?.crowdLevel} ({liveData?.crowdPercentage || 0}%)
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
            >
              <Target className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Stop {journeyData?.currentStopIndex || 0} of {journeyData?.totalStops || 0}
              </span>
            </motion.div>

            {journeyData?.etaToDestination && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center px-3 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"
              >
                <Timer className="w-4 h-4 mr-2 text-orange-600" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  ETA: {formatTime(journeyData.etaToDestination)}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={14}
            onLoad={(map) => { mapRef.current = map; }}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {/* Route Path */}
            {stops.length > 0 && (
              <Polyline
                path={stops.map(stop => ({ 
                  lat: parseFloat(stop.latitude), 
                  lng: parseFloat(stop.longitude) 
                }))}
                options={{
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.8,
                  strokeWeight: 4
                }}
              />
            )}

            {/* Trail Path */}
            {trail.length > 1 && (
              <Polyline
                path={trail}
                options={{
                  strokeColor: '#10B981',
                  strokeOpacity: 0.6,
                  strokeWeight: 3,
                  strokeDasharray: [10, 5]
                }}
              />
            )}

            {/* Stop Markers */}
            {stops.map((stop, index) => (
              <Marker
                key={index}
                position={{ 
                  lat: parseFloat(stop.latitude), 
                  lng: parseFloat(stop.longitude) 
                }}
                onClick={() => setSelectedStop(stop)}
                icon={{
                  url: stop.isPassed 
                    ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="#10B981" stroke="white" stroke-width="2"/>
                          <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      `)
                    : stop.isCurrent
                    ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
                          <circle cx="16" cy="16" r="6" fill="white"/>
                        </svg>
                      `)
                    : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="#94A3B8" stroke="white" stroke-width="2"/>
                        </svg>
                      `),
                  scaledSize: stop.isCurrent 
                    ? new google.maps.Size(32, 32) 
                    : new google.maps.Size(24, 24)
                }}
              />
            ))}

            {/* Bus Marker */}
            {liveData?.position && (
              <Marker
                position={liveData.position}
                onLoad={(marker) => { busMarkerRef.current = marker; }}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_d)">
                        <rect x="8" y="8" width="32" height="32" rx="8" fill="#3B82F6"/>
                        <path d="M16 20h16v12H16V20z" fill="white" opacity="0.9"/>
                        <path d="M18 16h12v4H18v-4z" fill="white" opacity="0.7"/>
                        <circle cx="20" cy="28" r="2" fill="#3B82F6"/>
                        <circle cx="28" cy="28" r="2" fill="#3B82F6"/>
                      </g>
                      <defs>
                        <filter id="filter0_d">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                        </filter>
                      </defs>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(48, 48),
                  anchor: new google.maps.Point(24, 24),
                  rotation: liveData.position.heading
                }}
              />
            )}
          </GoogleMap>

          {/* Last Updated Badge */}
          <div className="absolute bottom-4 left-4 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 flex items-center space-x-2"
            >
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Updated {liveData ? formatLastUpdated(liveData.lastUpdated) : 'N/A'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Journey Progress */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Journey Progress</h3>
            
            {/* Progress Bar */}
            <div className="relative mb-6">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${journeyData?.progressPercentage || 0}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                />
              </div>
              <div className="absolute -top-1 left-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              <div 
                className="absolute -top-1 w-8 h-8 transform -translate-x-1/2"
                style={{ left: `${journeyData?.progressPercentage || 0}%` }}
              >
                <Bus className="w-8 h-8 text-blue-600 animate-bounce" />
              </div>
              <div className="absolute -top-1 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{busData.source}</span>
              <span className="font-medium text-blue-600">{Math.round(journeyData?.progressPercentage || 0)}%</span>
              <span className="text-gray-600 dark:text-gray-400">{busData.destination}</span>
            </div>
          </div>

          {/* Stops List */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Route Stops</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stops.map((stop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    stop.isPassed 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : stop.isCurrent 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setMapCenter({
                      lat: parseFloat(stop.latitude),
                      lng: parseFloat(stop.longitude)
                    });
                    mapRef.current?.panTo({
                      lat: parseFloat(stop.latitude),
                      lng: parseFloat(stop.longitude)
                    });
                  }}
                >
                  {/* Stop indicator line */}
                  {index < stops.length - 1 && (
                    <div className={`absolute left-6 top-12 bottom-0 w-0.5 ${
                      stop.isPassed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}

                  {/* Stop marker */}
                  <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                    stop.isPassed 
                      ? 'bg-green-500 border-green-500' 
                      : stop.isCurrent
                      ? 'bg-blue-500 border-blue-500 animate-pulse'
                      : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                  }`}>
                    {stop.isPassed && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {stop.isCurrent && (
                      <Circle className="w-full h-full text-white animate-ping absolute" />
                    )}
                  </div>

                  {/* Stop details */}
                  <div className="ml-3 flex-1">
                    <p className={`font-medium ${
                      stop.isCurrent 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {stop.name}
                    </p>
                    {stop.isCurrent && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Current Location • ETA: Now
                      </p>
                    )}
                    {stop.isUpcoming && index === journeyData?.currentStopIndex + 1 && journeyData?.etaToNextStop && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Next Stop • ETA: {formatTime(journeyData.etaToNextStop)}
                      </p>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 ${
                    stop.isPassed 
                      ? 'text-green-600' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBusTracker;
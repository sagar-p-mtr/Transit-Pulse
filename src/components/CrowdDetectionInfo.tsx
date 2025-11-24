import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, Info, TrendingUp, TrendingDown, Clock, MapPin, 
  Zap, BarChart3, Activity, Bell, RefreshCw, Eye, ThermometerSun,
  Calendar, Navigation, Wifi, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { crowdPredictionApi } from '../services/crowdPredictionApi';
import { isLiveDataEnabled } from '../config/runtime';

interface CrowdDetectionInfoProps {
  selectedRoute: string | null;
  user?: any;
}

interface CrowdData {
  routeId: string;
  routeName: string;
  currentCrowdLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  crowdPercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  peakHours: string[];
  averageWaitTime: number;
  lastUpdated: string;
  temperature: number;
  airQuality: 'Good' | 'Moderate' | 'Poor';
  predictions: {
    time: string;
    crowdLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    confidence: number;
    temperature: number;
  }[];
  hourlyData: {
    hour: string;
    crowdLevel: number;
    passengerCount: number;
  }[];
  stations: {
    name: string;
    crowdLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    percentage: number;
    waitTime: number;
  }[];
}

const CrowdDetectionInfo: React.FC<CrowdDetectionInfoProps> = ({ selectedRoute, user }) => {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'live' | 'analytics' | 'alerts'>('live');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchCrowdData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchCrowdData();
        setLastRefresh(new Date());
      }, 15000); // Update every 15 seconds
      return () => clearInterval(interval);
    }
  }, [selectedRoute, autoRefresh]);

  const fetchCrowdData = async () => {
    setLoading(true);
    try {
      // Enhanced mock data with more comprehensive information
      const mockData: CrowdData[] = [
        {
          routeId: 'bmtc-500',
          routeName: 'BMTC 500 - Majestic to Whitefield',
          currentCrowdLevel: 'High',
          crowdPercentage: 87,
          trend: 'increasing',
          peakHours: ['08:00-10:00', '17:30-19:30'],
          averageWaitTime: 8,
          temperature: 28,
          airQuality: 'Moderate',
          lastUpdated: new Date().toISOString(),
          predictions: [
            { time: '15:30', crowdLevel: 'High', confidence: 94, temperature: 29 },
            { time: '16:00', crowdLevel: 'High', confidence: 91, temperature: 30 },
            { time: '16:30', crowdLevel: 'Critical', confidence: 88, temperature: 31 },
            { time: '17:00', crowdLevel: 'High', confidence: 85, temperature: 30 },
            { time: '17:30', crowdLevel: 'Medium', confidence: 78, temperature: 29 },
            { time: '18:00', crowdLevel: 'Low', confidence: 82, temperature: 28 },
          ],
          hourlyData: [
            { hour: '12:00', crowdLevel: 45, passengerCount: 32 },
            { hour: '13:00', crowdLevel: 67, passengerCount: 48 },
            { hour: '14:00', crowdLevel: 78, passengerCount: 56 },
            { hour: '15:00', crowdLevel: 87, passengerCount: 62 },
            { hour: '16:00', crowdLevel: 92, passengerCount: 66 },
            { hour: '17:00', crowdLevel: 85, passengerCount: 61 },
          ],
          stations: [
            { name: 'Majestic', crowdLevel: 'High', percentage: 85, waitTime: 12 },
            { name: 'MG Road', crowdLevel: 'Critical', percentage: 95, waitTime: 15 },
            { name: 'Indiranagar', crowdLevel: 'High', percentage: 82, waitTime: 10 },
            { name: 'Marathahalli', crowdLevel: 'Medium', percentage: 65, waitTime: 6 },
            { name: 'Whitefield', crowdLevel: 'Low', percentage: 35, waitTime: 3 },
          ]
        },
        {
          routeId: 'bmtc-335E',
          routeName: 'BMTC 335E - Banashankari to Electronic City',
          currentCrowdLevel: 'Medium',
          crowdPercentage: 68,
          trend: 'stable',
          peakHours: ['07:30-09:30', '18:00-20:00'],
          averageWaitTime: 5,
          temperature: 26,
          airQuality: 'Good',
          lastUpdated: new Date().toISOString(),
          predictions: [
            { time: '15:30', crowdLevel: 'Medium', confidence: 89, temperature: 27 },
            { time: '16:00', crowdLevel: 'High', confidence: 92, temperature: 28 },
            { time: '16:30', crowdLevel: 'High', confidence: 87, temperature: 28 },
            { time: '17:00', crowdLevel: 'High', confidence: 85, temperature: 27 },
            { time: '17:30', crowdLevel: 'Medium', confidence: 80, temperature: 26 },
            { time: '18:00', crowdLevel: 'Low', confidence: 75, temperature: 25 },
          ],
          hourlyData: [
            { hour: '12:00', crowdLevel: 35, passengerCount: 25 },
            { hour: '13:00', crowdLevel: 52, passengerCount: 37 },
            { hour: '14:00', crowdLevel: 68, passengerCount: 49 },
            { hour: '15:00', crowdLevel: 72, passengerCount: 51 },
            { hour: '16:00', crowdLevel: 78, passengerCount: 56 },
            { hour: '17:00', crowdLevel: 65, passengerCount: 46 },
          ],
          stations: [
            { name: 'Banashankari', crowdLevel: 'Medium', percentage: 65, waitTime: 8 },
            { name: 'Jayanagar', crowdLevel: 'High', percentage: 78, waitTime: 11 },
            { name: 'BTM Layout', crowdLevel: 'High', percentage: 82, waitTime: 12 },
            { name: 'Silk Board', crowdLevel: 'Medium', percentage: 58, waitTime: 7 },
            { name: 'Electronic City', crowdLevel: 'Low', percentage: 28, waitTime: 4 },
          ]
        },
        {
          routeId: 'bmtc-201R',
          routeName: 'BMTC 201R - Hebbal to Koramangala',
          currentCrowdLevel: 'Low',
          crowdPercentage: 42,
          trend: 'decreasing',
          peakHours: ['08:30-10:00', '17:00-18:30'],
          averageWaitTime: 4,
          temperature: 25,
          airQuality: 'Good',
          lastUpdated: new Date().toISOString(),
          predictions: [
            { time: '15:30', crowdLevel: 'Low', confidence: 85, temperature: 26 },
            { time: '16:00', crowdLevel: 'Medium', confidence: 78, temperature: 27 },
            { time: '16:30', crowdLevel: 'Medium', confidence: 82, temperature: 27 },
            { time: '17:00', crowdLevel: 'High', confidence: 88, temperature: 26 },
            { time: '17:30', crowdLevel: 'Medium', confidence: 75, temperature: 25 },
            { time: '18:00', crowdLevel: 'Low', confidence: 80, temperature: 24 },
          ],
          hourlyData: [
            { hour: '12:00', crowdLevel: 28, passengerCount: 20 },
            { hour: '13:00', crowdLevel: 35, passengerCount: 25 },
            { hour: '14:00', crowdLevel: 42, passengerCount: 30 },
            { hour: '15:00', crowdLevel: 48, passengerCount: 34 },
            { hour: '16:00', crowdLevel: 55, passengerCount: 39 },
            { hour: '17:00', crowdLevel: 38, passengerCount: 27 },
          ],
          stations: [
            { name: 'Hebbal', crowdLevel: 'Low', percentage: 35, waitTime: 5 },
            { name: 'RT Nagar', crowdLevel: 'Medium', percentage: 58, waitTime: 8 },
            { name: 'Malleshwaram', crowdLevel: 'Medium', percentage: 62, waitTime: 9 },
            { name: 'Indiranagar', crowdLevel: 'Low', percentage: 45, waitTime: 6 },
            { name: 'Koramangala', crowdLevel: 'Low', percentage: 32, waitTime: 4 },
          ]
        }
      ];

      if (isLiveDataEnabled()) {
        try {
          const live = await crowdPredictionApi.getCrowdForecast(selectedRoute || mockData[0]?.routeId || 'bmtc-500');
          if (live && live.length) {
            const mapped: CrowdData[] = live.map((item: any, idx: number) => ({
              routeId: item.routeId || selectedRoute || `route-${idx}`,
              routeName: item.routeName || 'Live Route',
              currentCrowdLevel: item.crowdLevel || 'Medium',
              crowdPercentage: item.crowdPercentage ?? 50,
              trend: 'stable',
              peakHours: item.peakHours || [],
              averageWaitTime: item.averageWaitTime || 0,
              temperature: item.temperature || 0,
              airQuality: 'Moderate',
              lastUpdated: new Date().toISOString(),
              predictions: item.predictions || [],
              hourlyData: item.hourlyData || [],
              stations: item.stations || [],
            }));
            setCrowdData(selectedRoute ? mapped.filter(d => d.routeId === selectedRoute) : mapped);
            return;
          }
        } catch (e) {
          console.warn('Live crowd fetch failed, falling back to mock:', e);
        }
      }

      setCrowdData(selectedRoute ? mockData.filter(data => data.routeId === selectedRoute) : mockData);
    } catch (error) {
      console.error('Error fetching crowd data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCrowdLevelColor = (level: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (level) {
      case 'Low':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'Medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'High':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Critical':
        return 'text-red-700 bg-red-100 border-red-200';
    }
  };

  const getCrowdLevelIcon = (level: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (level) {
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'Critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAirQualityColor = (quality: 'Good' | 'Moderate' | 'Poor') => {
    switch (quality) {
      case 'Good':
        return 'text-green-600 bg-green-100';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'Poor':
        return 'text-red-600 bg-red-100';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"
        />
        <p className="text-gray-600">Loading real-time crowd data...</p>
        <p className="text-sm text-gray-500 mt-1">Analyzing passenger patterns</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Smart Crowd Analytics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Wifi className="w-4 h-4 mr-1" />
                Live data • Updated {Math.floor((Date.now() - lastRefresh.getTime()) / 1000)}s ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-6 bg-white dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'live', label: 'Live Data', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'alerts', label: 'Smart Alerts', icon: Bell },
            { id: 'overview', label: 'How It Works', icon: Info }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  viewMode === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {crowdData.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Live Data Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a route or check back later for real-time crowd information
                </p>
              </div>
            ) : (
              crowdData.map((data, index) => (
                <motion.div
                  key={data.routeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Route Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{data.routeName}</h3>
                        <p className="text-blue-100 text-sm mt-1">
                          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCrowdLevelIcon(data.currentCrowdLevel)}
                          <span className="text-2xl font-bold">{data.crowdPercentage}%</span>
                        </div>
                        <div className="flex items-center text-sm text-blue-100">
                          {getTrendIcon(data.trend)}
                          <span className="ml-1 capitalize">{data.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wait Time</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{data.averageWaitTime}m</div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ThermometerSun className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{data.temperature}°C</div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Air Quality</span>
                        </div>
                        <div className={`text-sm font-bold px-2 py-1 rounded-full ${getAirQualityColor(data.airQuality)}`}>
                          {data.airQuality}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Peak Hours</span>
                        </div>
                        <div className="text-xs font-medium text-orange-600">
                          {data.peakHours.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Crowd Level Visualization */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Current Capacity Status
                      </h4>
                      <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-6">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${data.crowdPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-6 rounded-full transition-all duration-500 ${
                              data.crowdPercentage <= 30 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              data.crowdPercentage <= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                              data.crowdPercentage <= 80 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span>Empty</span>
                          <span>Comfortable</span>
                          <span>Crowded</span>
                          <span>Critical</span>
                        </div>
                      </div>
                    </div>

                    {/* Station-wise Crowd Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Station-wise Crowd Levels
                      </h4>
                      <div className="space-y-3">
                        {data.stations.map((station, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                station.percentage <= 40 ? 'bg-green-500' :
                                station.percentage <= 70 ? 'bg-yellow-500' :
                                station.percentage <= 85 ? 'bg-orange-500' : 'bg-red-500'
                              }`} />
                              <span className="font-medium text-gray-900 dark:text-white">{station.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCrowdLevelColor(station.crowdLevel)}`}>
                                {station.crowdLevel}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{station.percentage}%</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{station.waitTime}m wait</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Predictions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Smart Predictions (Next 3 Hours)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {data.predictions.map((prediction, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-gray-600 rounded-lg p-3 text-center shadow-sm"
                          >
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                              {prediction.time}
                            </div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mb-2 ${getCrowdLevelColor(prediction.crowdLevel)}`}>
                              {getCrowdLevelIcon(prediction.crowdLevel)}
                              <span className="ml-1">{prediction.crowdLevel}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {prediction.confidence}% sure
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {prediction.temperature}°C
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Smart Alerts */}
                    {data.currentCrowdLevel === 'High' || data.currentCrowdLevel === 'Critical' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-bold text-red-900 dark:text-red-100">
                              {data.currentCrowdLevel === 'Critical' ? 'Critical Crowd Alert!' : 'High Crowd Alert'}
                            </h5>
                            <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                              {data.currentCrowdLevel === 'Critical' 
                                ? 'Bus is at maximum capacity. Consider alternative routes or wait for next bus.'
                                : 'Very crowded conditions. Limited seating available.'
                              }
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                <Navigation className="w-3 h-3 mr-1" />
                                Try Route 335E instead
                              </span>
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Next bus in {data.averageWaitTime + 3}m
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                          <div>
                            <h5 className="font-bold text-green-900 dark:text-green-100">Great Time to Travel!</h5>
                            <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                              Comfortable crowd levels with good seating availability.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Crowd Analytics Dashboard
            </h3>
            
            {/* Timeframe Selection */}
            <div className="flex space-x-2 mb-6">
              {[
                { id: '1h', label: '1 Hour' },
                { id: '6h', label: '6 Hours' },
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' }
              ].map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>

            {/* Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Hourly Crowd Trends</h4>
                {crowdData[0] && (
                  <div className="space-y-3">
                    {crowdData[0].hourlyData.map((hour, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{hour.hour}</span>
                        <div className="flex items-center space-x-2 flex-1 ml-4">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                hour.crowdLevel <= 40 ? 'bg-green-500' :
                                hour.crowdLevel <= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${hour.crowdLevel}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                            {hour.crowdLevel}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Route Comparison</h4>
                <div className="space-y-4">
                  {crowdData.slice(0, 3).map((route, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {route.routeName.split(' - ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Avg wait: {route.averageWaitTime}m
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCrowdLevelColor(route.currentCrowdLevel)}`}>
                          {route.currentCrowdLevel}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {route.crowdPercentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Bell className="w-6 h-6 mr-2" />
                Smart Crowd Alerts
              </h3>

              {/* Alert Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Notification Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                      <span className="ml-2 text-sm text-blue-800 dark:text-blue-200">High crowd alerts</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                      <span className="ml-2 text-sm text-blue-800 dark:text-blue-200">Alternative route suggestions</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600" />
                      <span className="ml-2 text-sm text-blue-800 dark:text-blue-200">Peak hour reminders</span>
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Smart Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-green-800 dark:text-green-200">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Best time to travel: 2:30 PM - 4:00 PM
                    </div>
                    <div className="flex items-center text-sm text-green-800 dark:text-green-200">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Least crowded route: BMTC 201R
                    </div>
                    <div className="flex items-center text-sm text-green-800 dark:text-green-200">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Optimal boarding station: Hebbal
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-900 dark:text-red-100 text-sm">High Crowd Alert</div>
                      <div className="text-red-700 dark:text-red-200 text-xs">BMTC 500 - Critical capacity at MG Road • 2 min ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100 text-sm">Route Suggestion</div>
                      <div className="text-blue-700 dark:text-blue-200 text-xs">Consider BMTC 335E for faster journey • 5 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Info className="w-6 h-6 mr-2" />
              How Our Smart Crowd Detection Works
            </h3>
            
            <div className="prose prose-blue max-w-none dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300">
                Our advanced AI-powered system provides real-time crowd analysis using multiple data sources 
                and machine learning algorithms to give you the most accurate crowd predictions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🤖 AI Technology</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <li>• Computer vision for passenger counting</li>
                    <li>• Machine learning crowd predictions</li>
                    <li>• Real-time pattern recognition</li>
                    <li>• Privacy-preserving analytics</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">📊 Data Sources</h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <li>• Infrared passenger sensors</li>
                    <li>• Vehicle weight measurements</li>
                    <li>• Historical travel patterns</li>
                    <li>• User-generated feedback</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">🎯 Smart Features</h4>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
                    <li>• Predictive crowd forecasting</li>
                    <li>• Alternative route suggestions</li>
                    <li>• Peak hour optimization</li>
                    <li>• Personalized notifications</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">🔒 Privacy & Security</h4>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
                    <li>• No personal data collection</li>
                    <li>• Anonymized crowd metrics</li>
                    <li>• GDPR compliant processing</li>
                    <li>• Secure data transmission</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Privacy Notice</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                      Our system is designed with privacy-first principles. We analyze crowd patterns without 
                      identifying individuals, ensuring your personal privacy while providing valuable insights 
                      for better public transportation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrowdDetectionInfo;

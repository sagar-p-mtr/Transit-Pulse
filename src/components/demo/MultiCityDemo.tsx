import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Clock, Navigation, Star } from 'lucide-react';
import { useCity } from '../../contexts/CityContext';
import { multiCityBusAPI } from '../../services/multiCityBusAPI';
import { CityBus, CityRoute } from '../../services/cityProvider';
import CitySwitcher from '../ui/CitySwitcher';

const MultiCityDemo: React.FC = () => {
  const { currentCity } = useCity();
  const [buses, setBuses] = useState<CityBus[]>([]);
  const [routes, setRoutes] = useState<CityRoute[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCityData = async () => {
    if (!currentCity) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [cityBuses, cityRoutes, cityStats] = await Promise.all([
        multiCityBusAPI.getBuses(currentCity.id),
        multiCityBusAPI.getRoutes(currentCity.id),
        multiCityBusAPI.getCityStats(currentCity.id)
      ]);
      
      setBuses(cityBuses.slice(0, 5)); // Show first 5 buses
      setRoutes(cityRoutes.slice(0, 8)); // Show first 8 routes
      setStats(cityStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch city data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCityData();
  }, [currentCity]);

  if (!currentCity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading city data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Multi-City Bus Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time bus tracking across Indian cities
            </p>
          </div>
          <CitySwitcher />
        </div>

        {/* City Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl">
              <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentCity.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{currentCity.state}</p>
            </div>
          </div>

          {/* Providers */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentCity.providers.map((provider: any) => (
              <span
                key={provider.id}
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{
                  backgroundColor: `${provider.colorScheme.primary}15`,
                  color: provider.colorScheme.primary
                }}
              >
                {provider.fullName}
              </span>
            ))}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalBuses}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Buses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeBuses}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalRoutes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Routes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.providerCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Providers</div>
              </div>
            </div>
          )}
        </motion.div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-gray-600 dark:text-gray-400">Loading city data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={fetchCityData}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Buses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Buses
              </h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                LIVE
              </span>
            </div>

            <div className="space-y-3">
              {buses.map((bus: any) => (
                <div
                  key={bus.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {bus.vehicleNumber}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Route {bus.routeName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{bus.crowdPercentage}%</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {bus.speed} km/h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Popular Routes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Navigation className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Popular Routes
              </h3>
            </div>

            <div className="space-y-3">
              {routes.map((route: any) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full text-sm font-bold">
                      {route.routeNumber}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {route.source} → {route.destination}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        via {route.via}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{route.frequency}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      ₹{route.fare.minimum}-{route.fare.maximum}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCityData}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                     text-white rounded-lg font-medium transition-all duration-200 transform 
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     flex items-center space-x-2 mx-auto"
          >
            <Star className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MultiCityDemo;
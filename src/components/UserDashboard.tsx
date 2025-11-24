import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Heart, MapPin, Clock, Users, TrendingUp, Settings, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteRoute {
  id: string;
  name: string;
  number: string;
  provider: string;
}

interface DashboardStats {
  totalTrips: number;
  favoriteRoutes: FavoriteRoute[];
  preferredStops: string[];
  travelTime: string;
  carbonSaved: string;
}

interface UserDashboardProps {
  isOpen?: boolean;
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    favoriteRoutes: [],
    preferredStops: [],
    travelTime: '0h 0m',
    carbonSaved: '0kg'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load user dashboard data from localStorage
    const savedStats = localStorage.getItem(`dashboard_${user?.id}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [user]);

  const saveStats = (newStats: DashboardStats) => {
    setStats(newStats);
    if (user?.id) {
      localStorage.setItem(`dashboard_${user.id}`, JSON.stringify(newStats));
    }
  };

  const addFavoriteRoute = (route: FavoriteRoute) => {
    const newStats = {
      ...stats,
      favoriteRoutes: [...stats.favoriteRoutes, route]
    };
    saveStats(newStats);
  };

  const removeFavoriteRoute = (routeId: string) => {
    const newStats = {
      ...stats,
      favoriteRoutes: stats.favoriteRoutes.filter(route => route.id !== routeId)
    };
    saveStats(newStats);
  };

  const addPreferredStop = (stop: string) => {
    if (!stats.preferredStops.includes(stop)) {
      const newStats = {
        ...stats,
        preferredStops: [...stats.preferredStops, stop]
      };
      saveStats(newStats);
    }
  };

  const removePreferredStop = (stop: string) => {
    const newStats = {
      ...stats,
      preferredStops: stats.preferredStops.filter(s => s !== stop)
    };
    saveStats(newStats);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.title')}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              >
                {isEditing ? t('common.done') : t('common.edit')}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.totalTrips')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalTrips}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.travelTime')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.travelTime}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.carbonSaved')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.carbonSaved}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dashboard.favorites')}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.favoriteRoutes.length}
                </p>
              </div>
            </div>

            {/* Favorite Routes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.favoriteRoutes')}
                </h3>
                {isEditing && (
                  <button
                    onClick={() => {
                      // Add a sample route for demo
                      const newRoute: FavoriteRoute = {
                        id: Date.now().toString(),
                        name: 'MG Road - Jayanagar',
                        number: '500',
                        provider: 'BMTC'
                      };
                      addFavoriteRoute(newRoute);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <Plus size={16} />
                    <span className="text-sm">{t('common.add')}</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {stats.favoriteRoutes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t('dashboard.noFavorites')}
                  </p>
                ) : (
                  stats.favoriteRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {route.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Route {route.number} • {route.provider}
                          </p>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeFavoriteRoute(route.id)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          aria-label={t('common.remove')}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Preferred Stops */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.preferredStops')}
                </h3>
                {isEditing && (
                  <button
                    onClick={() => {
                      const stop = prompt(t('dashboard.enterStopName'));
                      if (stop && stop.trim()) {
                        addPreferredStop(stop.trim());
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    <Plus size={16} />
                    <span className="text-sm">{t('common.add')}</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.preferredStops.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 w-full">
                    {t('dashboard.noPreferredStops')}
                  </p>
                ) : (
                  stats.preferredStops.map((stop) => (
                    <div
                      key={stop}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full"
                    >
                      <MapPin size={14} />
                      <span className="text-sm">{stop}</span>
                      {isEditing && (
                        <button
                          onClick={() => removePreferredStop(stop)}
                          className="ml-1 p-0.5 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                          aria-label={t('common.remove')}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserDashboard;

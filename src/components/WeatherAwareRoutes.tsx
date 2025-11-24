/**
 * Weather-Aware Routes Component
 * Recommends routes based on weather conditions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import weatherApi, { WeatherData, WeatherRoute, FloodReport, WeatherForecast } from '../services/weatherApi';

interface WeatherAwareRoutesProps {
  city: string;
  onClose?: () => void;
}

const WeatherAwareRoutes: React.FC<WeatherAwareRoutesProps> = ({ city, onClose }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'routes' | 'alerts' | 'forecast'>('current');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [routes, setRoutes] = useState<WeatherRoute[]>([]);
  const [floodReports, setFloodReports] = useState<FloodReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, [city]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const weatherData = await weatherApi.getCurrentWeather(city);
      setWeather(weatherData);
      
      const forecastData = await weatherApi.getWeatherForecast(city);
      setForecast(forecastData);
      
      const reports = await weatherApi.getFloodReports(city);
      setFloodReports(reports);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
    };
    return icons[condition] || '🌤️';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 35) return 'text-red-600 dark:text-red-400';
    if (temp > 28) return 'text-orange-600 dark:text-orange-400';
    if (temp > 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌦️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Weather-Aware Routes</h2>
                <p className="text-sm opacity-90">Smart routing for {city}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {(['current', 'forecast', 'routes', 'alerts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Current Weather Tab */}
              {activeTab === 'current' && weather && (
                <motion.div
                  key="current"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-4xl font-bold">{city}</h3>
                        <p className="text-lg opacity-90 capitalize">{weather.description}</p>
                      </div>
                      <div className="text-8xl">{getWeatherIcon(weather.condition)}</div>
                    </div>

                    <div className="flex items-baseline space-x-2 mb-6">
                      <span className="text-6xl font-bold">{Math.round(weather.temperature)}°</span>
                      <span className="text-3xl opacity-75">C</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-sm opacity-75">Feels Like</p>
                        <p className="text-xl font-semibold">{Math.round(weather.feelsLike)}°C</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-sm opacity-75">Humidity</p>
                        <p className="text-xl font-semibold">{weather.humidity}%</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-sm opacity-75">Wind Speed</p>
                        <p className="text-xl font-semibold">{weather.windSpeed} km/h</p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-sm opacity-75">Visibility</p>
                        <p className="text-xl font-semibold">{(weather.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>

                    {weather.rain1h > 0 && (
                      <div className="mt-4 bg-yellow-400/20 rounded-lg p-4">
                        <p className="text-sm font-semibold">⚠️ Rainfall Alert</p>
                        <p className="text-sm">Rain in last hour: {weather.rain1h}mm</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Forecast Tab */}
              {activeTab === 'forecast' && (
                <motion.div
                  key="forecast"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">24-Hour Forecast</h3>
                  {forecast.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{getWeatherIcon(item.condition)}</span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {Math.round(item.temperature)}°C
                        </p>
                        {item.rain > 0 && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">☔ {item.rain}mm</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <motion.div
                  key="alerts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Active Flood Alerts</h3>
                  {floodReports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <span className="text-6xl mb-4 block">✅</span>
                      <p className="text-lg">No active flood reports</p>
                      <p className="text-sm mt-2">All roads are clear!</p>
                    </div>
                  ) : (
                    floodReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-red-500"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                              {report.stopName || 'Unknown Location'}
                            </h4>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getSeverityColor(report.severity)}`}>
                              {report.severity.toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => weatherApi.upvoteFloodReport(report.id)}
                            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>👍</span>
                            <span>{report.upvotes}</span>
                          </button>
                        </div>
                        {report.description && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Reported {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Routes Tab */}
              {activeTab === 'routes' && weather && (
                <motion.div
                  key="routes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Weather Impact</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {weather.condition === 'Rain' && "It's raining! Routes with covered stops are prioritized."}
                      {weather.condition === 'Clear' && weather.temperature > 35 && "It's very hot! AC buses and covered stops recommended."}
                      {weather.condition === 'Mist' && "Low visibility. Well-lit routes are safer."}
                      {weather.condition === 'Clear' && weather.temperature <= 35 && "Perfect weather for any route!"}
                    </p>
                  </div>

                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Enter your journey details in the main search to see weather-aware route recommendations
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WeatherAwareRoutes;


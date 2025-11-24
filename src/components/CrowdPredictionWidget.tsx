/**
 * Crowd Prediction Engine Widget
 * Shows ML-powered crowd predictions for buses
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import crowdPredictionApi, { CrowdPrediction, CrowdForecast, CrowdTrend } from '../services/crowdPredictionApi';

interface CrowdPredictionWidgetProps {
  routeId: string;
  routeName?: string;
  onClose?: () => void;
}

const CrowdPredictionWidget: React.FC<CrowdPredictionWidgetProps> = ({ routeId, routeName, onClose }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'trends'>('current');
  const [currentPrediction, setCurrentPrediction] = useState<CrowdPrediction | null>(null);
  const [forecast, setForecast] = useState<CrowdForecast[]>([]);
  const [trends, setTrends] = useState<CrowdTrend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPredictionData();
  }, [routeId, activeTab]);

  const loadPredictionData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'current') {
        const prediction = await crowdPredictionApi.predictCrowd(routeId);
        setCurrentPrediction(prediction);
      } else if (activeTab === 'forecast') {
        const forecastData = await crowdPredictionApi.getCrowdForecast(routeId);
        setForecast(forecastData);
      } else if (activeTab === 'trends') {
        const trendsData = await crowdPredictionApi.getCrowdTrends(routeId, 7);
        setTrends(trendsData);
      }
    } catch (error) {
      console.error('Error loading prediction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCrowdIcon = (level: string) => {
    const icons: Record<string, string> = {
      Low: '🟢',
      Medium: '🟡',
      High: '🔴',
    };
    return icons[level] || '⚪';
  };

  const getCrowdColor = (level: string) => {
    const colors: Record<string, string> = {
      Low: 'from-green-500 to-emerald-500',
      Medium: 'from-yellow-500 to-orange-500',
      High: 'from-red-500 to-pink-500',
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  const getCrowdTextColor = (level: string) => {
    const colors: Record<string, string> = {
      Low: 'text-green-600 dark:text-green-400',
      Medium: 'text-yellow-600 dark:text-yellow-400',
      High: 'text-red-600 dark:text-red-400',
    };
    return colors[level] || 'text-gray-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getCrowdPercentageColor = (percentage: number) => {
    if (percentage < 40) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔮</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Crowd Prediction</h2>
                <p className="text-sm opacity-90">{routeName || `Route ${routeId}`}</p>
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
          <div className="flex space-x-2 mt-4">
            {(['current', 'forecast', 'trends'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white text-indigo-600 font-semibold'
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Current Prediction Tab */}
              {activeTab === 'current' && currentPrediction && (
                <motion.div
                  key="current"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Main Prediction Card */}
                  <div className={`bg-gradient-to-br ${getCrowdColor(currentPrediction.crowdLevel)} rounded-2xl p-8 text-white mb-6`}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl opacity-90">Current Crowd Level</h3>
                        <p className="text-5xl font-bold mt-2">{currentPrediction.crowdLevel}</p>
                      </div>
                      <div className="text-8xl">{getCrowdIcon(currentPrediction.crowdLevel)}</div>
                    </div>

                    {/* Percentage Bar */}
                    <div className="bg-white/20 rounded-full h-8 overflow-hidden mb-4">
                      <div
                        className="h-full bg-white/40 flex items-center justify-center font-bold text-sm transition-all duration-500"
                        style={{ width: `${currentPrediction.predictedCrowdPercentage}%` }}
                      >
                        {currentPrediction.predictedCrowdPercentage}% Full
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Empty</span>
                      <span>Packed</span>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                      <span className="mr-2">🤖</span>
                      AI Insights
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                        <p className={`text-2xl font-bold ${getConfidenceColor(currentPrediction.confidence)}`}>
                          {(currentPrediction.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currentPrediction.dataPoints}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Rush Hour</span>
                        <span className={currentPrediction.factors.isRushHour ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-green-600 dark:text-green-400'}>
                          {currentPrediction.factors.isRushHour ? '⚠️ Yes' : '✅ No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Events Nearby</span>
                        <span className={currentPrediction.factors.hasEvents ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                          {currentPrediction.factors.hasEvents ? '🎉 Active' : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Weather Impact</span>
                        <span className={currentPrediction.factors.weatherImpact ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                          {currentPrediction.factors.weatherImpact ? '🌧️ Rainy' : '☀️ Clear'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">💡 Recommendations</h4>
                    {currentPrediction.crowdLevel === 'High' && (
                      <p className="text-gray-700 dark:text-gray-300">
                        Bus is likely to be crowded. Consider waiting for the next bus or checking alternate routes.
                      </p>
                    )}
                    {currentPrediction.crowdLevel === 'Medium' && (
                      <p className="text-gray-700 dark:text-gray-300">
                        Moderate crowd expected. You should find a seat if you board now.
                      </p>
                    )}
                    {currentPrediction.crowdLevel === 'Low' && (
                      <p className="text-gray-700 dark:text-gray-300">
                        Great time to travel! Bus is expected to be relatively empty.
                      </p>
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
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Next 3 Hours</h3>
                  {forecast.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getCrowdIcon(item.crowdLevel)}</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                            <p className={`text-sm font-semibold ${getCrowdTextColor(item.crowdLevel)}`}>
                              {item.crowdLevel} Crowd
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {item.predictedCrowdPercentage}%
                          </p>
                          <p className={`text-xs ${getConfidenceColor(item.confidence)}`}>
                            {(item.confidence * 100).toFixed(0)}% sure
                          </p>
                        </div>
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${getCrowdPercentageColor(item.predictedCrowdPercentage)} transition-all`}
                          style={{ width: `${item.predictedCrowdPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">7-Day Trends</h3>
                  
                  {trends.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <span className="text-6xl mb-4 block">📊</span>
                      <p className="text-lg">Not enough historical data</p>
                      <p className="text-sm mt-2">Trends will appear as we collect more data</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Group by date */}
                      {Array.from(new Set(trends.map(t => t.date))).slice(0, 7).map((date) => {
                        const dayTrends = trends.filter(t => t.date === date);
                        const avgCrowd = dayTrends.reduce((sum, t) => sum + Number(t.avgCrowd), 0) / dayTrends.length;
                        
                        return (
                          <div key={date} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </h4>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Avg: {avgCrowd.toFixed(0)}%
                              </span>
                            </div>
                            
                            {/* Hour-by-hour mini chart */}
                            <div className="flex items-end space-x-1 h-24">
                              {dayTrends.slice(0, 24).map((trend, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 group relative"
                                  title={`${trend.hour}:00 - ${trend.avgCrowd}%`}
                                >
                                  <div
                                    className={`w-full rounded-t ${getCrowdPercentageColor(Number(trend.avgCrowd))} transition-all`}
                                    style={{ height: `${Number(trend.avgCrowd)}%` }}
                                  ></div>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                    {trend.hour}:00<br/>{Number(trend.avgCrowd).toFixed(0)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <span>12 AM</span>
                              <span>12 PM</span>
                              <span>11 PM</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CrowdPredictionWidget;


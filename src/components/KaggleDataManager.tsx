import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { kaggleDataApi, DataSummary, KaggleDataset } from '../services/kaggleDataApi';

interface KaggleDataManagerProps {
  onClose: () => void;
}

const KaggleDataManager: React.FC<KaggleDataManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'populate' | 'summary'>('search');
  const [searchQuery, setSearchQuery] = useState('Indian public transport bus routes');
  const [datasets, setDatasets] = useState<KaggleDataset[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDataSummary();
  }, []);

  const loadDataSummary = async () => {
    try {
      const summary = await kaggleDataApi.getDataSummary();
      setDataSummary(summary);
    } catch (error) {
      console.error('Error loading data summary:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await kaggleDataApi.searchDatasets(searchQuery);
      setDatasets(results);
      setMessage(`Found ${results.length} relevant datasets`);
    } catch (error) {
      setMessage('Error searching datasets');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulate = async () => {
    setLoading(true);
    try {
      const result = await kaggleDataApi.populateDatabase();
      setMessage(result.message);
      await loadDataSummary(); // Refresh summary
    } catch (error) {
      setMessage('Error populating database');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Kaggle Data Manager
              </h2>
              <p className="text-blue-100 mt-1">Import real-world data for Bus Buddy AI</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['search', 'populate', 'summary'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
              }`}
            >
              {tab === 'search' ? '🔍 Search Datasets' : 
               tab === 'populate' ? '📥 Populate Data' : '📊 Data Summary'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for datasets (e.g., 'Indian public transport')"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {datasets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Found {datasets.length} datasets:
                  </h3>
                  {datasets.map((dataset, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{dataset.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dataset.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>📦 {formatFileSize(dataset.size)}</span>
                        <span>⬇️ {dataset.downloadCount} downloads</span>
                        <span>🕒 {new Date(dataset.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'populate' && (
            <motion.div
              key="populate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🚀 Populate Database with Real Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This will populate your database with realistic bus route data, commute patterns, and AI suggestions.
                  Perfect for testing the Bus Buddy AI features!
                </p>
                <button
                  onClick={handlePopulate}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Populating...' : '📥 Populate Database'}
                </button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  💡 Pro Tip
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  If you have a Kaggle API key, set it in your backend .env file as KAGGLE_API_KEY to download real datasets.
                  Otherwise, we'll use comprehensive sample data that mimics real-world patterns.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📊 Current Database Status
              </h3>
              
              {dataSummary ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dataSummary.routes}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Bus Routes</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {dataSummary.stops}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Bus Stops</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {dataSummary.patterns}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Commute Patterns</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {dataSummary.suggestions}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">AI Suggestions</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">Loading data summary...</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🎯 What This Data Enables
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Realistic commute pattern recognition</li>
                  <li>• AI-powered route optimization suggestions</li>
                  <li>• Weather-aware commute planning</li>
                  <li>• Crowd prediction and alternative routes</li>
                  <li>• Personalized travel recommendations</li>
                </ul>
              </div>
            </motion.div>
          )}

          {message && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">{message}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KaggleDataManager;

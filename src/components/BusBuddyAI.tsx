/**
 * Bus Buddy AI Commute Planner Component
 * Smart AI that learns your commute patterns and provides suggestions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import busBuddyApi, { CommuteSuggestion, CommutePattern, UserPreferences } from '../services/busBuddyApi';

interface BusBuddyAIProps {
  userId: string;
  onClose?: () => void;
}

const BusBuddyAI: React.FC<BusBuddyAIProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'patterns' | 'settings' | 'ai-chat'>('suggestions');
  const [suggestions, setSuggestions] = useState<CommuteSuggestion[]>([]);
  const [patterns, setPatterns] = useState<CommutePattern[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferAC: false,
    preferLessCrowded: true,
    preferFasterRoute: true,
    maxWalkingDistance: 500,
    notificationLeadTime: 15,
    autoSuggestEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', message: string}>>([]);

  useEffect(() => {
    loadData();
  }, [userId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'suggestions') {
        const data = await busBuddyApi.generateSuggestions(userId);
        setSuggestions(data);
      } else if (activeTab === 'patterns') {
        const data = await busBuddyApi.getUserPatterns(userId);
        setPatterns(data);
      } else if (activeTab === 'ai-chat') {
        // Load AI suggestion on first open
        if (!aiSuggestion) {
          await loadAISuggestion();
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAISuggestion = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/bus-buddy/ai-suggestion/${userId}`);
      const result = await response.json();
      
      if (result.success && result.data.suggestion) {
        setAiSuggestion(result.data.suggestion);
      }
    } catch (error) {
      console.error('Error loading AI suggestion:', error);
      setAiSuggestion('AI suggestion temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/bus-buddy/ai-chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const result = await response.json();
      
      if (result.success && result.data.aiSuggestion) {
        setChatHistory(prev => [...prev, { role: 'ai', message: result.data.aiSuggestion }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', message: 'Sorry, I couldn\'t process that. Please try again.' }]);
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      setChatHistory(prev => [...prev, { role: 'ai', message: 'Error connecting to AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await busBuddyApi.updatePreferences(userId, preferences);
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'leave_now': return '🚌';
      case 'delay_alert': return '⚠️';
      case 'alternate_route': return '🔄';
      case 'weather_alert': return '🌧️';
      case 'early_departure': return '⏰';
      default: return '💡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bus Buddy AI</h2>
                <p className="text-sm opacity-90">Your Smart Commute Assistant</p>
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
            {(['suggestions', 'ai-chat', 'patterns', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-purple-600 font-semibold'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tab === 'ai-chat' ? '🤖 AI Chat' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {suggestions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <span className="text-6xl mb-4 block">🎯</span>
                      <p className="text-lg">No suggestions yet</p>
                      <p className="text-sm mt-2">Travel a few times so I can learn your patterns!</p>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border-l-4 border-purple-600"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-3xl">{getSuggestionIcon(suggestion.type)}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-1">{suggestion.message}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm">
                              <span className={`font-semibold ${getConfidenceColor(suggestion.confidenceScore)}`}>
                                {(suggestion.confidenceScore * 100).toFixed(0)}% Confident
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {new Date(suggestion.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Patterns Tab */}
              {activeTab === 'patterns' && (
                <motion.div
                  key="patterns"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {patterns.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <span className="text-6xl mb-4 block">📊</span>
                      <p className="text-lg">No patterns detected yet</p>
                      <p className="text-sm mt-2">Use the app regularly to build your commute profile!</p>
                    </div>
                  ) : (
                    patterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {pattern.routeNumber} - {pattern.routeName}
                          </h3>
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                            {pattern.frequency} trips
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Typical Time</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {pattern.typicalDepartureTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Avg Duration</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {pattern.averageDuration} mins
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Usual Days</p>
                          <div className="flex flex-wrap gap-2">
                            {(pattern.typicalDays || []).map((day) => (
                              <span
                                key={day}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* AI Chat Tab */}
              {activeTab === 'ai-chat' && (
                <motion.div
                  key="ai-chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* AI Suggestion Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <span className="text-2xl mr-2">🤖</span>
                      AI-Powered Suggestion
                    </h3>
                    {aiSuggestion ? (
                      <div className="bg-white/10 rounded-lg p-4 whitespace-pre-wrap">
                        {aiSuggestion}
                      </div>
                    ) : (
                      <p className="text-white/80">Loading intelligent suggestion...</p>
                    )}
                    <button
                      onClick={loadAISuggestion}
                      className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                      🔄 Refresh Suggestion
                    </button>
                  </div>

                  {/* Chat Interface */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">💬 Chat with AI</h4>
                    
                    {/* Chat History */}
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {chatHistory.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                          Ask me anything about your commute!<br/>
                          Try: "Should I leave now?" or "What's the best route today?"
                        </p>
                      ) : (
                        chatHistory.map((chat, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              chat.role === 'user'
                                ? 'bg-purple-100 dark:bg-purple-900/30 ml-8'
                                : 'bg-blue-100 dark:bg-blue-900/30 mr-8'
                            }`}
                          >
                            <p className="text-sm font-semibold mb-1 text-gray-900 dark:text-white">
                              {chat.role === 'user' ? 'You' : '🤖 AI'}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{chat.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                        placeholder="Ask about your commute..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={loading}
                      />
                      <button
                        onClick={handleChatSubmit}
                        disabled={loading || !chatInput.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Commute Preferences</h3>

                    <div className="space-y-4">
                      {/* Toggles */}
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Prefer AC Buses</span>
                        <input
                          type="checkbox"
                          checked={preferences.preferAC}
                          onChange={(e) => setPreferences({ ...preferences, preferAC: e.target.checked })}
                          className="w-5 h-5 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Prefer Less Crowded</span>
                        <input
                          type="checkbox"
                          checked={preferences.preferLessCrowded}
                          onChange={(e) => setPreferences({ ...preferences, preferLessCrowded: e.target.checked })}
                          className="w-5 h-5 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Prefer Faster Route</span>
                        <input
                          type="checkbox"
                          checked={preferences.preferFasterRoute}
                          onChange={(e) => setPreferences({ ...preferences, preferFasterRoute: e.target.checked })}
                          className="w-5 h-5 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Auto Suggestions</span>
                        <input
                          type="checkbox"
                          checked={preferences.autoSuggestEnabled}
                          onChange={(e) => setPreferences({ ...preferences, autoSuggestEnabled: e.target.checked })}
                          className="w-5 h-5 rounded"
                        />
                      </label>

                      {/* Sliders */}
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                          Max Walking Distance: {preferences.maxWalkingDistance}m
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="100"
                          value={preferences.maxWalkingDistance}
                          onChange={(e) => setPreferences({ ...preferences, maxWalkingDistance: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                          Notification Lead Time: {preferences.notificationLeadTime} mins
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="5"
                          value={preferences.notificationLeadTime}
                          onChange={(e) => setPreferences({ ...preferences, notificationLeadTime: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleUpdatePreferences}
                      className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BusBuddyAI;


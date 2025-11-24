import React, { useState, useEffect } from 'react';
import { X, User, Bell, MapPin, Palette, Globe, Save, Star, Shield } from 'lucide-react';
import { pwaService } from '../services/pwa';

interface UserPreferencesProps {
  onClose: () => void;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'favorites'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Demo user data - no authentication needed
  const demoUser = {
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+91 9876543210'
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: demoUser.name,
    email: demoUser.email,
    phone: demoUser.phone,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    busArrival: true,
    routeUpdates: true,
    crowdAlerts: true,
    serviceDisruptions: true,
    promotions: false,
    push: true,
    email: true,
    sms: false,
  });

  // User preferences state
  const [preferences, setPreferences] = useState({
    defaultCity: 'Bangalore',
    preferredProvider: 'BMTC',
    crowdLevelAlert: 'Medium',
    notificationRadius: 5,
    language: 'en',
    theme: 'auto',
  });

  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>(['Route 500', 'Route 335E', 'Route 201R']);

  const cities = ['Bangalore', 'Hyderabad', 'Chennai', 'Mumbai', 'Delhi', 'Pune', 'Kochi'];
  const providers = ['BMTC', 'KSRTC', 'APSRTC', 'TNSTC', 'BEST', 'DTC'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update profile API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating profile');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Request notification permission if push notifications are enabled
      if (notificationSettings.push) {
        await pwaService.requestNotificationPermission();
      }
      
      // Update notification settings API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Notification settings updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating notification settings');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await authService.updateUserPreferences(preferences);
      setSaveMessage('Preferences updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating preferences');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (routeId: string) => {
    try {
      await authService.addFavoriteRoute(routeId);
      setFavoriteRoutes(prev => [...prev, routeId]);
    } catch (error) {
      console.error('Error adding favorite route:', error);
    }
  };

  const handleRemoveFavorite = async (routeId: string) => {
    try {
      await authService.removeFavoriteRoute(routeId);
      setFavoriteRoutes(prev => prev.filter(id => id !== routeId));
    } catch (error) {
      console.error('Error removing favorite route:', error);
    }
  };

  const clearAppData = async () => {
    if (confirm('This will clear all app data including offline cache. Continue?')) {
      await pwaService.clearCache();
      localStorage.clear();
      window.location.reload();
    }
  };

  const getCacheSize = async () => {
    const size = await pwaService.getCacheSize();
    return (size / 1024 / 1024).toFixed(2) + ' MB';
  };

  const [cacheSize, setCacheSize] = useState<string>('Calculating...');

  useEffect(() => {
    getCacheSize().then(setCacheSize);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">User Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'preferences'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'favorites'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star className="h-4 w-4" />
            <span>Favorites</span>
          </button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`px-6 py-3 ${
            saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
                <div className="space-y-3">
                  {Object.entries(notificationSettings).slice(0, 5).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Methods</h3>
                <div className="space-y-3">
                  {Object.entries(notificationSettings).slice(5).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700 capitalize">
                        {key.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Notifications'}</span>
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default City</label>
                  <select
                    value={preferences.defaultCity}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultCity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Provider</label>
                  <select
                    value={preferences.preferredProvider}
                    onChange={(e) => setPreferences(prev => ({ ...prev, preferredProvider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {providers.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crowd Level Alert</label>
                  <select
                    value={preferences.crowdLevelAlert}
                    onChange={(e) => setPreferences(prev => ({ ...prev, crowdLevelAlert: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Radius: {preferences.notificationRadius} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={preferences.notificationRadius}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notificationRadius: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex space-x-4">
                  {['light', 'dark', 'auto'].map(theme => (
                    <label key={theme} className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={preferences.theme === theme}
                        onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as any }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Favorite Routes</h3>
                {favoriteRoutes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No favorite routes yet</p>
                ) : (
                  <div className="space-y-2">
                    {favoriteRoutes.map(routeId => (
                      <div key={routeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{routeId}</span>
                        <button
                          onClick={() => handleRemoveFavorite(routeId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">App Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Cache Size</span>
                    <span className="text-sm font-medium">{cacheSize}</span>
                  </div>
                  <button
                    onClick={clearAppData}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Clear App Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;

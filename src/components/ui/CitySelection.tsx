import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Search, X, Check, Globe } from 'lucide-react';
import { INDIAN_CITIES, CityConfig, cityProviderService } from '../../services/cityProvider';

interface CitySelectionProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity?: string;
  onCitySelect: (cityId: string) => void;
}

const CitySelection: React.FC<CitySelectionProps> = ({
  isOpen,
  onClose,
  currentCity,
  onCitySelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<CityConfig[]>([]);
  const [selectedCity, setSelectedCity] = useState(currentCity || 'bangalore');
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const cities = Object.values(INDIAN_CITIES);
    
    if (searchQuery.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter((city: CityConfig) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.providers.some((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery]);

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    onCitySelect(cityId);
    onClose();
  };

  const detectCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const detectedCity = cityProviderService.detectCity(latitude, longitude);
            
            if (detectedCity) {
              setSelectedCity(detectedCity.id);
              onCitySelect(detectedCity.id);
              onClose();
            } else {
              // Fallback to closest major city or show message
              alert('Unable to detect city. Please select manually.');
            }
            setIsDetecting(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to access location. Please select city manually.');
            setIsDetecting(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        setIsDetecting(false);
      }
    } catch (error) {
      console.error('Location detection error:', error);
      setIsDetecting(false);
    }
  };

  const groupedCities = filteredCities.reduce((acc, city) => {
    const state = city.state;
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(city);
    return acc;
  }, {} as Record<string, CityConfig[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Select Your City
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a city to track buses
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Search and Location Detection */}
            <div className="p-6 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cities, states, or transport providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Auto-detect Location Button */}
              <button
                onClick={detectCurrentLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-center space-x-2 p-3 
                         bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                         text-white rounded-lg transition-all duration-200 transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Navigation className={`w-5 h-5 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>
                  {isDetecting ? 'Detecting Location...' : 'Auto-detect My Location'}
                </span>
              </button>
            </div>

            {/* Cities List */}
            <div className="px-6 pb-6 max-h-96 overflow-y-auto">
              {Object.entries(groupedCities).map(([state, cities]) => (
                <div key={state} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {state}
                  </h3>
                  <div className="grid gap-3">
                    {cities.map((city: CityConfig) => (
                      <motion.div
                        key={city.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCitySelect(city.id)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                  ${selectedCity === city.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {city.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {city.state}
                              </p>
                            </div>
                          </div>
                          {selectedCity === city.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1 bg-blue-500 rounded-full"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>

                        {/* Transport Providers */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {city.providers.map((provider: any) => (
                            <span
                              key={provider.id}
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${provider.colorScheme.primary}15`,
                                color: provider.colorScheme.primary
                              }}
                            >
                              {provider.name}
                            </span>
                          ))}
                        </div>

                        {/* Provider Count */}
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {city.providers.length} transport provider{city.providers.length !== 1 ? 's' : ''}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredCities.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No cities found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                More cities coming soon! Currently supporting {Object.keys(INDIAN_CITIES).length} major Indian cities.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CitySelection;
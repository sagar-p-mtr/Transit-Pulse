import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown, Navigation } from 'lucide-react';
import { useCity } from '../../contexts/CityContext';
import CitySelection from './CitySelection';

const CitySwitcher: React.FC = () => {
  const [isCitySelectionOpen, setIsCitySelectionOpen] = useState(false);
  const { currentCity, setSelectedCityId, isLoading, autoDetectCity } = useCity();

  const handleAutoDetect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await autoDetectCity();
    if (!success) {
      // If auto-detect fails, still show city selection
      setIsCitySelectionOpen(true);
    }
  };

  if (!currentCity) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCitySelectionOpen(true)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg 
                   bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700
                   hover:shadow-xl transition-all duration-200 group"
        >
          <div className="p-1.5 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-md">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentCity.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentCity.providers.length} provider{currentCity.providers.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </motion.button>

        {/* Quick Auto-detect Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAutoDetect}
          disabled={isLoading}
          className="absolute -top-1 -right-1 p-1.5 bg-blue-500 hover:bg-blue-600 
                   text-white rounded-full shadow-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
          title="Auto-detect location"
        >
          <Navigation className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <CitySelection
        isOpen={isCitySelectionOpen}
        onClose={() => setIsCitySelectionOpen(false)}
        currentCity={currentCity.id}
        onCitySelect={setSelectedCityId}
      />
    </>
  );
};

export default CitySwitcher;
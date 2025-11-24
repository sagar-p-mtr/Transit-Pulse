import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilterValues) => void;
  initialFilters?: SearchFilterValues;
  resultCount?: number;
}

export interface SearchFilterValues {
  types: ('route' | 'stop' | 'bus')[];
  providers: string[];
  crowdLevels: ('Low' | 'Medium' | 'High')[];
  timeRange?: 'morning' | 'afternoon' | 'evening' | 'night' | 'all';
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onFiltersChange,
  initialFilters,
  resultCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilterValues>(initialFilters || {
    types: ['route', 'stop', 'bus'],
    providers: ['BMTC', 'KSRTC', 'APSRTC'],
    crowdLevels: ['Low', 'Medium', 'High'],
    timeRange: 'all'
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleTypeToggle = (type: 'route' | 'stop' | 'bus') => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    
    if (newTypes.length === 0) return; // At least one type must be selected
    
    const newFilters = { ...filters, types: newTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    updateActiveFilterCount(newFilters);
  };

  const handleProviderToggle = (provider: string) => {
    const newProviders = filters.providers.includes(provider)
      ? filters.providers.filter(p => p !== provider)
      : [...filters.providers, provider];
    
    if (newProviders.length === 0) return; // At least one provider must be selected
    
    const newFilters = { ...filters, providers: newProviders };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    updateActiveFilterCount(newFilters);
  };

  const handleCrowdLevelToggle = (level: 'Low' | 'Medium' | 'High') => {
    const newLevels = filters.crowdLevels.includes(level)
      ? filters.crowdLevels.filter(l => l !== level)
      : [...filters.crowdLevels, level];
    
    if (newLevels.length === 0) return; // At least one level must be selected
    
    const newFilters = { ...filters, crowdLevels: newLevels };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    updateActiveFilterCount(newFilters);
  };

  const handleTimeRangeChange = (timeRange: 'morning' | 'afternoon' | 'evening' | 'night' | 'all') => {
    const newFilters = { ...filters, timeRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    updateActiveFilterCount(newFilters);
  };

  const updateActiveFilterCount = (currentFilters: SearchFilterValues) => {
    let count = 0;
    if (currentFilters.types.length < 3) count++;
    if (currentFilters.providers.length < 3) count++;
    if (currentFilters.crowdLevels.length < 3) count++;
    if (currentFilters.timeRange && currentFilters.timeRange !== 'all') count++;
    setActiveFilterCount(count);
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilterValues = {
      types: ['route', 'stop', 'bus'],
      providers: ['BMTC', 'KSRTC', 'APSRTC'],
      crowdLevels: ['Low', 'Medium', 'High'],
      timeRange: 'all'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setActiveFilterCount(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount} active
            </span>
          )}
          {resultCount !== undefined && (
            <span className="text-sm text-gray-500">
              {resultCount} results
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Search Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['route', 'stop', 'bus'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.types.includes(type)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bus Provider
                </label>
                <div className="flex flex-wrap gap-2">
                  {['BMTC', 'KSRTC', 'APSRTC'].map(provider => (
                    <button
                      key={provider}
                      onClick={() => handleProviderToggle(provider)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.providers.includes(provider)
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crowd Level Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Crowd Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Low', 'Medium', 'High'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => handleCrowdLevelToggle(level)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                        filters.crowdLevels.includes(level)
                          ? level === 'Low'
                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                            : level === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                            : 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          level === 'Low'
                            ? 'bg-green-500'
                            : level === 'Medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span>{level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Time of Day
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Day', icon: '🌍' },
                    { value: 'morning', label: 'Morning', icon: '🌅' },
                    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
                    { value: 'evening', label: 'Evening', icon: '🌆' },
                    { value: 'night', label: 'Night', icon: '🌙' }
                  ].map(time => (
                    <button
                      key={time.value}
                      onClick={() => handleTimeRangeChange(time.value as any)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                        filters.timeRange === time.value
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <span>{time.icon}</span>
                      <span>{time.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              {activeFilterCount > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reset all filters</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilters;

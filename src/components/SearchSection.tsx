import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, TrendingUp } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const popularSearches = [
    'BMTC 500 - Whitefield to KBS',
    'KSRTC Bangalore to Mysore',
    'Electronic City Bus Routes',
    'BMTC 201 - Shivajinagar',
    'Hebbal to Silk Board',
    'Airport Bus Services'
  ];

  const quickRoutes = [
    { id: 'bmtc-500', name: '500 - KBS to Whitefield', provider: 'BMTC', crowdLevel: 'Medium' },
    { id: 'bmtc-201', name: '201 - Shivajinagar to Electronic City', provider: 'BMTC', crowdLevel: 'High' },
    { id: 'ksrtc-501', name: '501 - Bangalore to Mysore', provider: 'KSRTC', crowdLevel: 'Low' },
    { id: 'bmtc-335', name: '335 - Jayanagar to Hebbal', provider: 'BMTC', crowdLevel: 'Medium' }
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simulate API call for suggestions
      const filteredSuggestions = popularSearches.filter(search =>
        search.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleQuickRouteClick = (routeId: string) => {
    onSearch(routeId);
  };

  return (
    <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Find Your Bus in Real-time
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Search for bus routes, stops, or destinations across India
          </p>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="pl-6 pr-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="flex-1 py-4 pr-4 text-lg placeholder-gray-500 focus:outline-none"
                placeholder="Search for bus routes, stops, or destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
              />
              <button
                onClick={() => handleSearch()}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 transition-colors"
              >
                Search
              </button>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg border-t border-gray-200 z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-6 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Popular Searches */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Popular Searches
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSearches.slice(0, 4).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors border border-white/30"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Route Access */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-center">
              <Clock className="h-5 w-5 mr-2" />
              Quick Route Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleQuickRouteClick(route.id)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-left hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm mb-1">
                        {route.name}
                      </div>
                      <div className="text-xs text-indigo-200">
                        {route.provider}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        route.crowdLevel === 'Low' ? 'bg-green-400' :
                        route.crowdLevel === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-xs text-indigo-200">{route.crowdLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-indigo-300">
                    <MapPin className="h-3 w-3 mr-1" />
                    View on Map
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;

import React, { useState, useEffect } from 'react';
import { X, Calculator, MapPin, IndianRupee, Route, Clock, ArrowRight, Zap, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FareCalculatorProps {
  onClose: () => void;
}

interface BusStop {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

interface FareResult {
  fare: number;
  distance: number;
  duration: string;
  busType: string;
  route: string;
}

const FareCalculator: React.FC<FareCalculatorProps> = ({ onClose }) => {
  const [selectedFrom, setSelectedFrom] = useState<BusStop | null>(null);
  const [selectedTo, setSelectedTo] = useState<BusStop | null>(null);
  const [busType, setBusType] = useState<'ordinary' | 'express' | 'volvo'>('ordinary');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<FareResult | null>(null);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Comprehensive BMTC bus stops database - Organized by areas
  const busStops: BusStop[] = [
    // Central Bangalore
    { id: '1', name: 'Majestic Bus Station', area: 'Central Bangalore', lat: 12.9766, lng: 77.5993 },
    { id: '2', name: 'MG Road', area: 'Central Bangalore', lat: 12.9716, lng: 77.5946 },
    { id: '3', name: 'Brigade Road', area: 'Central Bangalore', lat: 12.9716, lng: 77.6092 },
    { id: '4', name: 'Cubbon Park', area: 'Central Bangalore', lat: 12.9718, lng: 77.5937 },
    { id: '5', name: 'Vidhana Soudha', area: 'Central Bangalore', lat: 12.9794, lng: 77.5912 },
    { id: '26', name: 'Shivajinagar', area: 'Central Bangalore', lat: 12.9899, lng: 77.6006 },
    { id: '27', name: 'Commercial Street', area: 'Central Bangalore', lat: 12.9833, lng: 77.6092 },
    
    // East Bangalore
    { id: '6', name: 'Whitefield', area: 'East Bangalore', lat: 12.9698, lng: 77.7500 },
    { id: '7', name: 'Marathahalli', area: 'East Bangalore', lat: 12.9591, lng: 77.6971 },
    { id: '8', name: 'Indiranagar', area: 'East Bangalore', lat: 12.9784, lng: 77.6408 },
    { id: '9', name: 'Koramangala', area: 'East Bangalore', lat: 12.9279, lng: 77.6271 },
    { id: '10', name: 'HSR Layout', area: 'East Bangalore', lat: 12.9082, lng: 77.6476 },
    { id: '28', name: 'Bellandur', area: 'East Bangalore', lat: 12.9258, lng: 77.6815 },
    { id: '29', name: 'Sarjapur Road', area: 'East Bangalore', lat: 12.9010, lng: 77.6953 },
    
    // South Bangalore
    { id: '11', name: 'Electronic City', area: 'South Bangalore', lat: 12.8399, lng: 77.6770 },
    { id: '12', name: 'Banashankari', area: 'South Bangalore', lat: 12.9248, lng: 77.5562 },
    { id: '13', name: 'Jayanagar', area: 'South Bangalore', lat: 12.9308, lng: 77.5838 },
    { id: '14', name: 'BTM Layout', area: 'South Bangalore', lat: 12.9166, lng: 77.6101 },
    { id: '15', name: 'JP Nagar', area: 'South Bangalore', lat: 12.9081, lng: 77.5831 },
    { id: '30', name: 'Silk Board', area: 'South Bangalore', lat: 12.9174, lng: 77.6226 },
    { id: '31', name: 'Wilson Garden', area: 'South Bangalore', lat: 12.9447, lng: 77.6047 },
    
    // North Bangalore
    { id: '16', name: 'Hebbal', area: 'North Bangalore', lat: 13.0358, lng: 77.5970 },
    { id: '17', name: 'Yelahanka', area: 'North Bangalore', lat: 13.1007, lng: 77.5963 },
    { id: '18', name: 'RT Nagar', area: 'North Bangalore', lat: 13.0143, lng: 77.5934 },
    { id: '19', name: 'Malleshwaram', area: 'North Bangalore', lat: 12.9944, lng: 77.5744 },
    { id: '20', name: 'Rajajinagar', area: 'North Bangalore', lat: 12.9915, lng: 77.5520 },
    { id: '32', name: 'Sadashivanagar', area: 'North Bangalore', lat: 12.9991, lng: 77.5804 },
    
    // West Bangalore
    { id: '21', name: 'Vijayanagar', area: 'West Bangalore', lat: 12.9715, lng: 77.5347 },
    { id: '22', name: 'Peenya', area: 'West Bangalore', lat: 13.0294, lng: 77.5186 },
    { id: '23', name: 'Yeshwanthpur', area: 'West Bangalore', lat: 13.0284, lng: 77.5547 },
    { id: '33', name: 'Nagarbhavi', area: 'West Bangalore', lat: 12.9581, lng: 77.5013 },
    
    // Airport & Special
    { id: '24', name: 'Kempegowda International Airport', area: 'Airport', lat: 13.1986, lng: 77.7066 },
    { id: '25', name: 'Manyata Tech Park', area: 'IT Corridor', lat: 13.0515, lng: 77.6211 },
    { id: '34', name: 'Bagmane Tech Park', area: 'IT Corridor', lat: 12.9698, lng: 77.7500 },
    { id: '35', name: 'Prestige Tech Park', area: 'IT Corridor', lat: 12.9591, lng: 77.6971 }
  ];

  // Group stations by area for better organization
  const groupedStations = busStops.reduce((acc, station) => {
    if (!acc[station.area]) {
      acc[station.area] = [];
    }
    acc[station.area].push(station);
    return acc;
  }, {} as Record<string, BusStop[]>);

  // Filter stations based on search
  const getFilteredStations = (searchTerm: string, excludeId?: string): BusStop[] => {
    if (!searchTerm.trim()) return busStops.filter(stop => stop.id !== excludeId);
    return busStops.filter(stop => 
      stop.id !== excludeId && (
        stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.area.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Select from station
  const selectFromStation = (stop: BusStop) => {
    setSelectedFrom(stop);
    setShowFromDropdown(false);
    setFromSearch('');
    setResult(null); // Clear previous result
  };

  // Select to station
  const selectToStation = (stop: BusStop) => {
    setSelectedTo(stop);
    setShowToDropdown(false);
    setToSearch('');
    setResult(null); // Clear previous result
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate fare based on distance and bus type
  const calculateFare = (distance: number, type: 'ordinary' | 'express' | 'volvo'): number => {
    let baseFare = 8; // Minimum fare
    let perKmRate = 1.2;

    switch (type) {
      case 'express':
        baseFare = 12;
        perKmRate = 1.5;
        break;
      case 'volvo':
        baseFare = 15;
        perKmRate = 2.0;
        break;
      default:
        baseFare = 8;
        perKmRate = 1.2;
    }

    const totalFare = baseFare + (distance * perKmRate);
    return Math.ceil(totalFare); // Round up to nearest rupee
  };

  // Calculate estimated travel time
  const calculateTravelTime = (distance: number): string => {
    const avgSpeed = 25; // km/h average speed in Bangalore traffic
    const timeInHours = distance / avgSpeed;
    const hours = Math.floor(timeInHours);
    const minutes = Math.ceil((timeInHours - hours) * 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get route suggestion
  const getRouteSuggestion = (from: string, to: string): string => {
    const routes = [
      'Route 500', 'Route 335E', 'Route 201R', 'Route 600', 'Route 356',
      'Route 201', 'Route 500D', 'Route 335', 'Route 400', 'Route 365'
    ];
    return routes[Math.floor(Math.random() * routes.length)];
  };

  // Handle fare calculation
  const handleCalculate = async () => {
    if (!selectedFrom || !selectedTo) {
      alert('Please select both from and to stations');
      return;
    }

    if (selectedFrom.id === selectedTo.id) {
      alert('From and To stations cannot be the same');
      return;
    }

    setIsCalculating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const distance = calculateDistance(
      selectedFrom.lat, selectedFrom.lng,
      selectedTo.lat, selectedTo.lng
    );

    const fare = calculateFare(distance, busType);
    const duration = calculateTravelTime(distance);
    const route = getRouteSuggestion(selectedFrom.name, selectedTo.name);

    setResult({
      fare,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      duration,
      busType: busType.charAt(0).toUpperCase() + busType.slice(1),
      route
    });

    setIsCalculating(false);
  };

  // Swap stations
  const swapStations = () => {
    const tempFrom = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(tempFrom);
    setResult(null); // Clear previous result
  };

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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  BMTC Fare Calculator
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Calculate exact bus fare between stations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Station Selection */}
            <div className="space-y-4">
              {/* From Station Dropdown */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  From Station
                </label>
                <button
                  onClick={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className={selectedFrom ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                    {selectedFrom ? (
                      <div>
                        <div className="font-medium">{selectedFrom.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedFrom.area}</div>
                      </div>
                    ) : (
                      'Select starting station...'
                    )}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showFromDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* From Dropdown */}
                {showFromDropdown && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
                    {/* Search Box */}
                    <div className="p-3 border-b dark:border-gray-600">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={fromSearch}
                          onChange={(e) => setFromSearch(e.target.value)}
                          placeholder="Search stations..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Stations List */}
                    <div className="max-h-64 overflow-y-auto">
                      {Object.entries(groupedStations).map(([area, stations]) => {
                        const filteredStations = stations.filter(station => 
                          station.id !== selectedTo?.id && (
                            !fromSearch.trim() || 
                            station.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
                            station.area.toLowerCase().includes(fromSearch.toLowerCase())
                          )
                        );
                        
                        if (filteredStations.length === 0) return null;
                        
                        return (
                          <div key={area}>
                            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                              {area}
                            </div>
                            {filteredStations.map((station) => (
                              <button
                                key={station.id}
                                onClick={() => selectFromStation(station)}
                                className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 border-b dark:border-gray-600 last:border-b-0 transition-colors"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{station.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{station.area}</div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      
                      {/* No results */}
                      {fromSearch.trim() && getFilteredStations(fromSearch, selectedTo?.id).length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No stations found for "{fromSearch}"</p>
                          <p className="text-xs mt-1">Try searching for "MG Road", "Whitefield", etc.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapStations}
                  className="p-3 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:from-blue-200 hover:to-green-200 dark:hover:from-blue-800/30 dark:hover:to-green-800/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={!selectedFrom || !selectedTo}
                  title="Swap stations"
                >
                  <ArrowRight className="w-5 h-5 transform rotate-90" />
                </button>
              </div>

              {/* To Station Dropdown */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  To Station
                </label>
                <button
                  onClick={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className={selectedTo ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                    {selectedTo ? (
                      <div>
                        <div className="font-medium">{selectedTo.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{selectedTo.area}</div>
                      </div>
                    ) : (
                      'Select destination station...'
                    )}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showToDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* To Dropdown */}
                {showToDropdown && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
                    {/* Search Box */}
                    <div className="p-3 border-b dark:border-gray-600">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={toSearch}
                          onChange={(e) => setToSearch(e.target.value)}
                          placeholder="Search stations..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Stations List */}
                    <div className="max-h-64 overflow-y-auto">
                      {Object.entries(groupedStations).map(([area, stations]) => {
                        const filteredStations = stations.filter(station => 
                          station.id !== selectedFrom?.id && (
                            !toSearch.trim() || 
                            station.name.toLowerCase().includes(toSearch.toLowerCase()) ||
                            station.area.toLowerCase().includes(toSearch.toLowerCase())
                          )
                        );
                        
                        if (filteredStations.length === 0) return null;
                        
                        return (
                          <div key={area}>
                            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                              {area}
                            </div>
                            {filteredStations.map((station) => (
                              <button
                                key={station.id}
                                onClick={() => selectToStation(station)}
                                className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 border-b dark:border-gray-600 last:border-b-0 transition-colors"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{station.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{station.area}</div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      
                      {/* No results */}
                      {toSearch.trim() && getFilteredStations(toSearch, selectedFrom?.id).length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No stations found for "{toSearch}"</p>
                          <p className="text-xs mt-1">Try searching for "Electronic City", "Airport", etc.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bus Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Route className="inline w-4 h-4 mr-1" />
                Bus Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'ordinary', label: 'Ordinary', icon: '🚌', desc: 'Basic service' },
                  { value: 'express', label: 'Express', icon: '⚡', desc: 'Faster route' },
                  { value: 'volvo', label: 'Volvo AC', icon: '❄️', desc: 'AC comfort' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setBusType(type.value as any)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      busType === type.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={!selectedFrom || !selectedTo || isCalculating}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {isCalculating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Calculator className="w-5 h-5" />
                  </motion.div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Calculate Fare</span>
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
                  Fare Calculation Result
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ₹{result.fare}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Fare</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.distance} km
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Distance</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Time:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {result.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bus Type:</span>
                    <span className="font-medium">{result.busType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Suggested Route:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{result.route}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Fares may vary slightly based on exact route taken. 
                    This is an estimated calculation based on distance.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FareCalculator;
import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Users, Gauge, MapPin, Clock, TrendingUp, AlertCircle, X, UserCheck, Armchair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bus3DVisualizationProps {
  busId?: string;
  routeNumber?: string;
  crowdLevel?: 'Low' | 'Medium' | 'High';
  speed?: number;
  nextStop?: string;
  eta?: string;
  onClose?: () => void;
}

// Seat interface for better type safety
interface Seat {
  id: number;
  isOccupied: boolean;
  passengerType: 'adult' | 'senior' | 'student' | 'child' | null;
  boardingStop: string | null;
  seatType: 'window' | 'aisle';
  isSelected: boolean;
  lastChanged: number;
}

const Bus3DVisualization: React.FC<Bus3DVisualizationProps> = ({
  busId = 'KA-01-AB-1234',
  routeNumber = 'Route 500',
  crowdLevel = 'Medium',
  speed = 35,
  nextStop = 'MG Road',
  eta = '5 mins',
  onClose
}) => {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [selectedView, setSelectedView] = useState<'exterior' | 'interior' | 'stats'>('interior');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Helper function to get crowd percentage (moved here to fix initialization error)
  const getCrowdPercentage = () => {
    switch(crowdLevel) {
      case 'Low': return 30;
      case 'Medium': return 60;
      case 'High': return 90;
      default: return 0;
    }
  };

  // Initialize realistic BMTC bus seat layout (40 seats in 2+2 configuration)
  const initializeSeats = useCallback((): Seat[] => {
    const seats: Seat[] = [];
    const crowdPercentage = getCrowdPercentage();
    const occupiedSeats = Math.floor((crowdPercentage / 100) * 40);
    
    // Create realistic seat layout
    for (let i = 1; i <= 40; i++) {
      const isWindow = i % 4 === 1 || i % 4 === 0; // Window seats: 1,4,5,8,9,12...
      const seat: Seat = {
        id: i,
        isOccupied: false,
        passengerType: null,
        boardingStop: null,
        seatType: isWindow ? 'window' : 'aisle',
        isSelected: false,
        lastChanged: Date.now()
      };
      seats.push(seat);
    }

    // Realistically distribute passengers
    const passengerTypes: Array<'adult' | 'senior' | 'student' | 'child'> = ['adult', 'senior', 'student', 'child'];
    const boardingStops = ['Kempegowda Bus Station', 'Majestic', 'KR Market', 'Lalbagh', 'BTM Layout'];
    
    // Fill seats with realistic patterns
    let occupiedCount = 0;
    const occupiedIndices = new Set<number>();
    
    // Priority seating patterns
    while (occupiedCount < occupiedSeats && occupiedIndices.size < 40) {
      let seatIndex: number;
      
      if (occupiedCount < 4) {
        // First few passengers prefer front seats
        seatIndex = Math.floor(Math.random() * 8);
      } else if (occupiedCount < occupiedSeats * 0.7) {
        // Most passengers prefer window seats
        const windowSeats = [0, 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 36, 39];
        seatIndex = windowSeats[Math.floor(Math.random() * windowSeats.length)];
      } else {
        // Fill remaining randomly
        seatIndex = Math.floor(Math.random() * 40);
      }
      
      if (!occupiedIndices.has(seatIndex)) {
        occupiedIndices.add(seatIndex);
        seats[seatIndex].isOccupied = true;
        seats[seatIndex].passengerType = passengerTypes[Math.floor(Math.random() * passengerTypes.length)];
        seats[seatIndex].boardingStop = boardingStops[Math.floor(Math.random() * boardingStops.length)];
        occupiedCount++;
      }
    }

    return seats;
  }, [crowdLevel]);

  const [seats, setSeats] = useState<Seat[]>(() => initializeSeats());

  // Real-time seat changes simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSeats(prevSeats => {
        const newSeats = [...prevSeats];
        const now = Date.now();
        
        // Randomly select 1-2 seats to change
        const changeCount = Math.random() > 0.7 ? 2 : 1;
        
        for (let i = 0; i < changeCount; i++) {
          const randomIndex = Math.floor(Math.random() * 40);
          const seat = newSeats[randomIndex];
          
          // 30% chance a passenger gets up, 20% chance someone sits down
          if (seat.isOccupied && Math.random() > 0.7) {
            // Passenger gets up
            seat.isOccupied = false;
            seat.passengerType = null;
            seat.boardingStop = null;
            seat.lastChanged = now;
          } else if (!seat.isOccupied && Math.random() > 0.8) {
            // New passenger sits down
            const passengerTypes: Array<'adult' | 'senior' | 'student' | 'child'> = ['adult', 'senior', 'student', 'child'];
            const boardingStops = ['Silk Board', 'Electronic City', 'Bannerghatta Road', 'JP Nagar'];
            
            seat.isOccupied = true;
            seat.passengerType = passengerTypes[Math.floor(Math.random() * passengerTypes.length)];
            seat.boardingStop = boardingStops[Math.floor(Math.random() * boardingStops.length)];
            seat.lastChanged = now;
          }
        }
        
        return newSeats;
      });
      
      // Update last refresh time
      setLastUpdate(new Date().toLocaleTimeString());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle seat selection
  const handleSeatClick = (seatId: number) => {
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  // Auto-rotate the bus
  useEffect(() => {
    if (isAutoRotating) {
      const interval = setInterval(() => {
        setRotation(prev => ({ ...prev, y: (prev.y + 1) % 360 }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAutoRotating]);

  // Handle mouse/touch drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      setIsAutoRotating(false);
      setRotation(prev => ({
        x: Math.max(-60, Math.min(60, prev.x - e.movementY * 0.5)),
        y: prev.y + e.movementX * 0.5
      }));
    }
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🚌 Seat Vacancy Analyzer
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Bus className="w-4 h-4" />
                <span>{busId} - {routeNumber}</span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="p-6">
            {/* View Selection */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('exterior')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedView === 'exterior'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Bus className="inline-block w-4 h-4 mr-2" />
                Exterior View
              </button>
              <button
                onClick={() => setSelectedView('interior')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedView === 'interior'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Armchair className="inline-block w-4 h-4 mr-2" />
                Seat Analyzer
              </button>
              <button
                onClick={() => setSelectedView('stats')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedView === 'stats'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="inline-block w-4 h-4 mr-2" />
                Live Stats
              </button>
            </div>

            {/* 3D Visualization Area */}
            <div className="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden mb-6">
              <AnimatePresence mode="wait">
                {selectedView === 'exterior' && (
                  <motion.div
                    key="exterior"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setIsAutoRotating(true)}
                  >
                    {/* Ambient grid / glow */}
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_20%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
                    </div>

                    {/* 3D Bus Container */}
                    <div 
                      className="relative preserve-3d drop-shadow-2xl"
                      style={{
                        transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: 'preserve-3d',
                        transition: isAutoRotating ? 'none' : 'transform 0.1s'
                      }}
                    >
                      {/* Ground shadow */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-12 rounded-full blur-2xl bg-black/30" />

                      {/* Bus body with depth */}
                      <div className="relative w-80 h-40">
                        {/* Side panel */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-xl shadow-2xl border border-white/10">
                          {/* roof highlight */}
                          <div className="absolute inset-x-2 top-2 h-4 rounded-xl bg-white/20 blur-sm" />
                          {/* windows strip */}
                          <div className="absolute top-10 left-4 right-4 h-16 flex items-center justify-between px-3">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="h-12 w-12 rounded-md bg-gradient-to-br from-cyan-100/80 to-cyan-300/80 shadow-inner border border-white/30"
                              />
                            ))}
                          </div>
                          {/* route badge */}
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/80 text-blue-700 text-xs font-semibold shadow-sm">
                            {routeNumber}
                          </div>
                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-900/70 text-white text-xs font-semibold shadow-sm">
                            {busId}
                          </div>
                          {/* door + panels */}
                          <div className="absolute bottom-6 left-8 h-16 w-12 rounded-md bg-slate-200/90 border border-slate-300 shadow-inner" />
                          <div className="absolute bottom-6 right-8 h-16 w-12 rounded-md bg-slate-200/90 border border-slate-300 shadow-inner" />
                          {/* underglow */}
                          <div className="absolute -bottom-2 inset-x-6 h-3 rounded-full bg-cyan-400/60 blur" />
                        </div>

                        {/* Front face */}
                        <div className="absolute inset-y-4 -left-4 w-8 rounded-l-xl bg-gradient-to-b from-blue-700 to-blue-900 shadow-lg" style={{ transform: 'translateZ(-12px) skewY(-3deg)' }} />
                        {/* Rear face */}
                        <div className="absolute inset-y-4 -right-4 w-8 rounded-r-xl bg-gradient-to-b from-blue-700 to-blue-900 shadow-lg" style={{ transform: 'translateZ(-12px) skewY(3deg)' }} />

                        {/* Wheels */}
                        <div className="absolute -bottom-4 left-10 w-12 h-12 bg-neutral-900 rounded-full shadow-inner shadow-black/40 animate-[spin_6s_linear_infinite] opacity-90" />
                        <div className="absolute -bottom-4 right-10 w-12 h-12 bg-neutral-900 rounded-full shadow-inner shadow-black/40 animate-[spin_6s_linear_infinite] opacity-90" />
                        <div className="absolute -bottom-2 left-12 w-6 h-6 bg-gray-700 rounded-full" />
                        <div className="absolute -bottom-2 right-12 w-6 h-6 bg-gray-700 rounded-full" />
                      </div>
                    </div>

                    {/* Controls + HUD */}
                    <div className="absolute top-4 left-4 flex items-center gap-3">
                      <button
                        onClick={() => setIsAutoRotating(!isAutoRotating)}
                        className="px-3 py-1 bg-white bg-opacity-80 text-gray-800 rounded text-sm hover:bg-opacity-100 transition-all shadow-sm"
                      >
                        {isAutoRotating ? 'Stop Rotation' : 'Auto Rotate'}
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex gap-3 justify-center">
                      <div className="px-4 py-2 rounded-lg bg-white/70 backdrop-blur text-sm font-semibold text-gray-800 shadow">
                        Speed: {speed} km/h
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-white/70 backdrop-blur text-sm font-semibold text-gray-800 shadow">
                        Next: {nextStop} · ETA {eta}
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-white/70 backdrop-blur text-sm font-semibold text-gray-800 shadow">
                        Crowd: {crowdLevel}
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedView === 'interior' && (
                  <motion.div
                    key="interior"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 p-4"
                  >
                    <div className="h-full overflow-y-auto">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 w-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🚌 Live Seat Map</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Last Update: {lastUpdate || 'Just now'}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <div className="text-center mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {routeNumber} - Driver's Seat
                          </div>
                          
                          <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
                            {seats.map((seat) => (
                              <motion.div
                                key={seat.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSeatClick(seat.id)}
                                className={`
                                  relative w-10 h-10 rounded-lg cursor-pointer transition-all duration-300 border-2
                                  flex items-center justify-center text-xs font-bold
                                  ${seat.isOccupied 
                                    ? 'bg-red-400 border-red-500 text-white shadow-lg' 
                                    : 'bg-green-400 border-green-500 text-white shadow-lg hover:bg-green-300'
                                  }
                                  ${selectedSeat === seat.id ? 'ring-4 ring-blue-300' : ''}
                                  ${seat.seatType === 'window' ? 'border-l-4 border-l-blue-300' : ''}
                                `}
                              >
                                {seat.id}
                                {seat.isOccupied && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1"
                                  >
                                    <UserCheck className="w-3 h-3 text-white" />
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>🚪 Front</span>
                            <span>🚪 Rear</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Armchair className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <div>
                                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                                  {seats.filter(s => !s.isOccupied).length}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Available</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <div>
                                <div className="text-xl font-bold text-red-700 dark:text-red-300">
                                  {seats.filter(s => s.isOccupied).length}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">Occupied</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-400 rounded border border-green-500"></div>
                            <span className="text-gray-700 dark:text-gray-300">Available</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-400 rounded border border-red-500"></div>
                            <span className="text-gray-700 dark:text-gray-300">Occupied</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedView === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 p-6"
                  >
                    <div className="grid grid-cols-2 gap-4 h-full">
                      {/* Speed Gauge */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                        <Gauge className="w-12 h-12 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{speed}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">km/h</div>
                      </div>
                      
                      {/* Crowd Level */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-orange-500 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{crowdLevel}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{getCrowdPercentage()}% Full</div>
                      </div>
                      
                      {/* Next Stop */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                        <MapPin className="w-12 h-12 text-green-500 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{nextStop}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Next Stop</div>
                      </div>
                      
                      {/* ETA */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
                        <Clock className="w-12 h-12 text-purple-500 mb-2" />
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{eta}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">ETA</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info Panel */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {selectedView === 'exterior' && 'Drag to rotate the 3D model or enable auto-rotation'}
                  {selectedView === 'interior' && '🎯 Live Seat Vacancy Analyzer - Watch passengers get up/sit in real-time! Click seats for details.'}
                  {selectedView === 'stats' && 'Live statistics updated every 30 seconds'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Bus3DVisualization;

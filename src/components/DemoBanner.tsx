import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoBannerProps {
  className?: string;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check demo mode status
    const checkDemoMode = () => {
      const demoMode = localStorage.getItem('demoMode') === 'true';
      setIsDemoMode(demoMode);
    };

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Initial check
    checkDemoMode();

    // Listen for storage changes
    window.addEventListener('storage', checkDemoMode);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check periodically
    const interval = setInterval(checkDemoMode, 2000);

    return () => {
      window.removeEventListener('storage', checkDemoMode);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      >
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <AlertCircle className="w-4 h-4" />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">🎯 DEMO MODE</span>
                <span className="text-purple-100">|</span>
                <span className="text-sm">
                  Using simulated bus data for demonstration
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 text-purple-100">
                <span className="text-xs">•</span>
                <span className="text-xs">Perfect for showcasing seat analyzer features</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 text-purple-200 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live simulation active</span>
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label="Dismiss demo banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Demo Controls for presentation */}
        <div className="bg-purple-600 bg-opacity-90 px-4 py-1">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-purple-100 text-xs">
              <div className="flex items-center space-x-4">
                <span>Demo Features:</span>
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Real-time seat updates</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Interactive seat selection</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Live crowd simulation</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>Press F12 → Console → type: demoAPI.disable() to use real APIs</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoBanner;

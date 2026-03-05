import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Clock, Shield, X, Zap, Eye, BarChart3, MessageCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
  onStartTracking: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartTracking }) => {
  const { t } = useTranslation();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    activeBuses: 0,
    liveUsers: 0,
    routesCovered: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  const targetStats = {
    activeBuses: 1247,
    liveUsers: 892,
    routesCovered: 523
  };

  useEffect(() => {
    // Animate counters on component mount
    if (!hasAnimated) {
      const duration = 2500; // 2.5 seconds
      const steps = 100;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setCurrentStats({
          activeBuses: Math.floor(targetStats.activeBuses * easeOutQuart),
          liveUsers: Math.floor(targetStats.liveUsers * easeOutQuart),
          routesCovered: Math.floor(targetStats.routesCovered * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCurrentStats(targetStats);
          setHasAnimated(true);
          
          // Start live updates after animation
          const liveInterval = setInterval(() => {
            setCurrentStats(prev => ({
              activeBuses: Math.max(1200, Math.min(1300, prev.activeBuses + Math.floor(Math.random() * 6) - 3)),
              liveUsers: Math.max(850, Math.min(950, prev.liveUsers + Math.floor(Math.random() * 10) - 5)),
              routesCovered: Math.max(520, Math.min(530, prev.routesCovered + Math.floor(Math.random() * 2) - 1))
            }));
          }, 3000);

          return () => clearInterval(liveInterval);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [hasAnimated, targetStats]);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.30), rgba(0, 0, 0, 0.20)),
          url('data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
              <defs>
                <pattern id="bus-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
                  <rect width="100" height="100" fill="none"/>
                  <path d="M20,20 L80,20 L80,70 L20,70 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                  <circle cx="30" cy="80" r="5" fill="rgba(255,255,255,0.1)"/>
                  <circle cx="70" cy="80" r="5" fill="rgba(255,255,255,0.1)"/>
                </pattern>
              </defs>
              <rect width="1000" height="1000" fill="url(#bus-pattern)"/>
            </svg>
          `)}'),
          linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)
        `
      }}
    >
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('common.appName')}
              <span className="block text-3xl md:text-4xl text-yellow-300 mt-2">
                {t('hero.title')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="bg-cyan-500 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">BMTC</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={onStartTracking}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black font-bold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                {t('hero.startTracking')}
              </button>
              <button
                onClick={() => setShowLearnMore(true)}
                className="border-2 border-white text-white hover:bg-gradient-to-r hover:from-white hover:to-gray-100 hover:text-purple-900 font-bold px-8 py-4 rounded-lg text-lg transition-all shadow-lg"
              >
                {t('hero.learnMore')}
              </button>
            </div>
            
            {/* Live Stats with Enhanced Animation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-cyan-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center mb-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <MapPin className="h-8 w-8 text-cyan-300" />
                  </motion.div>
                </div>
                <motion.div 
                  className="text-3xl font-bold mb-2"
                  key={currentStats.activeBuses}
                  initial={{ scale: 1.2, color: "#67e8f9" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStats.activeBuses.toLocaleString()}
                </motion.div>
                <div className="text-sm text-cyan-100 flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  />
                  {t('stats.busesTracked')}
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-emerald-400/20 to-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Users className="h-8 w-8 text-emerald-300" />
                  </motion.div>
                </div>
                <motion.div 
                  className="text-3xl font-bold mb-2"
                  key={currentStats.liveUsers}
                  initial={{ scale: 1.2, color: "#34d399" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStats.liveUsers.toLocaleString()}
                </motion.div>
                <div className="text-sm text-emerald-100 flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  />
                  {t('stats.activeUsers')}
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-violet-400/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-violet-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center mb-3">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  >
                    <Clock className="h-8 w-8 text-violet-300" />
                  </motion.div>
                </div>
                <motion.div 
                  className="text-3xl font-bold mb-2"
                  key={currentStats.routesCovered}
                  initial={{ scale: 1.2, color: "#a78bfa" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStats.routesCovered.toLocaleString()}
                </motion.div>
                <div className="text-sm text-violet-100 flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  />
                  {t('stats.routesCovered')}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Features Preview */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
          <div className="text-center">
            <div className="bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-cyan-300/40 shadow-lg">
              <MapPin className="h-8 w-8 text-cyan-200" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.realTimeGPS')}</h3>
            <p className="text-sm text-cyan-100">{t('features.liveLocationUpdates')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-emerald-400/30 to-green-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-emerald-300/40 shadow-lg">
              <Users className="h-8 w-8 text-emerald-200" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.crowdDetection')}</h3>
            <p className="text-sm text-emerald-100">{t('features.aiPoweredAnalysis')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-amber-400/30 to-yellow-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-amber-300/40 shadow-lg">
              <Clock className="h-8 w-8 text-amber-200" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.smartSchedules')}</h3>
            <p className="text-sm text-amber-100">{t('features.accuratePredictions')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-violet-300/40 shadow-lg">
              <Shield className="h-8 w-8 text-violet-200" />
            </div>
            <h3 className="font-semibold mb-2">{t('features.reliableData')}</h3>
            <p className="text-sm text-violet-100">{t('features.accuracy')}</p>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Learn More Modal */}
      <AnimatePresence>
        {showLearnMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLearnMore(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">About WhereIsMyBus</h2>
                      <p className="text-purple-100 text-sm">Your Smart Transit Companion</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* What We Do */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    What We Do
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    WhereIsMyBus is your personal bus tracking assistant that makes public transportation 
                    easy and predictable. We help you know exactly when your bus will arrive, how crowded 
                    it is, and the best routes to take - all in real-time!
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Live Tracking</h4>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        See exactly where your bus is on the map and when it will reach your stop
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Users className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Crowd Detection</h4>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Know how crowded the bus is before it arrives - plan for a comfortable journey
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">Smart Predictions</h4>
                      </div>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        AI-powered arrival predictions that get more accurate over time
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Navigation className="w-5 h-5 text-orange-600 mr-2" />
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100">Route Planning</h4>
                      </div>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Find the best routes and get alternative suggestions during disruptions
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Helps */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
                    How It Helps You
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Save Time</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No more waiting at bus stops wondering when your bus will come
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Travel Comfortably</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Choose less crowded buses for a more comfortable journey
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Plan Better</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Make informed decisions about your daily commute
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-100 mb-2">
                    🚌 Currently Supporting
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">BMTC Bangalore</span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">KSRTC Karnataka</span>
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">APSRTC Andhra</span>
                    <span className="bg-violet-500 text-white px-3 py-1 rounded-full text-sm font-medium">TNSTC Tamil Nadu</span>
                  </div>
                  <p className="text-sm text-cyan-800 dark:text-cyan-200 mt-2">
                    More cities and transport systems coming soon!
                  </p>
                </div>

                {/* Call to Action */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setShowLearnMore(false);
                      onStartTracking();
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start Tracking Now! 🚀
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Join thousands of smart commuters already using WhereIsMyBus
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;

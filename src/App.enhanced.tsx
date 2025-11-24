import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, Search, Menu, X, Info, Calendar, Route, Users, Bell, Star, Settings, Calculator } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SearchSection from './components/SearchSection';
import LiveTrackingSection from './components/LiveTrackingSection';
import FeaturesSection from './components/FeaturesSection';
import ServicesSection from './components/ServicesSection';
import CoverageSection from './components/CoverageSection';
import StatsSection from './components/StatsSection';
import Footer from './components/Footer';
import BusStopInfo from './components/BusStopInfo';
import NotificationCenter from './components/NotificationCenter';
import UserPreferences from './components/UserPreferences';
import ConnectionStatus from './components/ConnectionStatus';
import OfflineIndicator from './components/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageSwitcher from './components/LanguageSwitcher';
import VoiceControl from './components/VoiceControl';
import FareCalculator from './components/FareCalculator';

// New Phase 1 Components
import BottomNavigation from './components/BottomNavigation';
import ThemeToggle from './components/ThemeToggle';
import PullToRefresh from './components/ui/PullToRefresh';
import { ThemeProvider } from './contexts/ThemeContext';

import { initializeAuth, getCurrentUser } from './services/auth';
import { initializePWA } from './services/pwa';
import { useOfflineData } from './hooks/useOfflineSync';
import { useErrorHandler } from './hooks/useErrorHandler';
import { voiceService } from './services/voiceService';

function AppContent() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserPreferences, setShowUserPreferences] = useState(false);
  const [showFareCalculator, setShowFareCalculator] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use new hooks for offline data and error handling
  const { isOnline, isDataStale } = useOfflineData();
  const { handleError } = useErrorHandler();

  // Initialize authentication and PWA features
  useEffect(() => {
    // Initialize authentication with error handling
    initializeAuth()
      .then(authUser => {
        if (authUser) {
          setUser(authUser);
        }
      })
      .catch((error: Error) => {
        handleError(error);
      });

    // Initialize PWA features
    initializePWA();

    // Setup voice command listeners
    const handleVoiceNavigate = (e: CustomEvent) => {
      const destination = e.detail;
      if (destination.includes('home')) setActiveSection('home');
      else if (destination.includes('tracking')) setActiveSection('tracking');
      else if (destination.includes('fare')) setShowFareCalculator(true);
    };

    const handleVoiceSearchBus = (e: CustomEvent) => {
      setSearchQuery(e.detail);
      setActiveSection('tracking');
    };

    const handleVoiceChangeLanguage = (e: CustomEvent) => {
      const lang = e.detail;
      const langMap: { [key: string]: string } = {
        'english': 'en',
        'hindi': 'hi',
        'kannada': 'kn',
        'tamil': 'ta',
        'telugu': 'te'
      };
      const langCode = langMap[lang.toLowerCase()];
      if (langCode) {
        i18n.changeLanguage(langCode);
      }
    };

    window.addEventListener('voice-navigate', handleVoiceNavigate as EventListener);
    window.addEventListener('voice-search-bus', handleVoiceSearchBus as EventListener);
    window.addEventListener('voice-change-language', handleVoiceChangeLanguage as EventListener);

    return () => {
      window.removeEventListener('voice-navigate', handleVoiceNavigate as EventListener);
      window.removeEventListener('voice-search-bus', handleVoiceSearchBus as EventListener);
      window.removeEventListener('voice-change-language', handleVoiceChangeLanguage as EventListener);
    };
  }, [handleError, i18n]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveSection('tracking');
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    setActiveSection('tracking');
    setIsMobileMenuOpen(false);
  };

  const handleStopSelect = (stopId: string) => {
    setSelectedStop(stopId);
    setIsMobileMenuOpen(false);
  };

  const handleSectionChange = (section: string) => {
    // Map bottom navigation sections to actual sections
    if (section === 'schedule' || section === 'routes' || section === 'crowd') {
      setActiveSection('tracking');
    } else {
      setActiveSection(section);
    }
    setIsMobileMenuOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app, this would reload data
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    // You can add actual data refresh logic here
    window.location.reload();
  };

  // Check if we're on mobile
  const isMobile = window.innerWidth < 768;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />

        {/* Connection status indicators */}
        <ConnectionStatus />
        <OfflineIndicator />

        {/* Theme Toggle - Top Right */}
        <div className="fixed top-20 right-20 z-50 hidden md:block">
          <ThemeToggle />
        </div>

        {/* Language Switcher - Top Right */}
        <div className="fixed top-20 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {/* Voice Control Button */}
        <VoiceControl />

        {/* Header - Hide on mobile when using bottom navigation */}
        <div className={isMobile && activeSection === 'tracking' ? 'hidden' : ''}>
          <Header 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            user={user}
            onShowNotifications={() => setShowNotifications(true)}
            onShowPreferences={() => setShowUserPreferences(true)}
          />
        </div>

        {/* Main Content with Pull to Refresh */}
        <PullToRefresh 
          onRefresh={handleRefresh}
          className="min-h-screen"
        >
          <AnimatePresence mode="wait">
            {activeSection === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HeroSection onStartTracking={() => setActiveSection('tracking')} />
                <SearchSection onSearch={handleSearch} />
              </motion.div>
            )}

            {activeSection === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className={isMobile ? 'pb-20' : ''}
              >
                <LiveTrackingSection
                  selectedRoute={selectedRoute}
                  onRouteSelect={handleRouteSelect}
                  onStopSelect={handleStopSelect}
                  searchQuery={searchQuery}
                  user={user}
                  isOnline={isOnline}
                  isDataStale={isDataStale}
                />
                {/* Fare Calculator Button */}
                <motion.button
                  onClick={() => setShowFareCalculator(true)}
                  className="fixed bottom-24 right-6 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110 z-40"
                  aria-label="Open fare calculator"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calculator className="h-6 w-6" />
                </motion.button>
              </motion.div>
            )}

            {activeSection === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <FeaturesSection />
              </motion.div>
            )}
            
            {activeSection === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ServicesSection />
              </motion.div>
            )}
            
            {activeSection === 'coverage' && (
              <motion.div
                key="coverage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CoverageSection />
              </motion.div>
            )}
          </AnimatePresence>

          <StatsSection />
          
          <Footer />
        </PullToRefresh>

        {/* Bottom Navigation for Mobile */}
        {isMobile && (
          <BottomNavigation 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        )}

        {/* Modals and Overlays */}
        <AnimatePresence>
          {selectedStop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <BusStopInfo 
                stopId={selectedStop} 
                onClose={() => setSelectedStop(null)}
                user={user}
              />
            </motion.div>
          )}

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <NotificationCenter
                user={user}
                onClose={() => setShowNotifications(false)}
              />
            </motion.div>
          )}

          {showUserPreferences && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <UserPreferences
                user={user}
                onClose={() => setShowUserPreferences(false)}
                onUserUpdate={setUser}
              />
            </motion.div>
          )}

          {/* Fare Calculator Modal */}
          {showFareCalculator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <button
                  onClick={() => setShowFareCalculator(false)}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 z-10 transition-colors"
                  aria-label="Close fare calculator"
                >
                  <X className="h-5 w-5" />
                </button>
                <FareCalculator />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay when refreshing */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Refreshing...</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

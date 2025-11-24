import React, { useState, useEffect } from 'react';
import { Users, Calculator } from 'lucide-react';
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
import DataModeToggle from './components/DataModeToggle';

// New Phase 1 Components
import BottomNavigation from './components/BottomNavigation';
import ThemeToggle from './components/ThemeToggle';
import PullToRefresh from './components/ui/PullToRefresh';
import { ThemeProvider } from './contexts/ThemeContext';

// Phase 3 Advanced Components - The Cool Stuff! 🚀
import AIAssistant from './components/ai/AIAssistant';
import SocialFeatures from './components/social/SocialFeatures';
import Bus3DVisualization from './components/visualization/Bus3DVisualization';
import UserDashboard from './components/UserDashboard';

// NEW: Phase 4 - Unique Features! 🌟
import BusBuddyAI from './components/BusBuddyAI';
import WeatherAwareRoutes from './components/WeatherAwareRoutes';
import CrowdPredictionWidget from './components/CrowdPredictionWidget';
import DemoBanner from './components/DemoBanner';

import { initializePWA } from './services/pwa';
import { useOfflineData } from './hooks/useOfflineSync';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useAuth } from './hooks/useFirebase';
import { ENABLE_FIREBASE } from './config/runtime';

function AppContent() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Removed user authentication - keeping it simple
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserPreferences, setShowUserPreferences] = useState(false);
  const [showFareCalculator, setShowFareCalculator] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  
  // Phase 3 Advanced Features States 🚀
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [show3DVisualization, setShow3DVisualization] = useState(false);
  const [showSocialFeatures, setShowSocialFeatures] = useState(false);
  
  // NEW: Phase 4 Unique Features States 🌟
  const [showBusBuddy, setShowBusBuddy] = useState(false);
  const [showWeatherRoutes, setShowWeatherRoutes] = useState(false);
  const [showCrowdPrediction, setShowCrowdPrediction] = useState(false);
  
  
  // Use new hooks for offline data and error handling
  const { isOnline, isDataStale } = useOfflineData();
  const { handleError } = useErrorHandler();
  const { user } = useAuth();

  // Initialize PWA features and Firebase
  useEffect(() => {
    // Initialize PWA features
    initializePWA();

    // Initialize Firebase silently in background
    if (ENABLE_FIREBASE) {
      const initFirebase = async () => {
        try {
          const { firebaseMigration } = await import('./utils/firebaseMigration');
          const routesExist = await firebaseMigration.checkCollectionExists('routes');
          
          if (!routesExist) {
            console.log('🔥 Initializing Firebase with sample data...');
            await firebaseMigration.runMigration();
            console.log('✅ Firebase initialized successfully!');
          }
        } catch (error) {
          console.warn('Firebase initialization skipped:', error);
        }
      };
      
      // Run Firebase initialization silently
      initFirebase();
    } else {
      console.log('Firebase calls disabled for local/offline mode');
    }

    // Load preferred language from localStorage on app start
    const preferredLang = localStorage.getItem('preferredLanguage');
    if (preferredLang && preferredLang !== i18n.language) {
      i18n.changeLanguage(preferredLang);
    }

    // Setup voice command listeners
    const handleVoiceNavigate = (e: CustomEvent) => {
      const destination = e.detail;
      if (destination.includes('home')) setActiveSection('home');
      else if (destination.includes('tracking')) setActiveSection('tracking');
      else if (destination.includes('fare')) setShowFareCalculator(true);
      else if (destination.includes('dashboard')) setShowUserDashboard(true);
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
        localStorage.setItem('preferredLanguage', langCode);
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

        {/* Demo Banner for presentation */}
        <DemoBanner />

        {/* Connection status indicators */}
        <ConnectionStatus />
        <OfflineIndicator />

        {/* Top-right controls */}
        <div className="fixed top-20 right-4 z-50 space-y-3 flex flex-col items-end">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <LanguageSwitcher />
          <DataModeToggle />
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
                  isOnline={isOnline}
                  isDataStale={isDataStale}
                  user={user}
                />
                {/* Floating Action Buttons for Phase 3 Features 🚀 */}
                <div className="fixed bottom-24 right-6 flex flex-col space-y-3 z-40">
                  {/* AI Assistant Button */}
                  <motion.button
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg transition-all"
                    aria-label="Open BusGuru"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="BusGuru"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </motion.button>

                  {/* 3D Visualization Button */}
                  <motion.button
                    onClick={() => setShow3DVisualization(true)}
                    className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full shadow-lg transition-all"
                    aria-label="Open 3D Bus View"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="3D Bus View"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </motion.button>

                  {/* Social Features Button */}
                  <motion.button
                    onClick={() => setShowSocialFeatures(true)}
                    className="p-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-full shadow-lg transition-all"
                    aria-label="Open Social Features"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Community & Social"
                  >
                    <Users className="h-6 w-6" />
                  </motion.button>

                  {/* Fare Calculator Button */}
                  <motion.button
                    onClick={() => setShowFareCalculator(true)}
                    className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all"
                    aria-label="Open fare calculator"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Fare Calculator"
                  >
                    <Calculator className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* NEW: Phase 4 Unique Features Buttons 🌟 */}
                <div className="fixed bottom-24 left-6 flex flex-col space-y-3 z-40">
                  {/* Bus Buddy AI Button */}
                  <motion.button
                    onClick={() => setShowBusBuddy(true)}
                    className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg transition-all"
                    aria-label="Open Bus Buddy AI"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Bus Buddy AI - Your Smart Commute Assistant"
                  >
                    <span className="text-2xl">🧠</span>
                  </motion.button>

                  {/* Weather-Aware Routes Button */}
                  <motion.button
                    onClick={() => setShowWeatherRoutes(true)}
                    className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full shadow-lg transition-all"
                    aria-label="Open Weather Routes"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Weather-Aware Routes"
                  >
                    <span className="text-2xl">🌦️</span>
                  </motion.button>

        {/* Crowd Prediction Button */}
        <motion.button
          onClick={() => setShowCrowdPrediction(true)}
          className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg transition-all"
          aria-label="Open Crowd Prediction"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="AI Crowd Prediction"
        >
          <span className="text-2xl">🔮</span>
        </motion.button>
        

                </div>
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

        {/* Modal Components */}
        {selectedStop && (
          <BusStopInfo 
            stopId={selectedStop} 
            onClose={() => setSelectedStop(null)} 
          />
        )}

        {showNotifications && (
          <NotificationCenter 
            user={user}
            onClose={() => setShowNotifications(false)} 
          />
        )}

        {showUserPreferences && (
          <UserPreferences 
            onClose={() => setShowUserPreferences(false)} 
          />
        )}

        {showFareCalculator && (
          <FareCalculator 
            onClose={() => setShowFareCalculator(false)} 
          />
        )}

        {showUserDashboard && (
          <UserDashboard 
            onClose={() => setShowUserDashboard(false)} 
          />
        )}

        {/* Phase 3 Advanced Modals 🚀 */}
        {showAIAssistant && (
          <AIAssistant 
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)} 
          />
        )}

        {show3DVisualization && (
          <Bus3DVisualization 
            busId="KA-01-1234"
            crowdLevel="Medium"
            onClose={() => setShow3DVisualization(false)} 
          />
        )}

        {showSocialFeatures && (
          <SocialFeatures 
            userId="demo-user"
            onClose={() => setShowSocialFeatures(false)} 
          />
        )}

        {/* NEW: Phase 4 Unique Features Modals 🌟 */}
        {showBusBuddy && (
          <BusBuddyAI 
            userId="00000000-0000-0000-0000-000000000001"
            onClose={() => setShowBusBuddy(false)} 
          />
        )}

        {showWeatherRoutes && (
          <WeatherAwareRoutes 
            city="Bangalore"
            onClose={() => setShowWeatherRoutes(false)} 
          />
        )}

      {showCrowdPrediction && (
        <CrowdPredictionWidget 
          routeId="bmtc-335E"
          routeName="Kengeri to Whitefield"
          onClose={() => setShowCrowdPrediction(false)} 
        />
      )}
      


        {/* Voice Control */}
        <VoiceControl />
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

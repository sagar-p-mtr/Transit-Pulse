import React, { useState, useEffect } from 'react';
import { Bus, Clock, MapPin, Search, Menu, X, Info, Calendar, Route, Users, Bell, Star, Settings, Calculator } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
import { initializeAuth, getCurrentUser } from './services/auth';
import { initializePWA } from './services/pwa';
import { useOfflineData } from './hooks/useOfflineSync';
import { useErrorHandler } from './hooks/useErrorHandler';
import { voiceService } from './services/voiceService';

function App() {
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
    // The search will be handled by the LiveTrackingSection component
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
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
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

        {/* Language Switcher - Top Right */}
        <div className="fixed top-20 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {/* Voice Control Button */}
        <VoiceControl />

        <Header 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          user={user}
          onShowNotifications={() => setShowNotifications(true)}
          onShowPreferences={() => setShowUserPreferences(true)}
        />

        {activeSection === 'home' && (
          <>
            <HeroSection onStartTracking={() => setActiveSection('tracking')} />
            <SearchSection onSearch={handleSearch} />
          </>
        )}

        {activeSection === 'tracking' && (
          <>
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
            <button
              onClick={() => setShowFareCalculator(true)}
              className="fixed bottom-24 right-6 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110 z-40"
              aria-label="Open fare calculator"
            >
              <Calculator className="h-6 w-6" />
            </button>
          </>
        )}

        {activeSection === 'features' && <FeaturesSection />}
        
        {activeSection === 'services' && <ServicesSection />}
        
        {activeSection === 'coverage' && <CoverageSection />}

        <StatsSection />
        
        <Footer />

        {/* Modals and Overlays */}
        {selectedStop && (
          <BusStopInfo 
            stopId={selectedStop} 
            onClose={() => setSelectedStop(null)}
            user={user}
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
            user={user}
            onClose={() => setShowUserPreferences(false)}
            onUserUpdate={setUser}
          />
        )}

        {/* Fare Calculator Modal */}
        {showFareCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowFareCalculator(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
                aria-label="Close fare calculator"
              >
                <X className="h-5 w-5" />
              </button>
              <FareCalculator />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

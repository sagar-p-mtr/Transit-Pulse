/**
 * Floating Feature Menu - Elegant Radial Menu
 * Consolidates all feature buttons into a single expandable menu
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calculator, Menu, X } from 'lucide-react';

interface FloatingFeatureMenuProps {
  onOpenAIAssistant: () => void;
  onOpen3DView: () => void;
  onOpenSocial: () => void;
  onOpenFareCalculator: () => void;
  onOpenBusBuddy: () => void;
  onOpenWeatherRoutes: () => void;
  onOpenCrowdPrediction: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  gradient: string;
}

const FloatingFeatureMenu: React.FC<FloatingFeatureMenuProps> = ({
  onOpenAIAssistant,
  onOpen3DView,
  onOpenSocial,
  onOpenFareCalculator,
  onOpenBusBuddy,
  onOpenWeatherRoutes,
  onOpenCrowdPrediction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'bus-buddy',
      label: 'Bus Buddy AI',
      icon: <span className="text-xl">🧠</span>,
      onClick: () => {
        onOpenBusBuddy();
        setIsExpanded(false);
      },
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: '3d-view',
      label: '3D Seat View',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      onClick: () => {
        onOpen3DView();
        setIsExpanded(false);
      },
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'crowd-prediction',
      label: 'Crowd Prediction',
      icon: <span className="text-xl">🔮</span>,
      onClick: () => {
        onOpenCrowdPrediction();
        setIsExpanded(false);
      },
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'weather',
      label: 'Weather Routes',
      icon: <span className="text-xl">🌦️</span>,
      onClick: () => {
        onOpenWeatherRoutes();
        setIsExpanded(false);
      },
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'ai-assistant',
      label: 'BusGuru',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => {
        onOpenAIAssistant();
        setIsExpanded(false);
      },
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      id: 'social',
      label: 'Community',
      icon: <Users className="h-5 w-5" />,
      onClick: () => {
        onOpenSocial();
        setIsExpanded(false);
      },
      gradient: 'from-pink-600 to-rose-600'
    },
    {
      id: 'fare',
      label: 'Fare Calculator',
      icon: <Calculator className="h-5 w-5" />,
      onClick: () => {
        onOpenFareCalculator();
        setIsExpanded(false);
      },
      gradient: 'from-green-600 to-emerald-600'
    }
  ];

  // Calculate position for radial menu (semi-circle arc above main button)
  const getMenuItemPosition = (index: number, total: number) => {
    const radius = 120; // Distance from main button
    const startAngle = 180; // Start from left (180 degrees)
    const endAngle = 360; // End at right (360 degrees)
    const angleRange = endAngle - startAngle;
    const angleStep = angleRange / (total - 1);
    const angle = (startAngle + (index * angleStep)) * (Math.PI / 180);

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Menu Items */}
      <AnimatePresence>
        {isExpanded && menuItems.map((item, index) => {
          const position = getMenuItemPosition(index, menuItems.length);

          return (
            <motion.button
              key={item.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              animate={{
                scale: 1,
                x: position.x,
                y: position.y,
                opacity: 1,
                transition: {
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.05
                }
              }}
              exit={{
                scale: 0,
                x: 0,
                y: 0,
                opacity: 0,
                transition: {
                  duration: 0.2,
                  delay: (menuItems.length - index - 1) * 0.03
                }
              }}
              onClick={item.onClick}
              className={`absolute p-3 bg-gradient-to-r ${item.gradient} hover:scale-110 text-white rounded-full shadow-lg transition-all group`}
              style={{ bottom: 0, right: 0 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
            >
              {item.icon}

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-1 rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {item.label}
                <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-gray-900" />
              </motion.div>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-5 ${
          isExpanded
            ? 'bg-gradient-to-r from-red-600 to-rose-600'
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        } text-white rounded-full shadow-2xl transition-all`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isExpanded ? 135 : 0
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        aria-label={isExpanded ? 'Close menu' : 'Open features menu'}
        title={isExpanded ? 'Close menu' : 'Features'}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop for mobile - close menu when clicking outside */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10 md:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingFeatureMenu;

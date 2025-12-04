/**
 * Floating Feature Menu - tidy speed-dial with stacked actions.
 * Replaces the messy FAB cluster with a single expandable sheet.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Bot,
  Box,
  Calculator,
  CloudSun,
  Menu,
  Sparkles,
  Users,
  X
} from 'lucide-react';

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
  description: string;
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
      description: 'Chat with your co-pilot for quick help.',
      icon: <Bot className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpenBusBuddy();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)'
    },
    {
      id: '3d-view',
      label: '3D Seat View',
      description: 'Peek inside before you board.',
      icon: <Box className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpen3DView();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)'
    },
    {
      id: 'crowd-prediction',
      label: 'Crowd Prediction',
      description: 'Beat rush-hour with smarter timing.',
      icon: <Activity className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpenCrowdPrediction();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #db2777, #7c3aed)'
    },
    {
      id: 'weather',
      label: 'Weather Routes',
      description: 'Rain-ready paths and safer options.',
      icon: <CloudSun className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpenWeatherRoutes();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #0ea5e9, #10b981)'
    },
    {
      id: 'ai-assistant',
      label: 'BusGuru',
      description: 'Ask about routes, delays, or shortcuts.',
      icon: <Sparkles className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpenAIAssistant();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #7c3aed, #2563eb)'
    },
    {
      id: 'social',
      label: 'Community',
      description: 'Share quick updates with riders.',
      icon: <Users className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpenSocial();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)'
    },
    {
      id: 'fare',
      label: 'Fare Calculator',
      description: 'Check your ticket in a tap.',
      icon: <Calculator className="h-5 w-5" strokeWidth={2.4} />,
      onClick: () => {
        onOpenFareCalculator();
        setIsExpanded(false);
      },
      gradient: 'linear-gradient(135deg, #10b981, #16a34a)'
    }
  ];

  return (
    <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="fab-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="fab-panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-50 w-[260px] sm:w-[300px]"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-2xl shadow-blue-500/10 p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Quick actions
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                    Jump into the advanced tools
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200/70 dark:border-gray-700/70 text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  aria-label="Close quick actions"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="group flex items-center gap-3 w-full text-left px-3 py-3 min-h-[78px] rounded-xl border border-gray-200/80 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-blue-300"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-black/10 ring-1 ring-black/10"
                      style={{ backgroundImage: item.gradient }}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.label}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-tight line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsExpanded(prev => !prev)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`relative z-50 flex items-center gap-3 px-4 py-3 md:px-5 rounded-full text-white shadow-2xl border border-white/20 transition-all ${
          isExpanded
            ? 'bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/30'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/30'
        }`}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Close feature menu' : 'Open feature menu'}
        title={isExpanded ? 'Close menu' : 'Features'}
      >
        <motion.span
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-semibold hidden md:inline"
        >
          {isExpanded ? 'Close' : 'Quick actions'}
        </motion.span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </div>
      </motion.button>
    </div>
  );
};

export default FloatingFeatureMenu;

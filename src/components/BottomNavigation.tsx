import React from 'react';
import { MapPin, Clock, Route, Users, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tracking', icon: MapPin, label: 'Track' },
    { id: 'schedule', icon: Clock, label: 'Schedule' },
    { id: 'routes', icon: Route, label: 'Routes' },
    { id: 'crowd', icon: Users, label: 'Crowd' },
  ];

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden z-50 safe-bottom"
      style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      <div className="dark:bg-gray-900/90" style={{ backdropFilter: 'inherit' }}>
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || 
                           (item.id === 'tracking' && ['map', 'schedule', 'routes', 'crowd'].includes(activeSection));
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className="relative flex flex-col items-center justify-center w-full h-full py-2 group"
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                
                {/* Icon with animation */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                >
                  <Icon 
                    className={`h-5 w-5 transition-colors ${
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}
                  />
                </motion.div>
                
                {/* Label */}
                <span 
                  className={`text-xs mt-1 transition-all ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Ripple effect on tap */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-blue-100 dark:bg-blue-900/20 -z-10"
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;

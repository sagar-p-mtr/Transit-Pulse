import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const renderIcon = () => {
    if (theme === 'light') return <Sun className="h-5 w-5 text-yellow-500" />;
    if (theme === 'dark') return <Moon className="h-5 w-5 text-orange-500" />;
    return <Laptop className="h-5 w-5 text-green-500" />;
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch theme`}
      title="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;

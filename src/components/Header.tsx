import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bus, Menu, X, Bell, Settings, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onShowNotifications: () => void;
  onShowPreferences: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeSection,
  onSectionChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onShowNotifications,
  onShowPreferences
}) => {
  const { t } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'tracking', label: t('nav.liveTracking') },
    { id: 'features', label: t('nav.features') },
    { id: 'services', label: t('nav.services') },
    { id: 'coverage', label: t('nav.coverage') },
    { id: 'contact', label: t('nav.contact') }
  ];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  const renderThemeIcon = () => {
    if (theme === 'light') return <Sun size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    return <Laptop size={20} />;
  };

  return (
    <header className="bg-blue-600 text-white shadow-md relative z-50 transition-colors duration-300 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bus className="h-8 w-8" />
          <h1 className="text-2xl font-bold">{t('common.appName')}</h1>
        </div>
        
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? t('common.close') : t('common.menu')}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`px-3 py-2 rounded-md transition ${
                activeSection === item.id ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={cycleTheme}
            className="p-2 rounded-full hover:bg-blue-500 transition"
            aria-label={t('common.toggleTheme')}
            title={t('common.toggleTheme')}
          >
            {renderThemeIcon()}
          </button>
          
          {/* Quick Access Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onShowNotifications}
              className="p-2 rounded-full hover:bg-blue-500 transition relative"
              aria-label={t('common.notifications')}
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={onShowPreferences}
              className="p-2 rounded-full hover:bg-blue-500 transition"
              aria-label={t('common.settings')}
            >
              <Settings size={20} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-500 absolute top-full left-0 right-0 z-40">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center px-3 py-2 rounded-md transition text-left ${
                  activeSection === item.id ? 'bg-blue-700' : 'hover:bg-blue-600'
                }`}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
            
            {user ? (
              <div className="border-t border-blue-400 pt-2 mt-2">
                <button
                  onClick={() => {
                    onShowNotifications();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-600 transition w-full text-left"
                  aria-label={t('common.notifications')}
                >
                  <Bell size={18} />
                  <span>{t('common.notifications')}</span>
                  <span className="bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                    3
                  </span>
                </button>
                <button
                  onClick={() => {
                    onShowPreferences();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-600 transition w-full text-left"
                  aria-label={t('common.settings')}
                >
                  <Settings size={18} />
                  <span>{t('common.settings')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onSectionChange('login');
                  setIsMobileMenuOpen(false);
                }}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md transition text-left"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

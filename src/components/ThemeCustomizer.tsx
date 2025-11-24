import React from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Sun, Moon, Laptop, X } from 'lucide-react';
import { useTheme, AccentColor } from '../contexts/ThemeContext';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const accentColors: { value: AccentColor; label: string; class: string }[] = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('theme.customize')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('theme.appearance')}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Sun size={24} className="mb-2" />
              <span className="text-sm font-medium">{t('theme.light')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Moon size={24} className="mb-2" />
              <span className="text-sm font-medium">{t('theme.dark')}</span>
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition ${
                theme === 'auto'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Laptop size={24} className="mb-2" />
              <span className="text-sm font-medium">{t('theme.auto')}</span>
            </button>
          </div>
        </div>

        {/* Accent Color Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('theme.accentColor')}
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={`w-12 h-12 rounded-full border-4 transition ${
                  accentColor === color.value
                    ? 'border-gray-400 dark:border-gray-500 scale-110'
                    : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                } ${color.class}`}
                aria-label={`${t('theme.selectColor')} ${color.label}`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="border-t dark:border-gray-600 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('theme.preview')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('theme.primaryButton')}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('theme.successState')}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('theme.errorState')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;

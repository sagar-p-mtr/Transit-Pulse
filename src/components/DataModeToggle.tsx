import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { DataMode, getStoredDataMode, setStoredDataMode } from '../config/runtime';

interface DataModeToggleProps {
  className?: string;
}

const DataModeToggle: React.FC<DataModeToggleProps> = ({ className = '' }) => {
  const [mode, setMode] = useState<DataMode>('mock');

  useEffect(() => {
    const stored = getStoredDataMode();
    if (stored) {
      setMode(stored);
    }
  }, []);

  const handleChange = (next: DataMode) => {
    setMode(next);
    setStoredDataMode(next);
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 text-sm ${className}`}
      title="Switch between live backend data and mock/demo data"
    >
      <Radio className="w-4 h-4 text-blue-600" />
      <button
        onClick={() => handleChange('live')}
        className={`px-2 py-1 rounded text-xs font-semibold transition ${
          mode === 'live'
            ? 'bg-green-600 text-white shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Live
      </button>
      <button
        onClick={() => handleChange('mock')}
        className={`px-2 py-1 rounded text-xs font-semibold transition ${
          mode === 'mock'
            ? 'bg-blue-600 text-white shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Mock
      </button>
    </div>
  );
};

export default DataModeToggle;

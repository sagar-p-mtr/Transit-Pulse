import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { firebaseMigration } from '../utils/firebaseMigration';

interface FirebaseQuickFixProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FirebaseQuickFix({ onClose, onSuccess }: FirebaseQuickFixProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState('Ready to populate Firebase database');

  const runQuickFix = async () => {
    setIsFixing(true);
    setStatus('running');

    try {
      setCurrentStep('🚌 Adding bus routes...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('🏢 Adding bus stops...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('🚍 Adding live buses...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('📊 Running full migration...');
      await firebaseMigration.runMigration();
      
      setCurrentStep('🎉 Database populated successfully!');
      setStatus('success');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Quick fix failed:', error);
      setStatus('error');
      setCurrentStep('❌ Failed to populate database');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Firebase Quick Fix
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Populate your database with sample data
              </p>
            </div>
          </div>
          {!isFixing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            {status === 'running' && <Loader className="h-5 w-5 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            
            <span className={`font-medium ${
              status === 'success' ? 'text-green-600 dark:text-green-400' :
              status === 'error' ? 'text-red-600 dark:text-red-400' :
              'text-gray-900 dark:text-white'
            }`}>
              {currentStep}
            </span>
          </div>

          {isFixing && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          )}
        </div>

        {/* What this will do */}
        {status === 'idle' && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              This will add sample data:
            </h3>
            <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
              <li>• 5+ BMTC bus routes (201E, 500DA, 356, etc.)</li>
              <li>• 10+ bus stops with locations</li>
              <li>• 4+ live buses with tracking data</li>
              <li>• Real Bangalore coordinates</li>
            </ul>
          </div>
        )}

        {/* Success message */}
        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200 text-center">
              🎉 Your Firebase database is now populated with sample BMTC data!
              <br />
              <span className="text-sm">Closing in 2 seconds...</span>
            </p>
          </div>
        )}

        {/* Action Button */}
        {status === 'idle' && (
          <motion.button
            onClick={runQuickFix}
            disabled={isFixing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Database className="h-5 w-5" />
            <span>Populate Firebase Database</span>
          </motion.button>
        )}

        {status === 'error' && (
          <div className="flex space-x-3">
            <motion.button
              onClick={runQuickFix}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Close
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

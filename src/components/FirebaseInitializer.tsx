import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { firebaseMigration } from '../utils/firebaseMigration';
import { useAuth } from '../hooks/useFirebase';

interface FirebaseInitializerProps {
  onInitialized: () => void;
}

export default function FirebaseInitializer({ onInitialized }: FirebaseInitializerProps) {
  const [initStatus, setInitStatus] = useState<'checking' | 'migrating' | 'success' | 'error'>('checking');
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    initializeFirebase();
  }, []);

  const initializeFirebase = async () => {
    try {
      setInitStatus('checking');
      setCurrentStep('Connecting to Firebase...');
      setProgress(20);

      // Wait a bit for Firebase to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if data already exists
      setCurrentStep('Checking existing data...');
      setProgress(40);

      const routesExist = await firebaseMigration.checkCollectionExists('routes');
      const stopsExist = await firebaseMigration.checkCollectionExists('stops');
      const busesExist = await firebaseMigration.checkCollectionExists('buses');

      if (!routesExist || !stopsExist || !busesExist) {
        setInitStatus('migrating');
        setCurrentStep('Migrating data to Firebase...');
        setProgress(60);

        await firebaseMigration.runMigration();
        
        setCurrentStep('Migration completed successfully!');
        setProgress(90);
      } else {
        setCurrentStep('Data already exists, skipping migration...');
        setProgress(90);
      }

      setCurrentStep('Firebase initialized successfully!');
      setProgress(100);
      setInitStatus('success');

      // Wait a bit before calling onInitialized
      setTimeout(() => {
        onInitialized();
      }, 1500);

    } catch (error) {
      console.error('Firebase initialization failed:', error);
      setInitStatus('error');
      setCurrentStep(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const retryInitialization = () => {
    setInitStatus('checking');
    setProgress(0);
    initializeFirebase();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center">
          {/* Firebase Logo */}
          <motion.div
            animate={{ 
              rotate: initStatus === 'checking' || initStatus === 'migrating' ? 360 : 0 
            }}
            transition={{ 
              duration: 2, 
              repeat: initStatus === 'checking' || initStatus === 'migrating' ? Infinity : 0,
              ease: "linear" 
            }}
            className="mx-auto w-16 h-16 mb-6"
          >
            {initStatus === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : initStatus === 'error' ? (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            ) : (
              <Database className="w-16 h-16 text-blue-500 mx-auto" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {initStatus === 'checking' && 'Initializing Firebase'}
            {initStatus === 'migrating' && 'Setting up Database'}
            {initStatus === 'success' && 'Ready to Go!'}
            {initStatus === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {currentStep}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Status Icons */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              {progress >= 40 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Loader className="w-5 h-5 text-gray-400 animate-spin" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-300">Connect</span>
            </div>
            <div className="flex items-center space-x-2">
              {progress >= 60 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : progress >= 40 ? (
                <Loader className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-300">Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              {progress >= 100 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : progress >= 90 ? (
                <Loader className="w-5 h-5 text-green-500 animate-spin" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-300">Launch</span>
            </div>
          </div>

          {/* Action Buttons */}
          {initStatus === 'error' && (
            <motion.button
              onClick={retryInitialization}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Retry Connection
            </motion.button>
          )}
          
          {initStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <p className="text-green-600 dark:text-green-400 font-medium">
                🎉 Firebase is ready! Your app is now powered by real-time data.
              </p>
              {user && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, {user.displayName}!
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Firebase Branding */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Powered by</span>
            <span className="font-semibold text-orange-500">Firebase</span>
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

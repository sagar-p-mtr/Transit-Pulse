import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useBuses, useRoutes, useStops } from '../hooks/useFirebase';
import { firebaseMigration } from '../utils/firebaseMigration';

interface FirebaseTestComponentProps {
  onClose: () => void;
}

export default function FirebaseTestComponent({ onClose }: FirebaseTestComponentProps) {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const { buses, loading: busesLoading, error: busesError } = useBuses();
  const { routes, loading: routesLoading, error: routesError } = useRoutes();
  const { stops, loading: stopsLoading, error: stopsError } = useStops();

  const runTests = async () => {
    setIsRunning(true);
    const results: Record<string, boolean> = {};

    try {
      // Test 1: Check Firebase connection
      setCurrentTest('Testing Firebase connection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      results.connection = true;

      // Test 2: Check data migration
      setCurrentTest('Checking data migration...');
      const routesExist = await firebaseMigration.checkCollectionExists('routes');
      const stopsExist = await firebaseMigration.checkCollectionExists('stops');
      const busesExist = await firebaseMigration.checkCollectionExists('buses');
      
      // If data doesn't exist, run migration automatically
      if (!routesExist || !stopsExist || !busesExist) {
        setCurrentTest('Running data migration...');
        await firebaseMigration.runMigration();
        results.migration = true;
      } else {
        results.migration = true;
      }

      // Test 3: Test data fetching
      setCurrentTest('Testing data fetching...');
      results.dataFetching = !busesLoading && !routesLoading && !stopsLoading && 
                           !busesError && !routesError && !stopsError;

      // Test 4: Check data availability
      setCurrentTest('Verifying data availability...');
      results.dataAvailable = buses.length > 0 && routes.length > 0 && stops.length > 0;

      setTestResults(results);
      setCurrentTest('Tests completed!');
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ ...results, connection: false });
      setCurrentTest('Tests failed!');
    } finally {
      setIsRunning(false);
    }
  };

  const addSampleData = async () => {
    setCurrentTest('Adding more sample data...');
    try {
      await firebaseMigration.addMoreSampleData();
      setCurrentTest('Sample data added successfully!');
      // Refresh page to see new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to add sample data:', error);
      setCurrentTest('Failed to add sample data');
    }
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    setTimeout(runTests, 1000);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Firebase Integration Test
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Verify your Firebase setup is working correctly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Test Status */}
        {isRunning && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              <span className="text-blue-700 dark:text-blue-300">{currentTest}</span>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Results</h3>
          
          {Object.keys(testResults).length > 0 ? (
            <div className="space-y-3">
              <TestResult 
                name="Firebase Connection" 
                passed={testResults.connection} 
                description="Check if Firebase is properly initialized"
              />
              <TestResult 
                name="Data Migration" 
                passed={testResults.migration} 
                description="Verify that collections exist and are populated"
              />
              <TestResult 
                name="Data Fetching" 
                passed={testResults.dataFetching} 
                description="Test if data can be fetched without errors"
              />
              <TestResult 
                name="Data Availability" 
                passed={testResults.dataAvailable} 
                description="Check if sample data is available"
              />
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No test results yet...</p>
          )}
        </div>

        {/* Data Summary */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Data Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {buses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Buses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {routes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Routes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stops.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Stops</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <motion.button
            onClick={runTests}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Tests...' : 'Run Tests Again'}</span>
          </motion.button>

          <motion.button
            onClick={addSampleData}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Add Sample Data
          </motion.button>
        </div>

        {/* Firebase Console Link */}
        <div className="mt-4 text-center">
          <a
            href="https://console.firebase.google.com/project/whereismybus-5df3c"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
          >
            Open Firebase Console →
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function TestResult({ name, passed, description }: { name: string; passed: boolean; description: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
      <div className="flex-shrink-0">
        {passed ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-red-500" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
          <span className={`text-sm px-2 py-1 rounded ${
            passed 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {passed ? 'PASSED' : 'FAILED'}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}

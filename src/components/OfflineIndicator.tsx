import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Database, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineData } from '../hooks/useOfflineData';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showSyncButton?: boolean;
  showStorageInfo?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showSyncButton = true,
  showStorageInfo = false
}) => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncProgress,
    syncData,
    storageInfo
  } = useOfflineData();

  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setMessage('You are offline. Data may not be up-to-date.');
    } else if (showBanner && isOnline) {
      setMessage('Back online! Syncing data...');
      setTimeout(() => {
        if (!isSyncing) {
          setShowBanner(false);
        }
      }, 3000);
    }
  }, [isOnline, isSyncing, showBanner]);

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSyncTime = (): string => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getPositionClasses = () => {
    return position === 'top' 
      ? 'top-0 border-b' 
      : 'bottom-0 border-t';
  };

  const getBannerColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (isSyncing) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <>
      {/* Main offline banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: position === 'top' ? -100 : 100 }}
            animate={{ y: 0 }}
            exit={{ y: position === 'top' ? -100 : 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed left-0 right-0 ${getPositionClasses()} ${getBannerColor()} text-white z-50 shadow-lg`}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!isOnline ? (
                    <WifiOff className="h-5 w-5" />
                  ) : isSyncing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{message}</span>
                  {isSyncing && syncProgress > 0 && (
                    <span className="text-sm opacity-90">({syncProgress}%)</span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {showStorageInfo && (
                    <div className="hidden md:flex items-center space-x-2 text-sm">
                      <Database className="h-4 w-4" />
                      <span>
                        {formatStorageSize(storageInfo.usage)} / {formatStorageSize(storageInfo.quota)}
                      </span>
                    </div>
                  )}

                  {showSyncButton && isOnline && !isSyncing && (
                    <button
                      onClick={syncData}
                      className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Sync Now</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowBanner(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sync progress bar */}
              {isSyncing && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${syncProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="bg-white h-1.5 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating sync status indicator */}
      {!showBanner && (
        <div className="fixed bottom-4 left-4 z-40">
          <AnimatePresence>
            {isSyncing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Syncing...</span>
                {syncProgress > 0 && (
                  <span className="text-xs opacity-90">({syncProgress}%)</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Offline mode info tooltip */}
      {!isOnline && (
        <div className="fixed bottom-20 right-4 z-40 max-w-xs">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="bg-gray-800 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Offline Mode Active</p>
                <p className="text-xs opacity-90">
                  You can still browse cached routes and schedules. 
                  Last synced: {formatLastSyncTime()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Compact offline badge for headers
export const OfflineBadge: React.FC = () => {
  const { isOnline, isSyncing } = useOfflineData();

  if (isOnline && !isSyncing) return null;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      !isOnline ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Syncing
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;

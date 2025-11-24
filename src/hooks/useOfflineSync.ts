import { useEffect, useState, useCallback } from 'react';
import { offlineStorage } from '../services/offlineStorage';

export interface UseOfflineDataReturn {
  isOnline: boolean;
  isDataStale: boolean;
  saveData: (key: string, data: any) => Promise<void>;
  getData: (key: string) => Promise<any>;
  clearData: (key?: string) => Promise<void>;
  syncData: () => Promise<void>;
}

export function useOfflineData(): UseOfflineDataReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataStale, setIsDataStale] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsDataStale(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if cached data is stale (older than 5 minutes)
    const checkDataFreshness = async () => {
      const lastSync = await offlineStorage.getData('lastSyncTime');
      if (lastSync) {
        const timeDiff = Date.now() - lastSync;
        setIsDataStale(timeDiff > 5 * 60 * 1000); // 5 minutes
      }
    };

    checkDataFreshness();
    const interval = setInterval(checkDataFreshness, 60000); // Check every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const saveData = useCallback(async (key: string, data: any) => {
    await offlineStorage.saveData(key, data);
  }, []);

  const getData = useCallback(async (key: string) => {
    return await offlineStorage.getData(key);
  }, []);

  const clearData = useCallback(async (key?: string) => {
    if (key) {
      await offlineStorage.clearData(key);
    } else {
      await offlineStorage.clearAll();
    }
  }, []);

  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Get all pending data
      const pendingData = await offlineStorage.getData('pendingSync');
      
      if (pendingData && Array.isArray(pendingData)) {
        // Sync each pending item
        for (const item of pendingData) {
          // Here you would call your API to sync the data
          console.log('Syncing item:', item);
        }
        
        // Clear pending data after successful sync
        await offlineStorage.clearData('pendingSync');
      }

      // Update last sync time
      await offlineStorage.saveData('lastSyncTime', Date.now());
      setIsDataStale(false);
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  return {
    isOnline,
    isDataStale,
    saveData,
    getData,
    clearData,
    syncData
  };
}

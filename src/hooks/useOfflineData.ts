import { useEffect, useState, useCallback, useRef } from 'react';
import { getOfflineStorage } from '../services/offlineStorage';
import { busApi } from '../services/api';

export interface UseOfflineDataOptions {
  enableAutoSync?: boolean;
  syncInterval?: number; // in milliseconds
  onSyncStart?: () => void;
  onSyncComplete?: (success: boolean) => void;
  onSyncError?: (error: Error) => void;
}

export interface UseOfflineDataReturn {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncProgress: number;
  syncData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  storageInfo: { usage: number; quota: number };
}

export const useOfflineData = (options: UseOfflineDataOptions = {}): UseOfflineDataReturn => {
  const {
    enableAutoSync = true,
    syncInterval = 5 * 60 * 1000, // 5 minutes default
    onSyncStart,
    onSyncComplete,
    onSyncError
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0 });

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offlineStorageRef = useRef<any>(null);

  // Initialize offline storage
  useEffect(() => {
    const initStorage = async () => {
      offlineStorageRef.current = await getOfflineStorage();
      updateStorageInfo();
    };
    initStorage();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (enableAutoSync) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableAutoSync]);

  // Auto-sync interval
  useEffect(() => {
    if (enableAutoSync && isOnline && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncData();
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [enableAutoSync, isOnline, syncInterval]);

  // Update storage info
  const updateStorageInfo = useCallback(async () => {
    if (offlineStorageRef.current) {
      const info = await offlineStorageRef.current.getStorageEstimate();
      setStorageInfo(info);
    }
  }, []);

  // Sync data function
  const syncData = useCallback(async () => {
    if (isSyncing || !offlineStorageRef.current) return;

    setIsSyncing(true);
    setSyncProgress(0);
    onSyncStart?.();

    try {
      const storage = offlineStorageRef.current;
      
      // Sync routes
      setSyncProgress(10);
      if (isOnline) {
        const routes = await busApi.getAllRoutes();
        if (routes && routes.length > 0) {
          await storage.saveRoutes(routes);
        }
      }

      // Sync buses
      setSyncProgress(40);
      if (isOnline) {
        const buses = await busApi.getAllBuses();
        if (buses && buses.length > 0) {
          await storage.saveBuses(buses);
        }
      }

      // Get favorite routes and sync their data
      setSyncProgress(70);
      const favoriteRoutes = await storage.getFavorites('route');
      if (isOnline && favoriteRoutes.length > 0) {
        for (const route of favoriteRoutes) {
          try {
            const buses = await busApi.getBusesByRoute(route.id);
            if (buses && buses.length > 0) {
              await storage.saveBuses(buses);
            }
          } catch (error) {
            console.error(`Error syncing buses for route ${route.id}:`, error);
          }
        }
      }

      setSyncProgress(100);
      setLastSyncTime(new Date());
      await updateStorageInfo();
      onSyncComplete?.(true);
    } catch (error) {
      console.error('Sync error:', error);
      onSyncError?.(error as Error);
      onSyncComplete?.(false);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [isSyncing, isOnline, onSyncStart, onSyncComplete, onSyncError]);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    if (offlineStorageRef.current) {
      await offlineStorageRef.current.clearAll();
      await updateStorageInfo();
      setLastSyncTime(null);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncProgress,
    syncData,
    clearOfflineData,
    storageInfo
  };
};

// Hook for managing offline routes
export const useOfflineRoutes = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      setLoading(true);
      try {
        const storage = await getOfflineStorage();
        
        // Try to get from offline storage first
        let offlineRoutes = await storage.getAllRoutes();
        
        // If online and no offline data, fetch from API
        if (navigator.onLine && offlineRoutes.length === 0) {
          const apiRoutes = await busApi.getAllRoutes();
          if (apiRoutes && apiRoutes.length > 0) {
            await storage.saveRoutes(apiRoutes);
            offlineRoutes = apiRoutes;
          }
        }
        
        setRoutes(offlineRoutes);
      } catch (error) {
        console.error('Error loading offline routes:', error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const refreshRoutes = useCallback(async () => {
    if (!navigator.onLine) return;

    setLoading(true);
    try {
      const storage = await getOfflineStorage();
      const apiRoutes = await busApi.getAllRoutes();
      
      if (apiRoutes && apiRoutes.length > 0) {
        await storage.saveRoutes(apiRoutes);
        setRoutes(apiRoutes);
      }
    } catch (error) {
      console.error('Error refreshing routes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { routes, loading, refreshRoutes };
};

// Hook for managing search history
export const useSearchHistory = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const storageRef = useRef<any>(null);

  useEffect(() => {
    const initStorage = async () => {
      storageRef.current = await getOfflineStorage();
      loadRecentSearches();
    };
    initStorage();
  }, []);

  const loadRecentSearches = useCallback(async () => {
    if (storageRef.current) {
      const searches = await storageRef.current.getRecentSearches(10);
      setRecentSearches(searches);
    }
  }, []);

  const addSearch = useCallback(async (query: string, resultCount: number = 0) => {
    if (storageRef.current && query.trim()) {
      await storageRef.current.saveSearchQuery(query, resultCount);
      await loadRecentSearches();
    }
  }, [loadRecentSearches]);

  const clearHistory = useCallback(async () => {
    if (storageRef.current) {
      // Clear search history from storage
      const storage = await getOfflineStorage();
      const db = await storage['ensureDB']();
      await db.clear('searchHistory');
      setRecentSearches([]);
    }
  }, []);

  return { recentSearches, addSearch, clearHistory };
};

// Hook for managing favorites
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const storageRef = useRef<any>(null);

  useEffect(() => {
    const initStorage = async () => {
      storageRef.current = await getOfflineStorage();
      loadFavorites();
    };
    initStorage();
  }, []);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (storageRef.current) {
        const allFavorites = await storageRef.current.getFavorites();
        setFavorites(allFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (type: 'route' | 'stop' | 'bus', data: any) => {
    if (storageRef.current) {
      await storageRef.current.addFavorite(type, data);
      await loadFavorites();
    }
  }, [loadFavorites]);

  const removeFavorite = useCallback(async (type: 'route' | 'stop' | 'bus', dataId: string) => {
    if (storageRef.current) {
      await storageRef.current.removeFavorite(type, dataId);
      await loadFavorites();
    }
  }, [loadFavorites]);

  const isFavorite = useCallback(async (type: 'route' | 'stop' | 'bus', dataId: string): Promise<boolean> => {
    if (storageRef.current) {
      return await storageRef.current.isFavorite(type, dataId);
    }
    return false;
  }, []);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite
  };
};

export default useOfflineData;

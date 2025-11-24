import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BusTrackingDB extends DBSchema {
  routes: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
      provider: string;
    };
  };
  buses: {
    key: string;
    value: {
      id: string;
      routeId: string;
      data: any;
      timestamp: number;
    };
  };
  stops: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
  searchHistory: {
    key: string;
    value: {
      id: string;
      query: string;
      timestamp: number;
      resultCount: number;
    };
  };
  favorites: {
    key: string;
    value: {
      id: string;
      type: 'route' | 'stop' | 'bus';
      data: any;
      timestamp: number;
    };
  };
  userPreferences: {
    key: string;
    value: {
      key: string;
      value: any;
      timestamp: number;
    };
  };
}

class OfflineStorageService {
  private db: IDBPDatabase<BusTrackingDB> | null = null;
  private dbName = 'BusTrackingOfflineDB';
  private dbVersion = 1;
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours default max age

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<BusTrackingDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('routes')) {
            db.createObjectStore('routes', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('buses')) {
            db.createObjectStore('buses', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('stops')) {
            db.createObjectStore('stops', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('searchHistory')) {
            db.createObjectStore('searchHistory', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('favorites')) {
            db.createObjectStore('favorites', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('userPreferences')) {
            db.createObjectStore('userPreferences', { keyPath: 'key' });
          }
        },
      });
      console.log('Offline storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      // Fallback to localStorage if IndexedDB fails
      this.db = null;
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<BusTrackingDB>> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  // Routes
  async saveRoute(route: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('routes', {
        id: route.id,
        data: route,
        timestamp: Date.now(),
        provider: route.provider || 'unknown'
      });
    } catch (error) {
      console.error('Error saving route:', error);
      this.fallbackToLocalStorage('route_' + route.id, route);
    }
  }

  async saveRoutes(routes: any[]): Promise<void> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction('routes', 'readwrite');
      
      await Promise.all(routes.map(route => 
        tx.store.put({
          id: route.id,
          data: route,
          timestamp: Date.now(),
          provider: route.provider || 'unknown'
        })
      ));
      
      await tx.done;
    } catch (error) {
      console.error('Error saving routes:', error);
      routes.forEach(route => this.fallbackToLocalStorage('route_' + route.id, route));
    }
  }

  async getRoute(routeId: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      const route = await db.get('routes', routeId);
      
      if (route && this.isDataFresh(route.timestamp)) {
        return route.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting route:', error);
      return this.fallbackFromLocalStorage('route_' + routeId);
    }
  }

  async getAllRoutes(): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      const routes = await db.getAll('routes');
      
      return routes
        .filter(route => this.isDataFresh(route.timestamp))
        .map(route => route.data);
    } catch (error) {
      console.error('Error getting all routes:', error);
      return this.getAllFromLocalStorage('route_');
    }
  }

  // Buses
  async saveBus(bus: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('buses', {
        id: bus.id,
        routeId: bus.routeId,
        data: bus,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error saving bus:', error);
      this.fallbackToLocalStorage('bus_' + bus.id, bus);
    }
  }

  async saveBuses(buses: any[]): Promise<void> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction('buses', 'readwrite');
      
      await Promise.all(buses.map(bus => 
        tx.store.put({
          id: bus.id,
          routeId: bus.routeId,
          data: bus,
          timestamp: Date.now()
        })
      ));
      
      await tx.done;
    } catch (error) {
      console.error('Error saving buses:', error);
      buses.forEach(bus => this.fallbackToLocalStorage('bus_' + bus.id, bus));
    }
  }

  async getBusesByRoute(routeId: string): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      const buses = await db.getAll('buses');
      
      return buses
        .filter(bus => bus.routeId === routeId && this.isDataFresh(bus.timestamp, 5 * 60 * 1000)) // 5 minutes for bus data
        .map(bus => bus.data);
    } catch (error) {
      console.error('Error getting buses by route:', error);
      return [];
    }
  }

  // Stops
  async saveStop(stop: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('stops', {
        id: stop.id,
        data: stop,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error saving stop:', error);
      this.fallbackToLocalStorage('stop_' + stop.id, stop);
    }
  }

  async getStop(stopId: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      const stop = await db.get('stops', stopId);
      
      if (stop && this.isDataFresh(stop.timestamp)) {
        return stop.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting stop:', error);
      return this.fallbackFromLocalStorage('stop_' + stopId);
    }
  }

  // Search History
  async saveSearchQuery(query: string, resultCount: number = 0): Promise<void> {
    try {
      const db = await this.ensureDB();
      const id = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.put('searchHistory', {
        id,
        query,
        timestamp: Date.now(),
        resultCount
      });
      
      // Clean up old search history (keep last 50)
      await this.cleanupSearchHistory();
    } catch (error) {
      console.error('Error saving search query:', error);
      this.fallbackToLocalStorage('search_recent', { query, timestamp: Date.now() });
    }
  }

  async getRecentSearches(limit: number = 10): Promise<string[]> {
    try {
      const db = await this.ensureDB();
      const searches = await db.getAll('searchHistory');
      
      return searches
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .map(search => search.query);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  private async cleanupSearchHistory(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const searches = await db.getAll('searchHistory');
      
      if (searches.length > 50) {
        const sorted = searches.sort((a, b) => b.timestamp - a.timestamp);
        const toDelete = sorted.slice(50);
        
        const tx = db.transaction('searchHistory', 'readwrite');
        await Promise.all(toDelete.map(search => tx.store.delete(search.id)));
        await tx.done;
      }
    } catch (error) {
      console.error('Error cleaning up search history:', error);
    }
  }

  // Favorites
  async addFavorite(type: 'route' | 'stop' | 'bus', data: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      const id = `${type}_${data.id}`;
      
      await db.put('favorites', {
        id,
        type,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      const fallbackId = `${type}_${data.id}`;
      this.fallbackToLocalStorage('favorite_' + fallbackId, { type, data });
    }
  }

  async removeFavorite(type: 'route' | 'stop' | 'bus', dataId: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const id = `${type}_${dataId}`;
      await db.delete('favorites', id);
    } catch (error) {
      console.error('Error removing favorite:', error);
      localStorage.removeItem('favorite_' + type + '_' + dataId);
    }
  }

  async getFavorites(type?: 'route' | 'stop' | 'bus'): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      const favorites = await db.getAll('favorites');
      
      if (type) {
        return favorites
          .filter(fav => fav.type === type)
          .map(fav => fav.data);
      }
      
      return favorites.map(fav => ({ type: fav.type, data: fav.data }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      return this.getAllFromLocalStorage('favorite_');
    }
  }

  async isFavorite(type: 'route' | 'stop' | 'bus', dataId: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const id = `${type}_${dataId}`;
      const favorite = await db.get('favorites', id);
      return !!favorite;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return !!localStorage.getItem('favorite_' + type + '_' + dataId);
    }
  }

  // User Preferences
  async savePreference(key: string, value: any): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put('userPreferences', {
        key,
        value,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error saving preference:', error);
      this.fallbackToLocalStorage('pref_' + key, value);
    }
  }

  async getPreference(key: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      const pref = await db.get('userPreferences', key);
      return pref ? pref.value : null;
    } catch (error) {
      console.error('Error getting preference:', error);
      return this.fallbackFromLocalStorage('pref_' + key);
    }
  }

  async getAllPreferences(): Promise<Record<string, any>> {
    try {
      const db = await this.ensureDB();
      const prefs = await db.getAll('userPreferences');
      
      const result: Record<string, any> = {};
      prefs.forEach(pref => {
        result[pref.key] = pref.value;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting all preferences:', error);
      return {};
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      const db = await this.ensureDB();
      await Promise.all([
        db.clear('routes'),
        db.clear('buses'),
        db.clear('stops'),
        db.clear('searchHistory'),
        db.clear('favorites'),
        db.clear('userPreferences')
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      // Clear localStorage fallback
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('route_') || key.startsWith('bus_') || 
            key.startsWith('stop_') || key.startsWith('search_') || 
            key.startsWith('favorite_') || key.startsWith('pref_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Utility methods
  private isDataFresh(timestamp: number, customMaxAge?: number): boolean {
    const age = Date.now() - timestamp;
    return age < (customMaxAge || this.maxAge);
  }

  private fallbackToLocalStorage(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify({
        data: value,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('LocalStorage fallback failed:', error);
    }
  }

  private fallbackFromLocalStorage(key: string): any | null {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (this.isDataFresh(parsed.timestamp)) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('LocalStorage fallback read failed:', error);
    }
    return null;
  }

  private getAllFromLocalStorage(prefix: string): any[] {
    const results: any[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        const data = this.fallbackFromLocalStorage(key);
        if (data) {
          results.push(data);
        }
      }
    });
    
    return results;
  }

  // Get storage size estimate
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }
}

// Create singleton instance
let offlineStorageInstance: OfflineStorageService | null = null;

export const getOfflineStorage = async (): Promise<OfflineStorageService> => {
  if (!offlineStorageInstance) {
    offlineStorageInstance = new OfflineStorageService();
    await offlineStorageInstance.initialize();
  }
  return offlineStorageInstance;
};

// Create a wrapper class for easier access
class OfflineStorageWrapper {
  private storagePromise: Promise<OfflineStorageService>;

  constructor() {
    this.storagePromise = getOfflineStorage();
  }

  async getData(key: string): Promise<any> {
    const storage = await this.storagePromise;
    return storage.getPreference(key);
  }

  async saveData(key: string, data: any): Promise<void> {
    const storage = await this.storagePromise;
    return storage.savePreference(key, data);
  }

  async getRoute(routeId: string): Promise<any> {
    const storage = await this.storagePromise;
    return storage.getRoute(routeId);
  }

  async saveRoutes(routes: any[]): Promise<void> {
    const storage = await this.storagePromise;
    return storage.saveRoutes(routes);
  }

  async saveBuses(buses: any[]): Promise<void> {
    const storage = await this.storagePromise;
    return storage.saveBuses(buses);
  }

  async getFavorites(type?: 'route' | 'stop' | 'bus'): Promise<any[]> {
    const storage = await this.storagePromise;
    return storage.getFavorites(type);
  }
}

// Export singleton wrapper instance
export const offlineStorage = new OfflineStorageWrapper();

export default OfflineStorageService;

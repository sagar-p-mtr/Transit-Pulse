import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Bus {
  id: string;
  route_number: string;
  route_name: string;
  current_stop: string;
  next_stop: string;
  location: {
    latitude: number;
    longitude: number;
  };
  occupancy_level: 'Low' | 'Medium' | 'High' | 'Full';
  delay_minutes: number;
  is_active: boolean;
  last_updated: Timestamp;
}

export interface BusRoute {
  id: string;
  route_number: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_stops: number;
  estimated_duration: number;
  fare: number;
  is_active: boolean;
}

export interface BusStop {
  id: string;
  stop_name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  routes: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preferences: {
    language: string;
    notifications: boolean;
    favorite_routes: string[];
  };
  created_at: Timestamp;
}

// Bus related functions
export const busService = {
  // Get all active buses
  async getAllBuses(): Promise<Bus[]> {
    const busesRef = collection(db, 'buses');
    const q = query(busesRef, where('is_active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
  },

  // Get bus by ID
  async getBusById(busId: string): Promise<Bus | null> {
    const busRef = doc(db, 'buses', busId);
    const snapshot = await getDoc(busRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Bus : null;
  },

  // Get buses by route
  async getBusesByRoute(routeNumber: string): Promise<Bus[]> {
    const busesRef = collection(db, 'buses');
    const q = query(busesRef, where('route_number', '==', routeNumber), where('is_active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
  },

  // Update bus location
  async updateBusLocation(busId: string, location: { latitude: number; longitude: number }): Promise<void> {
    const busRef = doc(db, 'buses', busId);
    await updateDoc(busRef, {
      location,
      last_updated: serverTimestamp()
    });
  },

  // Update bus occupancy
  async updateBusOccupancy(busId: string, occupancyLevel: Bus['occupancy_level']): Promise<void> {
    const busRef = doc(db, 'buses', busId);
    await updateDoc(busRef, {
      occupancy_level: occupancyLevel,
      last_updated: serverTimestamp()
    });
  },

  // Subscribe to real-time bus updates
  subscribeToRealTimeBuses(callback: (buses: Bus[]) => void) {
    const busesRef = collection(db, 'buses');
    const q = query(busesRef, where('is_active', '==', true));
    return onSnapshot(q, (snapshot) => {
      const buses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
      callback(buses);
    });
  }
};

// Route related functions
export const routeService = {
  // Get all routes
  async getAllRoutes(): Promise<BusRoute[]> {
    const routesRef = collection(db, 'routes');
    const q = query(routesRef, where('is_active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusRoute));
  },

  // Get route by number
  async getRouteByNumber(routeNumber: string): Promise<BusRoute | null> {
    const routesRef = collection(db, 'routes');
    const q = query(routesRef, where('route_number', '==', routeNumber));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BusRoute;
  },

  // Search routes by start/end location
  async searchRoutes(startLocation: string, endLocation: string): Promise<BusRoute[]> {
    const routesRef = collection(db, 'routes');
    const q = query(
      routesRef, 
      where('start_location', '==', startLocation),
      where('end_location', '==', endLocation),
      where('is_active', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusRoute));
  }
};

// Stop related functions
export const stopService = {
  // Get all stops
  async getAllStops(): Promise<BusStop[]> {
    const stopsRef = collection(db, 'stops');
    const snapshot = await getDocs(stopsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusStop));
  },

  // Get stops by route
  async getStopsByRoute(routeNumber: string): Promise<BusStop[]> {
    const stopsRef = collection(db, 'stops');
    const q = query(stopsRef, where('routes', 'array-contains', routeNumber));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusStop));
  },

  // Search stops by name
  async searchStops(searchTerm: string): Promise<BusStop[]> {
    const stopsRef = collection(db, 'stops');
    // Note: Firestore doesn't support full-text search natively
    // For better search, consider using Algolia or implement client-side filtering
    const snapshot = await getDocs(stopsRef);
    const allStops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusStop));
    
    return allStops.filter(stop => 
      stop.stop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

// User related functions
export const userService = {
  // Create user profile
  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<string> {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, {
      ...userData,
      created_at: serverTimestamp()
    });
    return docRef.id;
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as User : null;
  },

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: User['preferences']): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { preferences });
  },

  // Add favorite route
  async addFavoriteRoute(userId: string, routeNumber: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const user = await this.getUserById(userId);
    if (user && !user.preferences.favorite_routes.includes(routeNumber)) {
      const updatedFavorites = [...user.preferences.favorite_routes, routeNumber];
      await updateDoc(userRef, {
        'preferences.favorite_routes': updatedFavorites
      });
    }
  },

  // Remove favorite route
  async removeFavoriteRoute(userId: string, routeNumber: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const user = await this.getUserById(userId);
    if (user) {
      const updatedFavorites = user.preferences.favorite_routes.filter(route => route !== routeNumber);
      await updateDoc(userRef, {
        'preferences.favorite_routes': updatedFavorites
      });
    }
  }
};

// Analytics and tracking
export const analyticsService = {
  // Track route usage
  async trackRouteUsage(routeNumber: string, userId?: string): Promise<void> {
    const analyticsRef = collection(db, 'route_analytics');
    await addDoc(analyticsRef, {
      route_number: routeNumber,
      user_id: userId || 'anonymous',
      timestamp: serverTimestamp(),
      type: 'route_search'
    });
  },

  // Track bus tracking
  async trackBusTracking(busId: string, userId?: string): Promise<void> {
    const analyticsRef = collection(db, 'bus_analytics');
    await addDoc(analyticsRef, {
      bus_id: busId,
      user_id: userId || 'anonymous',
      timestamp: serverTimestamp(),
      type: 'bus_tracking'
    });
  }
};

export default {
  busService,
  routeService,
  stopService,
  userService,
  analyticsService
};

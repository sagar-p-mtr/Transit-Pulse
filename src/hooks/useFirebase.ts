import { useState, useEffect, useCallback } from 'react';
import { 
  busService, 
  routeService, 
  stopService, 
  userService,
  Bus, 
  BusRoute, 
  BusStop, 
  User 
} from '../services/firebaseService';
import { authService, AuthUser } from '../services/authService';

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const user = await authService.signUp(email, password, name);
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: authService.isAuthenticated()
  };
}

// Buses hook
export function useBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time bus updates
    const unsubscribe = busService.subscribeToRealTimeBuses((updatedBuses) => {
      setBuses(updatedBuses);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getBusByRoute = useCallback(async (routeNumber: string) => {
    try {
      setLoading(true);
      const routeBuses = await busService.getBusesByRoute(routeNumber);
      return routeBuses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch buses');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusLocation = useCallback(async (busId: string, location: { latitude: number; longitude: number }) => {
    try {
      await busService.updateBusLocation(busId, location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bus location');
    }
  }, []);

  return {
    buses,
    loading,
    error,
    getBusByRoute,
    updateBusLocation
  };
}

// Routes hook
export function useRoutes() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const allRoutes = await routeService.getAllRoutes();
        setRoutes(allRoutes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const searchRoutes = useCallback(async (startLocation: string, endLocation: string) => {
    try {
      setLoading(true);
      const searchResults = await routeService.searchRoutes(startLocation, endLocation);
      return searchResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search routes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getRouteByNumber = useCallback(async (routeNumber: string) => {
    try {
      const route = await routeService.getRouteByNumber(routeNumber);
      return route;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch route');
      return null;
    }
  }, []);

  return {
    routes,
    loading,
    error,
    searchRoutes,
    getRouteByNumber
  };
}

// Stops hook
export function useStops() {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const allStops = await stopService.getAllStops();
        setStops(allStops);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stops');
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, []);

  const getStopsByRoute = useCallback(async (routeNumber: string) => {
    try {
      setLoading(true);
      const routeStops = await stopService.getStopsByRoute(routeNumber);
      return routeStops;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch route stops');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStops = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      const searchResults = await stopService.searchStops(searchTerm);
      return searchResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search stops');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stops,
    loading,
    error,
    getStopsByRoute,
    searchStops
  };
}

// User profile hook
export function useUserProfile(userId?: string) {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getUserById(userId);
        setUserProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const updatePreferences = useCallback(async (preferences: User['preferences']) => {
    if (!userId) return;
    
    try {
      await userService.updateUserPreferences(userId, preferences);
      setUserProfile(prev => prev ? { ...prev, preferences } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, [userId]);

  const addFavoriteRoute = useCallback(async (routeNumber: string) => {
    if (!userId) return;
    
    try {
      await userService.addFavoriteRoute(userId, routeNumber);
      // Refresh user profile
      const updatedProfile = await userService.getUserById(userId);
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite route');
    }
  }, [userId]);

  const removeFavoriteRoute = useCallback(async (routeNumber: string) => {
    if (!userId) return;
    
    try {
      await userService.removeFavoriteRoute(userId, routeNumber);
      // Refresh user profile
      const updatedProfile = await userService.getUserById(userId);
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite route');
    }
  }, [userId]);

  return {
    userProfile,
    loading,
    error,
    updatePreferences,
    addFavoriteRoute,
    removeFavoriteRoute
  };
}

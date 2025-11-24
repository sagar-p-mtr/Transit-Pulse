import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CityConfig, INDIAN_CITIES, cityProviderService, CityBus, CityRoute } from '../services/cityProvider';

interface CityContextType {
  currentCity: CityConfig | null;
  selectedCityId: string;
  setSelectedCityId: (cityId: string) => void;
  availableCities: CityConfig[];
  isLoading: boolean;
  error: string | null;
  autoDetectCity: () => Promise<boolean>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

interface CityProviderProps {
  children: ReactNode;
}

export const CityProvider: React.FC<CityProviderProps> = ({ children }) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    // Try to get saved city from localStorage, default to bangalore
    return localStorage.getItem('selectedCity') || 'bangalore';
  });
  
  const [currentCity, setCurrentCity] = useState<CityConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const availableCities = Object.values(INDIAN_CITIES);

  // Update current city when selectedCityId changes
  useEffect(() => {
    const city = cityProviderService.getCityById(selectedCityId);
    if (city) {
      setCurrentCity(city);
      setError(null);
      // Save to localStorage
      localStorage.setItem('selectedCity', selectedCityId);
    } else {
      setError(`City not found: ${selectedCityId}`);
      // Fallback to bangalore if invalid city
      const fallbackCity = cityProviderService.getCityById('bangalore');
      if (fallbackCity) {
        setCurrentCity(fallbackCity);
        setSelectedCityId('bangalore');
        localStorage.setItem('selectedCity', 'bangalore');
      }
    }
  }, [selectedCityId]);

  const handleSetSelectedCityId = (cityId: string) => {
    setError(null);
    setSelectedCityId(cityId);
  };

  const autoDetectCity = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const detectedCity = cityProviderService.detectCity(latitude, longitude);
            
            if (detectedCity) {
              setSelectedCityId(detectedCity.id);
              setIsLoading(false);
              resolve(true);
            } else {
              setError('Unable to detect city from your location');
              setIsLoading(false);
              resolve(false);
            }
          },
          (error) => {
            let errorMessage = 'Unable to access your location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }
            
            setError(errorMessage);
            setIsLoading(false);
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
        resolve(false);
      }
    });
  };

  const contextValue: CityContextType = {
    currentCity,
    selectedCityId,
    setSelectedCityId: handleSetSelectedCityId,
    availableCities,
    isLoading,
    error,
    autoDetectCity
  };

  return (
    <CityContext.Provider value={contextValue}>
      {children}
    </CityContext.Provider>
  );
};

// Custom hook to use the city context
export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

// Utility hooks for common operations
export const useCurrentCityBuses = () => {
  const { currentCity } = useCity();
  const [buses, setBuses] = useState<CityBus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuses = async () => {
    if (!currentCity) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cityBuses = await cityProviderService.getBuses(currentCity.id);
      setBuses(cityBuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [currentCity]);

  return { buses, loading, error, refetch: fetchBuses };
};

export const useCurrentCityRoutes = () => {
  const { currentCity } = useCity();
  const [routes, setRoutes] = useState<CityRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    if (!currentCity) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cityRoutes = await cityProviderService.getRoutes(currentCity.id);
      setRoutes(cityRoutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [currentCity]);

  return { routes, loading, error, refetch: fetchRoutes };
};

export const useCitySearch = () => {
  const { currentCity } = useCity();
  const [searchResults, setSearchResults] = useState<CityRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRoutes = async (query: string) => {
    if (!currentCity || !query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await cityProviderService.searchRoutes(currentCity.id, query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { searchResults, loading, error, searchRoutes };
};
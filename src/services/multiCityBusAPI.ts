import { cityProviderService, CityBus, CityRoute } from './cityProvider';
import delhiBusApi from './delhiBusApi';
import mumbaiBusApi from './mumbaiBusApi';
import chennaiBusApi from './chennaiBusApi';
import bmtcApi from './bmtcApi';
import { isLiveDataEnabled } from '../config/runtime';

// Unified Multi-City Bus API
export class MultiCityBusAPI {
  private cityService = cityProviderService;

  // Get buses for any city
  async getBuses(cityId: string, providerId?: string): Promise<CityBus[]> {
    if (!isLiveDataEnabled()) {
      return await this.cityService.getBuses(cityId, providerId);
    }
    try {
      switch (cityId) {
        case 'delhi':
          if (providerId) {
            return providerId === 'dtc' 
              ? await delhiBusApi.getAllDTCBuses()
              : await delhiBusApi.getAllClusterBuses();
          }
          return await delhiBusApi.getAllBuses();

        case 'mumbai':
          if (providerId) {
            return providerId === 'best' 
              ? await mumbaiBusApi.getAllBESTBuses()
              : await mumbaiBusApi.getAllMSRTCBuses();
          }
          return await mumbaiBusApi.getAllBuses();

        case 'chennai':
          if (providerId) {
            return providerId === 'mtc' 
              ? await chennaiBusApi.getAllMTCBuses()
              : await chennaiBusApi.getAllTNSTCBuses();
          }
          return await chennaiBusApi.getAllBuses();

        case 'bangalore':
          // Convert BMTC API response to CityBus format
          const bmtcBuses = await bmtcApi.getAllBuses();
          return bmtcBuses.map(bus => ({
            ...bus,
            cityId: 'bangalore',
            providerId: 'bmtc',
            crowdLevel: bus.crowdLevel || 'Medium',
            crowdPercentage: bus.crowdPercentage || 50,
            isActive: true
          }));

        default:
          // Use generic city service for other cities
          return await this.cityService.getBuses(cityId, providerId);
      }
    } catch (error) {
      console.error(`Error fetching buses for ${cityId}:`, error);
      return await this.cityService.getBuses(cityId, providerId);
    }
  }

  // Get routes for any city
  async getRoutes(cityId: string, providerId?: string): Promise<CityRoute[]> {
    if (!isLiveDataEnabled()) {
      return await this.cityService.getRoutes(cityId, providerId);
    }
    try {
      switch (cityId) {
        case 'delhi':
          if (providerId) {
            return providerId === 'dtc' 
              ? await delhiBusApi.getDTCRoutes()
              : await delhiBusApi.getClusterRoutes();
          }
          return await delhiBusApi.getAllRoutes();

        case 'mumbai':
          if (providerId) {
            return providerId === 'best' 
              ? await mumbaiBusApi.getBESTRoutes()
              : await mumbaiBusApi.getMSRTCRoutes();
          }
          return await mumbaiBusApi.getAllRoutes();

        case 'chennai':
          if (providerId) {
            return providerId === 'mtc' 
              ? await chennaiBusApi.getMTCRoutes()
              : await chennaiBusApi.getTNSTCRoutes();
          }
          return await chennaiBusApi.getAllRoutes();

        case 'bangalore':
          // Convert BMTC API response to CityRoute format
          const bmtcRoutes = await bmtcApi.getAllRoutes();
          return bmtcRoutes.map(route => ({
            ...route,
            cityId: 'bangalore',
            providerId: 'bmtc',
            distance: 15, // Default distance
            duration: '45 mins', // Default duration
            fare: {
              minimum: 8,
              maximum: 25,
              currency: 'INR'
            },
            stops: route.stops.map(stop => ({
              ...stop,
              address: `${stop.name}, Bangalore`
            })),
            isActive: true
          }));

        default:
          // Use generic city service for other cities
          return await this.cityService.getRoutes(cityId, providerId);
      }
    } catch (error) {
      console.error(`Error fetching routes for ${cityId}:`, error);
      return await this.cityService.getRoutes(cityId, providerId);
    }
  }

  // Search routes across any city
  async searchRoutes(cityId: string, query: string): Promise<CityRoute[]> {
    if (!isLiveDataEnabled()) {
      return await this.cityService.searchRoutes(cityId, query);
    }
    try {
      switch (cityId) {
        case 'delhi':
          return await delhiBusApi.searchRoutes(query);

        case 'mumbai':
          return await mumbaiBusApi.searchRoutes(query);

        case 'chennai':
          return await chennaiBusApi.searchRoutes(query);

        case 'bangalore':
          // Use BMTC search and convert to CityRoute format
          const bmtcResults = await bmtcApi.searchRoutes('bangalore', query);
          return bmtcResults.map(route => ({
            ...route,
            cityId: 'bangalore',
            providerId: 'bmtc',
            distance: 15,
            duration: '45 mins',
            fare: {
              minimum: 8,
              maximum: 25,
              currency: 'INR'
            },
            stops: route.stops.map(stop => ({
              ...stop,
              address: `${stop.name}, Bangalore`
            })),
            isActive: true
          }));

        default:
          return await this.cityService.searchRoutes(cityId, query);
      }
    } catch (error) {
      console.error(`Error searching routes in ${cityId}:`, error);
      return await this.cityService.searchRoutes(cityId, query);
    }
  }

  // Get buses by route for any city
  async getBusesByRoute(cityId: string, routeId: string): Promise<CityBus[]> {
    if (!isLiveDataEnabled()) {
      return await this.cityService.getBuses(cityId);
    }
    try {
      switch (cityId) {
        case 'delhi':
          return await delhiBusApi.getBusesByRoute(routeId);

        case 'mumbai':
          return await mumbaiBusApi.getBusesByRoute(routeId);

        case 'chennai':
          return await chennaiBusApi.getBusesByRoute(routeId);

        case 'bangalore':
          // Use BMTC API and convert to CityBus format
          const bmtcBuses = await bmtcApi.getBusesByRoute(routeId);
          return bmtcBuses.map(bus => ({
            ...bus,
            cityId: 'bangalore',
            providerId: 'bmtc',
            crowdLevel: bus.crowdLevel || 'Medium',
            crowdPercentage: bus.crowdPercentage || 50,
            isActive: true
          }));

        default:
          // This would need to be implemented for other cities
          return [];
      }
    } catch (error) {
      console.error(`Error fetching buses for route ${routeId} in ${cityId}:`, error);
      return [];
    }
  }

  // Get city-specific features
  getCityFeatures(cityId: string) {
    const city = this.cityService.getCityById(cityId);
    if (!city) return null;

    const features = {
      hasRealTimeTracking: true,
      hasRouteSearch: true,
      hasStopInformation: true,
      hasFareCalculation: true,
      hasMultipleProviders: city.providers.length > 1,
      providers: city.providers,
      specialFeatures: [] as string[]
    };

    // Add city-specific features
    switch (cityId) {
      case 'delhi':
        features.specialFeatures.push('AC/Non-AC bus types', 'Multiple depots', 'Cluster buses');
        break;
      case 'mumbai':
        features.specialFeatures.push('Zone-based routes', 'BEST electric buses', 'Harbor line connectivity');
        break;
      case 'chennai':
        features.specialFeatures.push('MTC divisions', 'Direction-based routes', 'Express services');
        break;
      case 'bangalore':
        features.specialFeatures.push('BMTC Volvo buses', 'KSRTC integration', 'Tech park connectivity');
        break;
    }

    return features;
  }

  // Get popular routes for a city
  async getPopularRoutes(cityId: string, limit: number = 10): Promise<CityRoute[]> {
    try {
      const allRoutes = await this.getRoutes(cityId);
      
      // Sort by frequency and return top routes
      // In a real app, this would be based on actual usage data
      return allRoutes
        .sort((a, b) => {
          // Simple popularity scoring based on route number
          const aScore = parseInt(a.routeNumber) || 999;
          const bScore = parseInt(b.routeNumber) || 999;
          return aScore - bScore;
        })
        .slice(0, limit);
    } catch (error) {
      console.error(`Error fetching popular routes for ${cityId}:`, error);
      return [];
    }
  }

  // Get nearby buses based on location
  async getNearbyBuses(cityId: string, lat: number, lng: number, radius: number = 5): Promise<CityBus[]> {
    try {
      const allBuses = await this.getBuses(cityId);
      
      // Filter buses within radius (in km)
      return allBuses.filter(bus => {
        const distance = this.calculateDistance(lat, lng, bus.latitude, bus.longitude);
        return distance <= radius;
      });
    } catch (error) {
      console.error(`Error fetching nearby buses for ${cityId}:`, error);
      return [];
    }
  }

  // Helper function to calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get city statistics
  async getCityStats(cityId: string) {
    try {
      const [buses, routes] = await Promise.all([
        this.getBuses(cityId),
        this.getRoutes(cityId)
      ]);

      const activeBuses = buses.filter(bus => bus.isActive);
      const providers = new Set(buses.map(bus => bus.providerId));

      return {
        totalBuses: buses.length,
        activeBuses: activeBuses.length,
        totalRoutes: routes.length,
        providers: Array.from(providers),
        providerCount: providers.size,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching stats for ${cityId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const multiCityBusAPI = new MultiCityBusAPI();
export default multiCityBusAPI;

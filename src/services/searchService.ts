import Fuse from 'fuse.js';
import { offlineStorage } from './offlineStorage';

export interface SearchResult {
  id: string;
  type: 'route' | 'stop' | 'bus';
  title: string;
  subtitle: string;
  metadata?: any;
  score?: number;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
  selectedResult?: SearchResult;
}

class SearchService {
  private searchHistory: SearchHistory[] = [];
  private maxHistoryItems = 10;
  private fuseOptions = {
    keys: ['title', 'subtitle', 'metadata.routeNumber', 'metadata.destination'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    shouldSort: true
  };

  constructor() {
    this.loadSearchHistory();
  }

  // Fuzzy search across multiple data types
  async search(query: string, filters?: {
    types?: ('route' | 'stop' | 'bus')[];
    providers?: string[];
    crowdLevels?: string[];
  }): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return this.getRecentSearchResults();
    }

    try {
      // Get data from offline storage or API
      const [routes, stops, buses] = await Promise.all([
        this.getRoutes(),
        this.getStops(),
        this.getBuses()
      ]);

      let searchData: SearchResult[] = [];

      // Filter by types if specified
      const searchTypes = filters?.types || ['route', 'stop', 'bus'];
      
      if (searchTypes.includes('route')) {
        searchData.push(...routes.map(route => ({
          id: route.id,
          type: 'route' as const,
          title: `${route.routeNumber} - ${route.routeName}`,
          subtitle: `${route.source} → ${route.destination}`,
          metadata: route
        })));
      }

      if (searchTypes.includes('stop')) {
        searchData.push(...stops.map(stop => ({
          id: stop.id,
          type: 'stop' as const,
          title: stop.name,
          subtitle: stop.address || '',
          metadata: stop
        })));
      }

      if (searchTypes.includes('bus')) {
        searchData.push(...buses.map(bus => ({
          id: bus.id,
          type: 'bus' as const,
          title: `Bus ${bus.vehicleNumber}`,
          subtitle: `Route ${bus.routeName} - ${bus.crowdLevel || 'Unknown'} crowd`,
          metadata: bus
        })));
      }

      // Apply provider filter
      if (filters?.providers && filters.providers.length > 0) {
        searchData = searchData.filter(item => 
          filters.providers!.includes(item.metadata?.provider)
        );
      }

      // Apply crowd level filter for buses
      if (filters?.crowdLevels && filters.crowdLevels.length > 0) {
        searchData = searchData.filter(item => 
          item.type !== 'bus' || filters.crowdLevels!.includes(item.metadata?.crowdLevel)
        );
      }

      // Perform fuzzy search
      const fuse = new Fuse(searchData, this.fuseOptions);
      const results = fuse.search(query);

      // Map results and add scores
      const mappedResults = results.map(result => ({
        ...result.item,
        score: result.score
      }));

      // Save to history
      this.addToHistory({
        query,
        timestamp: new Date(),
        resultCount: mappedResults.length
      });

      return mappedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Get search suggestions based on partial input
  async getSuggestions(partialQuery: string): Promise<string[]> {
    if (!partialQuery || partialQuery.length < 2) {
      return this.getRecentQueries();
    }

    const suggestions: Set<string> = new Set();

    // Add matching recent queries
    this.searchHistory
      .filter(h => h.query.toLowerCase().includes(partialQuery.toLowerCase()))
      .forEach(h => suggestions.add(h.query));

    // Add popular searches that match
    const popularSearches = await this.getPopularSearches();
    popularSearches
      .filter(s => s.toLowerCase().includes(partialQuery.toLowerCase()))
      .forEach(s => suggestions.add(s));

    return Array.from(suggestions).slice(0, 8);
  }

  // Get recent search queries
  getRecentQueries(): string[] {
    return this.searchHistory
      .slice(0, 5)
      .map(h => h.query);
  }

  // Get recent search results for quick access
  async getRecentSearchResults(): Promise<SearchResult[]> {
    const recentResults: SearchResult[] = [];
    
    // Get saved favorite routes
    const favorites = await offlineStorage.getData('favoriteRoutes') || [];
    favorites.forEach((fav: any) => {
      recentResults.push({
        id: fav.id,
        type: 'route',
        title: `${fav.routeNumber} - ${fav.routeName}`,
        subtitle: `${fav.source} → ${fav.destination}`,
        metadata: { ...fav, isFavorite: true }
      });
    });

    // Add recently selected results
    this.searchHistory
      .filter(h => h.selectedResult)
      .slice(0, 3)
      .forEach(h => {
        if (h.selectedResult && !recentResults.find(r => r.id === h.selectedResult!.id)) {
          recentResults.push(h.selectedResult);
        }
      });

    return recentResults;
  }

  // Get popular searches
  async getPopularSearches(): Promise<string[]> {
    // In a real app, this would come from an API
    return [
      'Airport bus',
      'Electronic City',
      'Whitefield',
      'KBS to Majestic',
      'Silk Board',
      'Hebbal',
      'Marathahalli',
      'Koramangala'
    ];
  }

  // Add to search history
  addToHistory(entry: SearchHistory): void {
    // Remove duplicate queries
    this.searchHistory = this.searchHistory.filter(h => h.query !== entry.query);
    
    // Add new entry at the beginning
    this.searchHistory.unshift(entry);
    
    // Limit history size
    if (this.searchHistory.length > this.maxHistoryItems) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
    }
    
    this.saveSearchHistory();
  }

  // Update selected result in history
  updateSelectedResult(query: string, result: SearchResult): void {
    const historyItem = this.searchHistory.find(h => h.query === query);
    if (historyItem) {
      historyItem.selectedResult = result;
      this.saveSearchHistory();
    }
  }

  // Clear search history
  clearHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  // Load search history from storage
  private async loadSearchHistory(): Promise<void> {
    try {
      const saved = await offlineStorage.getData('searchHistory');
      if (saved) {
        this.searchHistory = saved.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  // Save search history to storage
  private async saveSearchHistory(): Promise<void> {
    try {
      await offlineStorage.saveData('searchHistory', this.searchHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Get data from offline storage or API
  private async getRoutes(): Promise<any[]> {
    try {
      const cached = await offlineStorage.getData('routes');
      if (cached) return cached;

      // Fallback to mock data if no cached data
      const { generateMockRoutes } = await import('./mockData');
      const routes = generateMockRoutes(20);
      await offlineStorage.saveData('routes', routes);
      return routes;
    } catch (error) {
      console.error('Error getting routes:', error);
      return [];
    }
  }

  private async getStops(): Promise<any[]> {
    try {
      const cached = await offlineStorage.getData('stops');
      if (cached) return cached;

      // Generate mock stops
      const stops = Array.from({ length: 30 }, (_, i) => ({
        id: `stop-${i + 1}`,
        name: `Bus Stop ${i + 1}`,
        address: `Street ${i + 1}, Area ${Math.floor(i / 5) + 1}`,
        latitude: 12.9716 + (Math.random() * 0.2 - 0.1),
        longitude: 77.5946 + (Math.random() * 0.2 - 0.1)
      }));
      
      await offlineStorage.saveData('stops', stops);
      return stops;
    } catch (error) {
      console.error('Error getting stops:', error);
      return [];
    }
  }

  private async getBuses(): Promise<any[]> {
    try {
      const cached = await offlineStorage.getData('buses');
      if (cached) return cached;

      // Fallback to mock data if no cached data
      const { generateMockBuses } = await import('./mockData');
      const buses = generateMockBuses(15);
      await offlineStorage.saveData('buses', buses);
      return buses;
    } catch (error) {
      console.error('Error getting buses:', error);
      return [];
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();

export default SearchService;

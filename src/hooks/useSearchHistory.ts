import { useState, useEffect, useCallback } from 'react';
import { searchService, SearchResult, SearchHistory } from '../services/searchService';

export interface UseSearchHistoryReturn {
  searchHistory: SearchHistory[];
  recentQueries: string[];
  suggestions: string[];
  popularSearches: string[];
  isLoading: boolean;
  addToHistory: (entry: SearchHistory) => void;
  updateSelectedResult: (query: string, result: SearchResult) => void;
  clearHistory: () => void;
  getSuggestions: (query: string) => Promise<void>;
}

export const useSearchHistory = (): UseSearchHistoryReturn => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [queries, popular] = await Promise.all([
        searchService.getRecentQueries(),
        searchService.getPopularSearches()
      ]);
      
      setRecentQueries(queries);
      setPopularSearches(popular);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = useCallback((entry: SearchHistory) => {
    searchService.addToHistory(entry);
    setSearchHistory(prev => [entry, ...prev.filter(h => h.query !== entry.query)].slice(0, 10));
    setRecentQueries(prev => [entry.query, ...prev.filter(q => q !== entry.query)].slice(0, 5));
  }, []);

  const updateSelectedResult = useCallback((query: string, result: SearchResult) => {
    searchService.updateSelectedResult(query, result);
    setSearchHistory(prev => 
      prev.map(h => h.query === query ? { ...h, selectedResult: result } : h)
    );
  }, []);

  const clearHistory = useCallback(() => {
    searchService.clearHistory();
    setSearchHistory([]);
    setRecentQueries([]);
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions(recentQueries);
      return;
    }

    try {
      const newSuggestions = await searchService.getSuggestions(query);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  }, [recentQueries]);

  return {
    searchHistory,
    recentQueries,
    suggestions,
    popularSearches,
    isLoading,
    addToHistory,
    updateSelectedResult,
    clearHistory,
    getSuggestions
  };
};

export default useSearchHistory;

/**
 * LEGACY: This hook is kept for backwards compatibility
 * New code should use usePhoneSearch from usePhones.ts
 */

import { useState, useEffect } from 'react';
import { PhoneSearchResult } from '../types';
import { getPhoneService } from '../di/container';
import { PhoneMapper } from '../application/mappers';
import { useDebounce } from './useDebounce';

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PhoneSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const phoneService = getPhoneService();

  useEffect(() => {
    searchPhones();
  }, [debouncedQuery]);

  const searchPhones = async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = await phoneService.searchPhones(debouncedQuery, 10);

      // Convert to PhoneSearchResult format
      const mappedResults: PhoneSearchResult[] = searchResults.map((r) => ({
        phone: PhoneMapper.toDTO(r.phone),
        confidence: r.confidence,
        matchType: r.matchType,
        matchedFields: [],
      }));

      setResults(mappedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
  };
}

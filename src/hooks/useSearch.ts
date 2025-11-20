import { useState, useEffect } from 'react';
import { PhoneSearchResult } from '../types';
import { searchPhones } from '../services/search';
import { useDebounce } from './useDebounce';

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PhoneSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const searchResults = searchPhones(debouncedQuery, 10);
    setResults(searchResults);
    setIsSearching(false);
  }, [debouncedQuery]);

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

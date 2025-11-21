/**
 * usePhones Hook
 * Uses Clean Architecture PhoneService
 */

import { useState, useEffect } from 'react';
import { Phone, PhoneSearchResult } from '../types';
import { getPhoneService } from '../di/container';
import { PhoneMapper } from '../application/mappers';
import { useDebounce } from './useDebounce';

export function usePhones() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneService = getPhoneService();

  useEffect(() => {
    loadPhones();
  }, []);

  const loadPhones = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const entities = await phoneService.getAllPhones();
      const dtos = entities.map((e) => PhoneMapper.toDTO(e));
      setPhones(dtos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load phones');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phones,
    isLoading,
    error,
    reload: loadPhones,
  };
}

export function usePhoneSearch(initialQuery: string = '') {
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
      const results: PhoneSearchResult[] = searchResults.map((r) => ({
        phone: PhoneMapper.toDTO(r.phone),
        confidence: r.confidence,
        matchType: r.matchType,
        matchedFields: [],
      }));

      setResults(results);
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

export function usePhoneById(id: string | undefined) {
  const [phone, setPhone] = useState<Phone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneService = getPhoneService();

  useEffect(() => {
    if (!id) {
      setPhone(null);
      return;
    }

    loadPhone();
  }, [id]);

  const loadPhone = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const entity = await phoneService.getPhoneById(id);
      setPhone(entity ? PhoneMapper.toDTO(entity) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load phone');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    phone,
    isLoading,
    error,
  };
}

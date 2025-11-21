/**
 * useComparison Hook
 * Uses Clean Architecture ComparisonService
 */

import { useState, useEffect } from 'react';
import { Comparison, PersonaType } from '../types';
import { getComparisonService } from '../di/container';
import { ComparisonMapper } from '../application/mappers';

export function useComparison(
  phone1Id: string | undefined,
  phone2Id: string | undefined,
  persona: PersonaType = 'photographer'
) {
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comparisonService = getComparisonService();

  useEffect(() => {
    if (!phone1Id || !phone2Id) {
      setComparison(null);
      return;
    }

    comparePhones();
  }, [phone1Id, phone2Id, persona]);

  const comparePhones = async () => {
    if (!phone1Id || !phone2Id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await comparisonService.comparePhones(phone1Id, phone2Id, persona);
      const comparisonDTO = ComparisonMapper.toDTO(result.comparison);
      setComparison(comparisonDTO);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare phones');
      setComparison(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comparison,
    isLoading,
    error,
    reload: comparePhones,
  };
}

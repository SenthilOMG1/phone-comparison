/**
 * usePricing Hook
 * Uses Clean Architecture PricingService
 */

import { useState, useEffect } from 'react';
import { getPricingService } from '../di/container';
import type { RetailerPrice, Promotion } from '../domain/repositories';

export function useBestPrice(phoneSlug: string | undefined, inStockOnly: boolean = true) {
  const [bestPrice, setBestPrice] = useState<RetailerPrice | null>(null);
  const [allPrices, setAllPrices] = useState<RetailerPrice[]>([]);
  const [savings, setSavings] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricingService = getPricingService();

  useEffect(() => {
    if (!phoneSlug) {
      setBestPrice(null);
      setAllPrices([]);
      setSavings(undefined);
      return;
    }

    loadBestPrice();
  }, [phoneSlug, inStockOnly]);

  const loadBestPrice = async () => {
    if (!phoneSlug) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await pricingService.findBestPrice(phoneSlug, inStockOnly);
      setBestPrice(result.bestPrice);
      setAllPrices(result.allPrices);
      setSavings(result.savingsFromMostExpensive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prices');
      setBestPrice(null);
      setAllPrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bestPrice,
    allPrices,
    savings,
    isLoading,
    error,
    reload: loadBestPrice,
  };
}

export function usePromotions(brand?: string, retailer?: string) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricingService = getPricingService();

  useEffect(() => {
    loadPromotions();
  }, [brand, retailer]);

  const loadPromotions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const promos = await pricingService.getActivePromotions(brand, retailer);
      setPromotions(promos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promotions,
    isLoading,
    error,
    reload: loadPromotions,
  };
}

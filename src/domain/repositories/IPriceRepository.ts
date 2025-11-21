/**
 * Price Repository Interface
 * Handles live pricing data from backend API
 */

import { Price } from '../value-objects';

export interface RetailerPrice {
  retailer: string;
  price: Price;
  originalPrice?: Price;
  inStock: boolean;
  url: string;
  lastUpdated: Date;
}

export interface PriceHistory {
  date: Date;
  price: Price;
  retailer: string;
}

export interface IPriceRepository {
  /**
   * Get best current price for a phone
   */
  getBestPrice(phoneSlug: string): Promise<RetailerPrice | null>;

  /**
   * Get all current prices for a phone across retailers
   */
  getAllPrices(phoneSlug: string): Promise<RetailerPrice[]>;

  /**
   * Get price history for a phone
   */
  getPriceHistory(phoneSlug: string, days: number): Promise<PriceHistory[]>;

  /**
   * Get latest prices across all products
   */
  getLatestPrices(limit?: number): Promise<Array<{
    productName: string;
    brand: string;
    slug: string;
    prices: RetailerPrice[];
  }>>;
}

/**
 * Promotion Repository Interface
 * Handles active promotions and deals
 */

import { Price } from '../value-objects';

export interface Promotion {
  id: number;
  productName: string;
  brand: string;
  retailer: string;
  title: string;
  description?: string;
  discountPercentage?: number;
  originalPrice?: Price;
  discountedPrice: Price;
  validFrom: Date;
  validUntil?: Date;
  sourceUrl?: string;
}

export interface IPromotionRepository {
  /**
   * Get all active promotions
   */
  getActive(brand?: string, retailer?: string): Promise<Promotion[]>;

  /**
   * Get promotions for a specific product
   */
  getByProduct(productSlug: string): Promise<Promotion[]>;

  /**
   * Get promotions by retailer
   */
  getByRetailer(retailer: string): Promise<Promotion[]>;
}

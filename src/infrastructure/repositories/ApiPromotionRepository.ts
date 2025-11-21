/**
 * API Promotion Repository Implementation
 * Fetches promotions from backend API
 */

import { IPromotionRepository, Promotion } from '../../domain/repositories';
import { Price } from '../../domain/value-objects';
import * as API from '../../services/api/api.service';

export class ApiPromotionRepository implements IPromotionRepository {
  async getActive(brand?: string, retailer?: string): Promise<Promotion[]> {
    try {
      const response = await API.getActivePromotions(brand, retailer);

      return response.promotions.map((p) => this.mapPromotion(p));
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      return [];
    }
  }

  async getByProduct(productSlug: string): Promise<Promotion[]> {
    try {
      // Get all promotions and filter by slug
      const response = await API.getActivePromotions();

      return response.promotions
        .filter((p) => p.slug === productSlug)
        .map((p) => this.mapPromotion(p));
    } catch (error) {
      console.error('Failed to fetch promotions for product:', error);
      return [];
    }
  }

  async getByRetailer(retailer: string): Promise<Promotion[]> {
    try {
      const response = await API.getActivePromotions(undefined, retailer);
      return response.promotions.map((p) => this.mapPromotion(p));
    } catch (error) {
      console.error('Failed to fetch promotions for retailer:', error);
      return [];
    }
  }

  /**
   * Helper: Map API response to Promotion
   */
  private mapPromotion(apiPromotion: API.Promotion): Promotion {
    return {
      id: apiPromotion.id,
      productName: apiPromotion.product_name,
      brand: apiPromotion.brand,
      retailer: apiPromotion.retailer,
      title: apiPromotion.title,
      description: apiPromotion.description || undefined,
      discountPercentage: apiPromotion.discount_percentage || undefined,
      originalPrice: apiPromotion.original_price
        ? Price.create(apiPromotion.original_price, 'MUR')
        : undefined,
      discountedPrice: Price.create(apiPromotion.discounted_price, 'MUR'),
      validFrom: new Date(apiPromotion.valid_from),
      validUntil: apiPromotion.valid_until
        ? new Date(apiPromotion.valid_until)
        : undefined,
      sourceUrl: apiPromotion.source_url || undefined,
    };
  }
}

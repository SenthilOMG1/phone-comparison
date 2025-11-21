/**
 * API Price Repository Implementation
 * Fetches live pricing data from backend API
 */

import { IPriceRepository, RetailerPrice, PriceHistory } from '../../domain/repositories';
import { Price } from '../../domain/value-objects';
import * as API from '../../services/api/api.service';

export class ApiPriceRepository implements IPriceRepository {
  async getBestPrice(phoneSlug: string): Promise<RetailerPrice | null> {
    try {
      const response = await API.getBestPrice(phoneSlug);

      if (!response.best_price) {
        return null;
      }

      return this.mapRetailerPrice(response.best_price);
    } catch (error) {
      console.error('Failed to fetch best price:', error);
      return null;
    }
  }

  async getAllPrices(phoneSlug: string): Promise<RetailerPrice[]> {
    try {
      const response = await API.getBestPrice(phoneSlug);
      return response.all_prices.map((p) => this.mapRetailerPrice(p));
    } catch (error) {
      console.error('Failed to fetch all prices:', error);
      return [];
    }
  }

  async getPriceHistory(phoneSlug: string, days: number): Promise<PriceHistory[]> {
    try {
      const response = await API.getPriceHistory(phoneSlug, days);

      return response.history.map((h) => ({
        date: new Date(h.timestamp),
        price: Price.create(h.price, 'MUR'),
        retailer: h.retailer,
      }));
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      return [];
    }
  }

  async getLatestPrices(limit?: number) {
    try {
      const response = await API.getLatestPrices(undefined, undefined, false);

      // Group by product
      const productMap = new Map<string, any>();

      response.prices.forEach((price) => {
        if (!productMap.has(price.slug)) {
          productMap.set(price.slug, {
            productName: price.product_name,
            brand: price.brand,
            slug: price.slug,
            prices: [],
          });
        }

        const retailerPrice: RetailerPrice = {
          retailer: price.retailer,
          price: Price.create(price.price, 'MUR'),
          originalPrice: price.original_price
            ? Price.create(price.original_price, 'MUR')
            : undefined,
          inStock: price.in_stock,
          url: price.url,
          lastUpdated: new Date(price.last_updated),
        };

        productMap.get(price.slug)!.prices.push(retailerPrice);
      });

      let results = Array.from(productMap.values());

      if (limit) {
        results = results.slice(0, limit);
      }

      return results;
    } catch (error) {
      console.error('Failed to fetch latest prices:', error);
      return [];
    }
  }

  /**
   * Helper: Map API response to RetailerPrice
   */
  private mapRetailerPrice(apiPrice: any): RetailerPrice {
    return {
      retailer: apiPrice.retailer,
      price: Price.create(apiPrice.price, 'MUR'),
      originalPrice: apiPrice.original_price
        ? Price.create(apiPrice.original_price, 'MUR')
        : undefined,
      inStock: apiPrice.in_stock,
      url: apiPrice.url,
      lastUpdated: new Date(apiPrice.last_updated),
    };
  }
}

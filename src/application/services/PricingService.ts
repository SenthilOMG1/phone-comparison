/**
 * Pricing Application Service
 * Handles price-related operations
 */

import { IPriceRepository, IPromotionRepository } from '../../domain/repositories';
import { FindBestPriceUseCase, FindBestPriceOutput } from '../../domain/use-cases';
import type { RetailerPrice, PriceHistory, Promotion } from '../../domain/repositories';

export class PricingService {
  private findBestPriceUseCase: FindBestPriceUseCase;

  constructor(
    private priceRepository: IPriceRepository,
    private promotionRepository: IPromotionRepository
  ) {
    this.findBestPriceUseCase = new FindBestPriceUseCase(priceRepository);
  }

  /**
   * Find best price for a phone
   */
  async findBestPrice(
    phoneSlug: string,
    inStockOnly: boolean = true
  ): Promise<FindBestPriceOutput> {
    return this.findBestPriceUseCase.execute({
      phoneSlug,
      inStockOnly,
    });
  }

  /**
   * Get all prices for a phone
   */
  async getAllPrices(phoneSlug: string): Promise<RetailerPrice[]> {
    return this.priceRepository.getAllPrices(phoneSlug);
  }

  /**
   * Get price history
   */
  async getPriceHistory(phoneSlug: string, days: number = 30): Promise<PriceHistory[]> {
    return this.priceRepository.getPriceHistory(phoneSlug, days);
  }

  /**
   * Get active promotions
   */
  async getActivePromotions(brand?: string, retailer?: string): Promise<Promotion[]> {
    return this.promotionRepository.getActive(brand, retailer);
  }

  /**
   * Get promotions for a product
   */
  async getPromotionsForProduct(productSlug: string): Promise<Promotion[]> {
    return this.promotionRepository.getByProduct(productSlug);
  }

  /**
   * Get latest prices across all products
   */
  async getLatestPrices(limit?: number) {
    return this.priceRepository.getLatestPrices(limit);
  }
}

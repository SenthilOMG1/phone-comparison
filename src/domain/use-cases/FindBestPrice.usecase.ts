/**
 * Find Best Price Use Case
 * Finds the best available price across all retailers
 */

import { IPriceRepository, RetailerPrice } from '../repositories';
import { EntityNotFoundError } from '../../shared/errors/DomainErrors';

export interface FindBestPriceInput {
  phoneSlug: string;
  inStockOnly?: boolean;
}

export interface FindBestPriceOutput {
  bestPrice: RetailerPrice;
  allPrices: RetailerPrice[];
  savingsFromMostExpensive?: number;
}

export class FindBestPriceUseCase {
  constructor(private priceRepository: IPriceRepository) {}

  async execute(input: FindBestPriceInput): Promise<FindBestPriceOutput> {
    // 1. Get all prices for this phone
    const allPrices = await this.priceRepository.getAllPrices(input.phoneSlug);

    if (allPrices.length === 0) {
      throw new EntityNotFoundError('Price data', input.phoneSlug);
    }

    // 2. Filter by stock if requested
    let availablePrices = allPrices;
    if (input.inStockOnly) {
      availablePrices = allPrices.filter((p) => p.inStock);
    }

    // If no in-stock prices, fall back to all prices
    if (availablePrices.length === 0) {
      availablePrices = allPrices;
    }

    // 3. Find best (lowest) price
    const bestPrice = availablePrices.reduce((best, current) => {
      return current.price.isCheaperThan(best.price) ? current : best;
    });

    // 4. Calculate savings
    const mostExpensive = availablePrices.reduce((max, current) => {
      return current.price.amount > max.price.amount ? current : max;
    });

    const savings = mostExpensive.price.amount - bestPrice.price.amount;

    return {
      bestPrice,
      allPrices,
      savingsFromMostExpensive: savings > 0 ? savings : undefined,
    };
  }
}

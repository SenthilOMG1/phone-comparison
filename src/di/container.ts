/**
 * Dependency Injection Container
 * Simple service locator pattern for managing dependencies
 * Provides singleton instances of services
 */

import { PhoneService, ComparisonService, PricingService } from '../application/services';
import { ApiPhoneRepository, ApiPriceRepository, ApiPromotionRepository } from '../infrastructure/repositories';
import type { IPhoneRepository, IPriceRepository, IPromotionRepository } from '../domain/repositories';

class DIContainer {
  private static instance: DIContainer;
  private services = new Map<string, any>();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Register all services
   */
  private registerServices(): void {
    // Repositories - Now using API-based repository for real Supabase data
    this.register<IPhoneRepository>('PhoneRepository', () => new ApiPhoneRepository());
    this.register<IPriceRepository>('PriceRepository', () => new ApiPriceRepository());
    this.register<IPromotionRepository>('PromotionRepository', () => new ApiPromotionRepository());

    // Application Services
    this.register<PhoneService>('PhoneService', () =>
      new PhoneService(this.resolve('PhoneRepository'))
    );

    this.register<ComparisonService>('ComparisonService', () =>
      new ComparisonService(this.resolve('PhoneRepository'))
    );

    this.register<PricingService>('PricingService', () =>
      new PricingService(
        this.resolve('PriceRepository'),
        this.resolve('PromotionRepository')
      )
    );
  }

  /**
   * Register a service with a factory function
   */
  register<T>(token: string, factory: () => T): void {
    this.services.set(token, { factory, instance: null });
  }

  /**
   * Resolve a service (singleton pattern)
   */
  resolve<T>(token: string): T {
    const service = this.services.get(token);

    if (!service) {
      throw new Error(`Service '${token}' not registered in DI container`);
    }

    // Return existing instance or create new one
    if (!service.instance) {
      service.instance = service.factory();
    }

    return service.instance;
  }

  /**
   * Clear all instances (useful for testing)
   */
  reset(): void {
    this.services.forEach((service) => {
      service.instance = null;
    });
  }
}

// Export singleton instance
export const container = DIContainer.getInstance();

// Export convenience functions
export function getPhoneService(): PhoneService {
  return container.resolve<PhoneService>('PhoneService');
}

export function getComparisonService(): ComparisonService {
  return container.resolve<ComparisonService>('ComparisonService');
}

export function getPricingService(): PricingService {
  return container.resolve<PricingService>('PricingService');
}

/**
 * API-based Phone Repository Implementation
 * Fetches phone data from Supabase via FastAPI backend
 */

import { IPhoneRepository, PhoneSearchFilter } from '../../domain/repositories';
import { PhoneEntity } from '../../domain/entities';
import { Phone } from '../../types';
import { getAllProducts, ProductListItem } from '../../services/api/api.service';

export class ApiPhoneRepository implements IPhoneRepository {
  private cachedPhones: PhoneEntity[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Convert API product to Phone entity format
   */
  private mapApiProductToPhone(product: ProductListItem): Phone {
    return {
      id: product.slug,
      brand: product.brand,
      model: product.model,
      series: undefined,
      releaseDate: new Date().toISOString().split('T')[0],
      variant: 'global',
      images: {
        hero: product.url || 'https://via.placeholder.com/400x400?text=No+Image',
      },
      specs: {
        // Basic specs - will be enriched as scraper collects more data
        display: {
          type: 'AMOLED',
          size: 6.5,
          resolution: '1080 x 2400',
          refreshRate: 60,
          ppi: 405,
        },
        processor: {
          chipset: 'Unknown',
          cpu: 'Unknown',
          gpu: 'Unknown',
        },
        camera: {
          main: {
            megapixels: 50,
            aperture: 1.8,
            sensorSize: 0.7,
            pixelSize: 1.0,
            features: [],
          },
          ultrawide: {
            megapixels: 8,
            aperture: 2.2,
            fieldOfView: 120,
          },
          selfie: {
            megapixels: 16,
            aperture: 2.0,
          },
        },
        battery: {
          capacity: 5000,
          charging: {
            wired: 33,
            wireless: undefined,
          },
        },
        connectivity: {
          network: ['5G', '4G LTE'],
          wifi: 'Wi-Fi 6',
          bluetooth: '5.2',
          nfc: true,
          usbType: 'USB-C',
        },
        software: {
          os: 'Android',
          osVersion: '13',
          customUI: undefined,
        },
        physical: {
          dimensions: {
            height: 160,
            width: 75,
            thickness: 8,
          },
          weight: 190,
          colors: ['Black', 'Silver'],
          build: {
            front: 'Glass',
            back: 'Glass',
            frame: 'Aluminum',
          },
        },
      },
      pricing: [
        {
          currency: 'MUR',
          basePrice: product.best_price,
          variants: [],
          region: 'Mauritius',
        },
      ],
      badges: product.in_stock ? ['In Stock'] : ['Out of Stock'],
    };
  }

  /**
   * Fetch phones from API with caching
   */
  private async fetchPhones(): Promise<PhoneEntity[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (this.cachedPhones && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedPhones;
    }

    try {
      const response = await getAllProducts(500); // Fetch up to 500 products
      const phones = response.products.map((product) => {
        const phoneData = this.mapApiProductToPhone(product);
        return PhoneEntity.create(phoneData);
      });

      this.cachedPhones = phones;
      this.lastFetchTime = now;

      return phones;
    } catch (error) {
      console.error('Failed to fetch phones from API:', error);

      // Return cached data if available, even if expired
      if (this.cachedPhones) {
        console.warn('Using expired cache due to API error');
        return this.cachedPhones;
      }

      // Return empty array as fallback
      return [];
    }
  }

  async findById(id: string): Promise<PhoneEntity | null> {
    const phones = await this.fetchPhones();
    const phone = phones.find((p) => p.id === id);
    return phone || null;
  }

  async findAll(filter?: PhoneSearchFilter): Promise<PhoneEntity[]> {
    let results = await this.fetchPhones();

    if (filter) {
      // Filter by brand
      if (filter.brand) {
        results = results.filter(
          (p) => p.brand.toLowerCase() === filter.brand!.toLowerCase()
        );
      }

      // Filter by price range
      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        results = results.filter((p) => {
          const basePrice = p.getBasePrice();
          if (!basePrice) return false;

          if (filter.minPrice !== undefined && basePrice.amount < filter.minPrice) {
            return false;
          }
          if (filter.maxPrice !== undefined && basePrice.amount > filter.maxPrice) {
            return false;
          }

          return true;
        });
      }

      // Filter by query
      if (filter.query) {
        const query = filter.query.toLowerCase();
        results = results.filter((p) => {
          const fullName = p.getFullName().toLowerCase();
          return fullName.includes(query);
        });
      }
    }

    return results;
  }

  async search(query: string): Promise<PhoneEntity[]> {
    const queryLower = query.toLowerCase().trim();
    const phones = await this.fetchPhones();

    if (!queryLower) {
      return phones;
    }

    // Search in brand, model, and full name
    return phones.filter((phone) => {
      const fullName = phone.getFullName().toLowerCase();
      const brand = phone.brand.toLowerCase();
      const model = phone.model.toLowerCase();

      return (
        fullName.includes(queryLower) ||
        brand.includes(queryLower) ||
        model.includes(queryLower)
      );
    });
  }

  async findByBrand(brand: string): Promise<PhoneEntity[]> {
    const phones = await this.fetchPhones();
    return phones.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  async getBrands(): Promise<string[]> {
    const phones = await this.fetchPhones();
    const brands = new Set(phones.map((p) => p.brand));
    return Array.from(brands).sort();
  }

  /**
   * Clear cache to force fresh data fetch
   */
  clearCache(): void {
    this.cachedPhones = null;
    this.lastFetchTime = 0;
  }
}

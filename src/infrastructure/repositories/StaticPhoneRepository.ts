/**
 * Static Phone Repository Implementation
 * Uses static JSON data files (current implementation)
 * Can be swapped with API-based repository later
 */

import { IPhoneRepository, PhoneSearchFilter } from '../../domain/repositories';
import { PhoneEntity } from '../../domain/entities';
import { PhoneMapper } from '../../application/mappers';

// Import static data
import { allPhones } from '../../data';

export class StaticPhoneRepository implements IPhoneRepository {
  private phones: PhoneEntity[];

  constructor() {
    // Convert static data to domain entities
    this.phones = allPhones.map((phone) => PhoneMapper.toDomain(phone));
  }

  async findById(id: string): Promise<PhoneEntity | null> {
    const phone = this.phones.find((p) => p.id === id);
    return phone || null;
  }

  async findAll(filter?: PhoneSearchFilter): Promise<PhoneEntity[]> {
    let results = [...this.phones];

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

    if (!queryLower) {
      return this.phones;
    }

    // Search in brand, model, and series
    return this.phones.filter((phone) => {
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
    return this.phones.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  async getBrands(): Promise<string[]> {
    const brands = new Set(this.phones.map((p) => p.brand));
    return Array.from(brands).sort();
  }
}

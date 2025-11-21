/**
 * Phone Repository Interface
 * Defines contract for phone data access
 * Implementations can use static data, API, or database
 */

import { PhoneEntity } from '../entities';

export interface PhoneSearchFilter {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}

export interface IPhoneRepository {
  /**
   * Find phone by ID
   */
  findById(id: string): Promise<PhoneEntity | null>;

  /**
   * Find all phones (with optional filter)
   */
  findAll(filter?: PhoneSearchFilter): Promise<PhoneEntity[]>;

  /**
   * Search phones by query
   */
  search(query: string): Promise<PhoneEntity[]>;

  /**
   * Find phones by brand
   */
  findByBrand(brand: string): Promise<PhoneEntity[]>;

  /**
   * Get all unique brands
   */
  getBrands(): Promise<string[]>;
}

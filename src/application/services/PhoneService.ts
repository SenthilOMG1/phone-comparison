/**
 * Phone Application Service
 * Orchestrates phone-related use cases
 * Acts as facade for presentation layer
 */

import { IPhoneRepository } from '../../domain/repositories';
import { SearchPhonesUseCase, SearchResult } from '../../domain/use-cases';
import { PhoneEntity } from '../../domain/entities';

export class PhoneService {
  private searchUseCase: SearchPhonesUseCase;

  constructor(private phoneRepository: IPhoneRepository) {
    this.searchUseCase = new SearchPhonesUseCase(phoneRepository);
  }

  /**
   * Get phone by ID
   */
  async getPhoneById(id: string): Promise<PhoneEntity | null> {
    return this.phoneRepository.findById(id);
  }

  /**
   * Get all phones
   */
  async getAllPhones(): Promise<PhoneEntity[]> {
    return this.phoneRepository.findAll();
  }

  /**
   * Search phones
   */
  async searchPhones(query: string, limit?: number): Promise<SearchResult[]> {
    return this.searchUseCase.execute({ query, limit });
  }

  /**
   * Get phones by brand
   */
  async getPhonesByBrand(brand: string): Promise<PhoneEntity[]> {
    return this.phoneRepository.findByBrand(brand);
  }

  /**
   * Get all available brands
   */
  async getBrands(): Promise<string[]> {
    return this.phoneRepository.getBrands();
  }
}

/**
 * Search Phones Use Case
 * Handles phone search with fuzzy matching
 */

import { PhoneEntity } from '../entities';
import { IPhoneRepository } from '../repositories';

export interface SearchPhonesInput {
  query: string;
  limit?: number;
}

export interface SearchResult {
  phone: PhoneEntity;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
}

export class SearchPhonesUseCase {
  constructor(private phoneRepository: IPhoneRepository) {}

  async execute(input: SearchPhonesInput): Promise<SearchResult[]> {
    // If query is empty, return all phones
    if (!input.query || input.query.trim() === '') {
      const allPhones = await this.phoneRepository.findAll();
      return allPhones.map((phone) => ({
        phone,
        confidence: 1.0,
        matchType: 'exact' as const,
      }));
    }

    // Search phones
    const phones = await this.phoneRepository.search(input.query);

    // Calculate confidence based on query match
    const query = input.query.toLowerCase();
    const results: SearchResult[] = phones.map((phone) => {
      const name = phone.getFullName().toLowerCase();

      // Exact match
      if (name === query) {
        return { phone, confidence: 1.0, matchType: 'exact' as const };
      }

      // Starts with query
      if (name.startsWith(query)) {
        return { phone, confidence: 0.9, matchType: 'partial' as const };
      }

      // Contains query
      if (name.includes(query)) {
        return { phone, confidence: 0.7, matchType: 'partial' as const };
      }

      // Fuzzy match (default)
      return { phone, confidence: 0.5, matchType: 'fuzzy' as const };
    });

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);

    // Apply limit
    if (input.limit) {
      return results.slice(0, input.limit);
    }

    return results;
  }
}

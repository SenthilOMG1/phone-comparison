/**
 * Compare Phones Use Case
 * Business logic for comparing two phones with persona preferences
 */

import { ComparisonEntity } from '../entities';
import { IPhoneRepository } from '../repositories';
import { EntityNotFoundError } from '../../shared/errors/DomainErrors';
import { PersonaType } from '../../types';

export interface ComparePhonesInput {
  phone1Id: string;
  phone2Id: string;
  persona?: PersonaType;
}

export interface ComparePhonesOutput {
  comparison: ComparisonEntity;
  categoryComparisons: ReturnType<ComparisonEntity['getCategoryComparisons']>;
  tldr: ReturnType<ComparisonEntity['getTLDR']>;
  keyDifferences: ReturnType<ComparisonEntity['getKeyDifferences']>;
  personaRecommendations: ReturnType<ComparisonEntity['getPersonaRecommendations']>;
}

export class ComparePhonesUseCase {
  constructor(private phoneRepository: IPhoneRepository) {}

  async execute(input: ComparePhonesInput): Promise<ComparePhonesOutput> {
    // 1. Fetch phones
    const phone1 = await this.phoneRepository.findById(input.phone1Id);
    if (!phone1) {
      throw new EntityNotFoundError('Phone', input.phone1Id);
    }

    const phone2 = await this.phoneRepository.findById(input.phone2Id);
    if (!phone2) {
      throw new EntityNotFoundError('Phone', input.phone2Id);
    }

    // 2. Create comparison entity
    const comparison = ComparisonEntity.create(
      phone1,
      phone2,
      input.persona || 'photographer'
    );

    // 3. Generate all comparison data
    return {
      comparison,
      categoryComparisons: comparison.getCategoryComparisons(),
      tldr: comparison.getTLDR(),
      keyDifferences: comparison.getKeyDifferences(),
      personaRecommendations: comparison.getPersonaRecommendations(),
    };
  }
}

/**
 * Comparison Application Service
 * Handles phone comparison operations
 */

import { IPhoneRepository } from '../../domain/repositories';
import { ComparePhonesUseCase, ComparePhonesOutput } from '../../domain/use-cases';
import { PersonaType } from '../../types';

export class ComparisonService {
  private compareUseCase: ComparePhonesUseCase;

  constructor(phoneRepository: IPhoneRepository) {
    this.compareUseCase = new ComparePhonesUseCase(phoneRepository);
  }

  /**
   * Compare two phones
   */
  async comparePhones(
    phone1Id: string,
    phone2Id: string,
    persona: PersonaType = 'photographer'
  ): Promise<ComparePhonesOutput> {
    return this.compareUseCase.execute({
      phone1Id,
      phone2Id,
      persona,
    });
  }

  /**
   * Compare phones with different persona
   */
  async comparePhonesWithPersona(
    phone1Id: string,
    phone2Id: string,
    persona: PersonaType
  ): Promise<ComparePhonesOutput> {
    return this.comparePhones(phone1Id, phone2Id, persona);
  }
}

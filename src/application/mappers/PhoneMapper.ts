/**
 * Phone Mapper
 * Converts between domain entities and data transfer objects
 */

import { PhoneEntity } from '../../domain/entities';
import { Phone as PhoneDTO } from '../../types';

export class PhoneMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toDomain(dto: PhoneDTO): PhoneEntity {
    return PhoneEntity.create(dto);
  }

  /**
   * Convert Domain Entity to DTO
   */
  static toDTO(entity: PhoneEntity): PhoneDTO {
    return entity.toRaw();
  }

  /**
   * Convert array of DTOs to Domain Entities
   */
  static toDomainList(dtos: PhoneDTO[]): PhoneEntity[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  /**
   * Convert array of Domain Entities to DTOs
   */
  static toDTOList(entities: PhoneEntity[]): PhoneDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}

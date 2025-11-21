/**
 * Comparison Mapper
 * Converts comparison domain data to presentation format
 */

import { ComparisonEntity, CategoryComparison, DifferenceHighlight } from '../../domain/entities';
import { Comparison, ComparisonInsights, CategoryScore, DifferenceHighlight as DifferenceHighlightDTO } from '../../types';
import { PhoneMapper } from './PhoneMapper';

export class ComparisonMapper {
  /**
   * Convert ComparisonEntity to Comparison DTO
   */
  static toDTO(entity: ComparisonEntity): Comparison {
    const categoryComparisons = entity.getCategoryComparisons();
    const tldr = entity.getTLDR();
    const keyDifferences = entity.getKeyDifferences();
    const personaRecommendations = entity.getPersonaRecommendations();

    const insights: ComparisonInsights = {
      tldr,
      highlights: this.mapDifferences(keyDifferences),
      categoryScores: this.mapCategoryScores(categoryComparisons),
      personaRecommendations,
      overallConfidence: 0.88,
      dataCompleteness: {
        phone1: 0.95,
        phone2: 0.93,
      },
    };

    return {
      id: entity.id,
      phone1: PhoneMapper.toDTO(entity.phone1),
      phone2: PhoneMapper.toDTO(entity.phone2),
      insights,
      activePersona: entity.persona,
      timestamp: entity.timestamp.toISOString(),
    };
  }

  /**
   * Map category comparisons to CategoryScore DTOs
   */
  private static mapCategoryScores(comparisons: CategoryComparison[]): CategoryScore[] {
    return comparisons.map((comp) => ({
      category: comp.category as any,
      phone1Score: Math.round(comp.phone1Score.value),
      phone2Score: Math.round(comp.phone2Score.value),
      winner: comp.winner,
      rationale: comp.rationale,
      supportingMetrics: [],
      confidence: 0.85,
    }));
  }

  /**
   * Map differences to DifferenceHighlight DTOs
   */
  private static mapDifferences(differences: DifferenceHighlight[]): DifferenceHighlightDTO[] {
    return differences.map((diff) => ({
      category: diff.category,
      title: diff.category,
      claim: diff.explanation,
      whyItMatters: diff.explanation,
      winner: diff.phone1Value > diff.phone2Value ? ('phone1' as const) : ('phone2' as const),
      significance: diff.significance,
      delta: {
        value: this.extractNumber(diff.phone1Value) || 0,
        unit: '',
      },
      evidence: {
        phone1Value: diff.phone1Value,
        phone2Value: diff.phone2Value,
        sourceField: diff.category,
      },
    }));
  }


  /**
   * Extract number from string
   */
  private static extractNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;

    const match = value.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }
}

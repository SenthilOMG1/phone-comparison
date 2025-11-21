/**
 * Comparison Domain Entity
 * Encapsulates the business logic for comparing two phones
 */

import { PhoneEntity } from './Phone.entity';
import { Score } from '../value-objects';
import { PersonaType } from '../../types';
import { ValidationError } from '../../shared/errors/DomainErrors';

export interface CategoryComparison {
  category: string;
  phone1Score: Score;
  phone2Score: Score;
  winner: 'phone1' | 'phone2' | 'tie';
  rationale: string;
}

export interface DifferenceHighlight {
  category: string;
  phone1Value: any;
  phone2Value: any;
  significance: 'major' | 'notable' | 'minor';
  explanation: string;
}

export class ComparisonEntity {
  private constructor(
    public readonly id: string,
    public readonly phone1: PhoneEntity,
    public readonly phone2: PhoneEntity,
    public readonly persona: PersonaType,
    public readonly timestamp: Date
  ) {
    this.validate();
  }

  static create(
    phone1: PhoneEntity,
    phone2: PhoneEntity,
    persona: PersonaType = 'photographer'
  ): ComparisonEntity {
    const id = `${phone1.id}_vs_${phone2.id}`;
    return new ComparisonEntity(id, phone1, phone2, persona, new Date());
  }

  private validate(): void {
    if (!this.phone1) {
      throw new ValidationError('Comparison requires phone1', 'phone1');
    }
    if (!this.phone2) {
      throw new ValidationError('Comparison requires phone2', 'phone2');
    }
    if (this.phone1.equals(this.phone2)) {
      throw new ValidationError('Cannot compare phone with itself');
    }
  }

  /**
   * Get persona weights
   */
  private getPersonaWeights(): Record<string, number> {
    const weights: Record<PersonaType, Record<string, number>> = {
      photographer: {
        camera: 0.45,
        performance: 0.15,
        battery: 0.15,
        display: 0.15,
        value: 0.10,
      },
      gamer: {
        performance: 0.45,
        display: 0.20,
        battery: 0.15,
        camera: 0.10,
        value: 0.10,
      },
      battery: {
        battery: 0.50,
        performance: 0.15,
        value: 0.15,
        camera: 0.10,
        display: 0.10,
      },
      value: {
        value: 0.25,
        camera: 0.20,
        performance: 0.20,
        battery: 0.20,
        display: 0.15,
      },
    };

    return weights[this.persona];
  }

  /**
   * Calculate category comparisons with persona weights
   */
  getCategoryComparisons(): CategoryComparison[] {
    const phone1Scores = this.phone1.getAllScores();
    const phone2Scores = this.phone2.getAllScores();
    const weights = this.getPersonaWeights();

    const categories = ['camera', 'performance', 'battery', 'display', 'value'];
    const rationales: Record<string, string> = {
      camera: 'Camera scores based on sensor specs, megapixels, stabilization, and professional test results.',
      performance: 'Performance evaluated using Geekbench and AnTuTu benchmark scores for real-world CPU/GPU power.',
      battery: 'Battery rating considers capacity, charging speed, and estimated usage time.',
      display: 'Display quality based on panel type, refresh rate, and peak brightness for outdoor visibility.',
      value: 'Value calculated from price-to-performance ratio considering all features and build quality.',
    };

    return categories.map((category) => {
      const score1 = phone1Scores[category];
      const score2 = phone2Scores[category];
      const weight = weights[category] || 1;

      // Apply persona weight
      const weighted1 = Score.create(score1.value * weight);
      const weighted2 = Score.create(score2.value * weight);

      const winner = Score.compareScores(weighted1, weighted2, 3);
      const winnerMapped = winner === 'first' ? 'phone1' : winner === 'second' ? 'phone2' : 'tie';

      return {
        category,
        phone1Score: weighted1,
        phone2Score: weighted2,
        winner: winnerMapped as 'phone1' | 'phone2' | 'tie',
        rationale: rationales[category] || '',
      };
    });
  }

  /**
   * Get overall winner
   */
  getOverallWinner(): 'phone1' | 'phone2' | 'depends' {
    const comparisons = this.getCategoryComparisons();

    let phone1Wins = 0;
    let phone2Wins = 0;

    comparisons.forEach((comp) => {
      if (comp.winner === 'phone1') phone1Wins++;
      if (comp.winner === 'phone2') phone2Wins++;
    });

    if (phone1Wins > phone2Wins + 1) return 'phone1';
    if (phone2Wins > phone1Wins + 1) return 'phone2';
    return 'depends';
  }

  /**
   * Generate TLDR summary
   */
  getTLDR(): { summary: string; verdict: string; winner: 'phone1' | 'phone2' | 'depends' } {
    const winner = this.getOverallWinner();
    const comparisons = this.getCategoryComparisons();

    let phone1Wins = 0;
    let phone2Wins = 0;
    comparisons.forEach((c) => {
      if (c.winner === 'phone1') phone1Wins++;
      if (c.winner === 'phone2') phone2Wins++;
    });

    let summary = '';
    let verdict = '';

    if (winner === 'phone1') {
      summary = `${this.phone1.getFullName()} is the better choice overall, winning in ${phone1Wins} out of 5 categories.`;
      verdict = `Choose ${this.phone1.getFullName()} for superior specs and performance.`;
    } else if (winner === 'phone2') {
      summary = `${this.phone2.getFullName()} takes the lead, excelling in ${phone2Wins} out of 5 categories.`;
      verdict = `Choose ${this.phone2.getFullName()} for better overall value and features.`;
    } else {
      summary = `Both phones are evenly matched with different strengths. ${this.phone1.getFullName()} and ${this.phone2.getFullName()} each excel in different areas.`;
      verdict = 'Your choice depends on which features matter most to you. Consider your persona preferences.';
    }

    return { summary, verdict, winner };
  }

  /**
   * Extract key differences between phones
   */
  getKeyDifferences(): DifferenceHighlight[] {
    const differences: DifferenceHighlight[] = [];

    // Battery capacity difference
    const battery1 = this.phone1.specs.battery.capacityMah;
    const battery2 = this.phone2.specs.battery.capacityMah;
    const batteryDiff = Math.abs(battery1 - battery2);
    if (batteryDiff >= 500) {
      differences.push({
        category: 'Battery Capacity',
        phone1Value: `${battery1} mAh`,
        phone2Value: `${battery2} mAh`,
        significance: batteryDiff >= 1000 ? 'major' : 'notable',
        explanation: `${batteryDiff} mAh difference means ${battery1 > battery2 ? this.phone1.getFullName() : this.phone2.getFullName()} lasts longer on a single charge.`,
      });
    }

    // Display refresh rate
    const refresh1 = this.phone1.specs.display.refreshRate;
    const refresh2 = this.phone2.specs.display.refreshRate;
    if (refresh1 !== refresh2) {
      differences.push({
        category: 'Refresh Rate',
        phone1Value: `${refresh1}Hz`,
        phone2Value: `${refresh2}Hz`,
        significance: Math.abs(refresh1 - refresh2) >= 60 ? 'major' : 'notable',
        explanation: `${Math.max(refresh1, refresh2)}Hz display provides smoother scrolling and animations.`,
      });
    }

    // Camera megapixels
    const camera1Mp = this.phone1.specs.camera.main.megapixels;
    const camera2Mp = this.phone2.specs.camera.main.megapixels;
    const mpDiff = Math.abs(camera1Mp - camera2Mp);
    if (mpDiff >= 30) {
      differences.push({
        category: 'Main Camera',
        phone1Value: `${camera1Mp}MP`,
        phone2Value: `${camera2Mp}MP`,
        significance: mpDiff >= 100 ? 'major' : 'notable',
        explanation: `Higher megapixel count allows for more detailed photos and better digital zoom.`,
      });
    }

    // Price difference
    const price1 = this.phone1.getBasePrice();
    const price2 = this.phone2.getBasePrice();
    if (price1 && price2) {
      const priceDiff = Math.abs(price1.amount - price2.amount);
      if (priceDiff >= 5000) {
        differences.push({
          category: 'Price',
          phone1Value: price1.format(),
          phone2Value: price2.format(),
          significance: priceDiff >= 15000 ? 'major' : priceDiff >= 10000 ? 'notable' : 'minor',
          explanation: `${price1.isCheaperThan(price2) ? this.phone1.getFullName() : this.phone2.getFullName()} costs ${priceDiff.toLocaleString()} MUR less.`,
        });
      }
    }

    // Sort by significance and return top 6
    const significanceOrder = { major: 3, notable: 2, minor: 1 };
    return differences
      .sort((a, b) => significanceOrder[b.significance] - significanceOrder[a.significance])
      .slice(0, 6);
  }

  /**
   * Generate persona recommendations
   */
  getPersonaRecommendations(): Array<{
    persona: PersonaType;
    recommendedPhone: string;
    reason: string;
    confidence: number;
  }> {
    const personas: PersonaType[] = ['photographer', 'gamer', 'battery', 'value'];

    return personas.map((persona) => {
      // Create temporary comparison with this persona
      const tempComparison = ComparisonEntity.create(this.phone1, this.phone2, persona);
      const winner = tempComparison.getOverallWinner();

      let recommendedPhone = winner === 'phone1' ? this.phone1.id : this.phone2.id;
      const recommendedEntity = winner === 'phone1' ? this.phone1 : this.phone2;

      // For "depends", recommend based on strongest category
      if (winner === 'depends') {
        recommendedPhone = this.phone1.id;
      }

      const reasons: Record<PersonaType, string> = {
        photographer: `${recommendedEntity.getFullName()} offers superior camera capabilities with better sensors and image processing.`,
        gamer: `${recommendedEntity.getFullName()} delivers higher benchmark scores and better GPU performance for gaming.`,
        battery: `${recommendedEntity.getFullName()} provides longer battery life and faster charging for all-day use.`,
        value: `${recommendedEntity.getFullName()} offers the best value with balanced specs at a competitive price.`,
      };

      return {
        persona,
        recommendedPhone,
        reason: reasons[persona],
        confidence: winner === 'depends' ? 0.5 : 0.85,
      };
    });
  }
}

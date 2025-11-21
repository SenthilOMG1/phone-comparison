/**
 * Score Value Object
 * Immutable representation of a normalized score (0-100)
 * Used for phone category scoring (camera, performance, battery, etc.)
 */

export class Score {
  private constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error(`Score must be between 0 and 100, got ${value}`);
    }
  }

  static create(value: number): Score {
    // Round to 2 decimal places
    const rounded = Math.round(value * 100) / 100;
    return new Score(rounded);
  }

  static fromPercentage(percentage: number): Score {
    return new Score(Math.min(100, Math.max(0, percentage)));
  }

  static zero(): Score {
    return new Score(0);
  }

  static perfect(): Score {
    return new Score(100);
  }

  /**
   * Apply a weight multiplier to the score
   */
  applyWeight(weight: number): Score {
    if (weight < 0 || weight > 1) {
      throw new Error('Weight must be between 0 and 1');
    }
    return Score.create(this.value * weight);
  }

  /**
   * Calculate difference from another score
   */
  difference(other: Score): number {
    return Math.abs(this.value - other.value);
  }

  /**
   * Check if score is significantly higher than another
   * @param threshold Minimum difference to be considered significant (default: 5)
   */
  isSignificantlyHigherThan(other: Score, threshold: number = 5): boolean {
    return this.value - other.value >= threshold;
  }

  /**
   * Compare scores and determine winner
   */
  static compareScores(score1: Score, score2: Score, threshold: number = 3): 'first' | 'second' | 'tie' {
    const diff = score1.value - score2.value;
    if (Math.abs(diff) < threshold) return 'tie';
    return diff > 0 ? 'first' : 'second';
  }

  /**
   * Get grade letter based on score
   */
  getGrade(): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (this.value >= 95) return 'A+';
    if (this.value >= 85) return 'A';
    if (this.value >= 70) return 'B';
    if (this.value >= 50) return 'C';
    if (this.value >= 30) return 'D';
    return 'F';
  }

  /**
   * Format score for display
   */
  format(): string {
    return `${Math.round(this.value)}`;
  }

  toPercentage(): string {
    return `${Math.round(this.value)}%`;
  }

  equals(other: Score): boolean {
    return this.value === other.value;
  }

  toJSON(): number {
    return this.value;
  }
}

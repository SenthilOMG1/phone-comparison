/**
 * Benchmark Value Object
 * Represents benchmark test results (Geekbench, AnTuTu, etc.)
 * Immutable with validation
 */

export interface BenchmarkRange {
  min: number;
  median: number;
  max: number;
}

export class Benchmark {
  private constructor(
    public readonly name: string,
    public readonly score: number,
    public readonly range?: BenchmarkRange
  ) {
    if (score < 0) {
      throw new Error('Benchmark score cannot be negative');
    }
  }

  static create(name: string, score: number, range?: BenchmarkRange): Benchmark {
    return new Benchmark(name, score, range);
  }

  static createWithRange(name: string, min: number, median: number, max: number): Benchmark {
    return new Benchmark(name, median, { min, median, max });
  }

  /**
   * Normalize benchmark score to 0-100 scale
   */
  normalize(minValue: number, maxValue: number): number {
    if (minValue >= maxValue) {
      throw new Error('Invalid normalization range');
    }
    const normalized = ((this.score - minValue) / (maxValue - minValue)) * 100;
    return Math.max(0, Math.min(100, normalized));
  }

  /**
   * Compare with another benchmark
   */
  compareWith(other: Benchmark): number {
    return ((this.score - other.score) / other.score) * 100;
  }

  /**
   * Check if score is within expected range
   */
  isWithinRange(): boolean {
    if (!this.range) return true;
    return this.score >= this.range.min && this.score <= this.range.max;
  }

  /**
   * Get performance tier
   */
  getTier(thresholds: { flagship: number; midrange: number; budget: number }): 'flagship' | 'midrange' | 'budget' | 'entry' {
    if (this.score >= thresholds.flagship) return 'flagship';
    if (this.score >= thresholds.midrange) return 'midrange';
    if (this.score >= thresholds.budget) return 'budget';
    return 'entry';
  }

  format(): string {
    if (this.range) {
      return `${Math.round(this.score)} (${Math.round(this.range.min)}-${Math.round(this.range.max)})`;
    }
    return Math.round(this.score).toLocaleString();
  }

  equals(other: Benchmark): boolean {
    return this.name === other.name && this.score === other.score;
  }

  toJSON() {
    return {
      name: this.name,
      score: this.score,
      range: this.range,
    };
  }
}

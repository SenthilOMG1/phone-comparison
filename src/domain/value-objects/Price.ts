/**
 * Price Value Object
 * Immutable representation of money with currency
 * Enforces business rules: no negative prices, currency consistency
 */

export class Price {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a valid 3-letter code');
    }
  }

  static create(amount: number, currency: string = 'MUR'): Price {
    return new Price(amount, currency);
  }

  static zero(currency: string = 'MUR'): Price {
    return new Price(0, currency);
  }

  /**
   * Add two prices (must be same currency)
   */
  add(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add prices with different currencies: ${this.currency} vs ${other.currency}`);
    }
    return new Price(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract prices (must be same currency)
   */
  subtract(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract prices with different currencies: ${this.currency} vs ${other.currency}`);
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Subtraction would result in negative price');
    }
    return new Price(result, this.currency);
  }

  /**
   * Calculate discount percentage
   */
  discountFrom(originalPrice: Price): number {
    if (this.currency !== originalPrice.currency) {
      throw new Error('Cannot calculate discount with different currencies');
    }
    if (originalPrice.amount === 0) return 0;
    return Math.round(((originalPrice.amount - this.amount) / originalPrice.amount) * 100);
  }

  /**
   * Check if this price is cheaper than another
   */
  isCheaperThan(other: Price): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare prices with different currencies');
    }
    return this.amount < other.amount;
  }

  /**
   * Format price for display
   */
  format(locale: string = 'en-MU'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(this.amount);
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}

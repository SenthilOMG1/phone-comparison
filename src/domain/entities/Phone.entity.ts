/**
 * Phone Domain Entity
 * Rich domain model with business logic
 * Encapsulates phone data and behavior
 */

import { Phone as PhoneType, PhoneSpecs } from '../../types';
import { Price, Score, Benchmark } from '../value-objects';
import { ValidationError } from '../../shared/errors/DomainErrors';

export class PhoneEntity {
  private constructor(
    public readonly id: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly specs: PhoneSpecs,
    public readonly pricing?: { basePrice: number; currency: string }[],
    public readonly benchmarks?: any,
    public readonly releaseDate?: string,
    public readonly images?: { hero: string; gallery?: string[] },
    private readonly rawData?: PhoneType
  ) {
    this.validate();
  }

  /**
   * Create new Phone entity from raw data
   */
  static create(data: PhoneType): PhoneEntity {
    return new PhoneEntity(
      data.id,
      data.brand,
      data.model,
      data.specs,
      data.pricing,
      data.benchmarks,
      data.releaseDate,
      data.images,
      data
    );
  }

  /**
   * Validate entity invariants
   */
  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new ValidationError('Phone must have a valid ID', 'id', this.id);
    }
    if (!this.brand || this.brand.trim() === '') {
      throw new ValidationError('Phone must have a brand', 'brand', this.brand);
    }
    if (!this.model || this.model.trim() === '') {
      throw new ValidationError('Phone must have a model', 'model', this.model);
    }
  }

  /**
   * Get base price as Price value object
   */
  getBasePrice(): Price | null {
    if (!this.pricing || this.pricing.length === 0) {
      return null;
    }
    const price = this.pricing[0];
    return Price.create(price.basePrice, price.currency);
  }

  /**
   * Get all prices
   */
  getAllPrices(): Price[] {
    if (!this.pricing) return [];
    return this.pricing.map((p) => Price.create(p.basePrice, p.currency));
  }

  /**
   * Calculate camera score
   */
  calculateCameraScore(): Score {
    const camera = this.specs.camera;
    const cameraScore = this.specs.cameraScore;

    // If professional score exists, use it
    if (cameraScore?.overall) {
      return Score.create((cameraScore.overall / 160) * 100);
    }

    // Otherwise calculate from specs
    const mainMp = camera.main.megapixels;
    const sensorSize = camera.main.sensorSize || 0.7;
    const aperture = camera.main.aperture;

    // Simple scoring algorithm
    const mpScore = Math.min(100, (mainMp / 200) * 100);
    const sensorScore = Math.min(100, (sensorSize / 1.5) * 100);
    const apertureScore = Math.min(100, ((3.0 - aperture) / 1.5) * 100);

    const weighted = mpScore * 0.4 + sensorScore * 0.4 + apertureScore * 0.2;
    return Score.create(weighted);
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(): Score {
    if (!this.benchmarks?.geekbench || !this.benchmarks?.antutu) {
      return Score.create(50); // Default score
    }

    const gbSingle = Benchmark.create(
      'Geekbench Single',
      this.benchmarks.geekbench.singleCore.median
    );
    const gbMulti = Benchmark.create(
      'Geekbench Multi',
      this.benchmarks.geekbench.multiCore.median
    );
    const antutu = Benchmark.create(
      'AnTuTu',
      this.benchmarks.antutu.total.median
    );

    // Normalize to 0-100 scale
    const singleScore = gbSingle.normalize(500, 2500);
    const multiScore = gbMulti.normalize(2000, 8000);
    const antutuScore = antutu.normalize(300000, 1500000);

    const weighted = singleScore * 0.3 + multiScore * 0.3 + antutuScore * 0.4;
    return Score.create(weighted);
  }

  /**
   * Calculate battery score
   */
  calculateBatteryScore(): Score {
    const battery = this.specs.battery;

    // Normalize battery capacity (3000-6000 mAh range)
    const capacityScore = Math.min(100, ((battery.capacityMah - 3000) / 3000) * 100);

    // Charging speed score
    const wiredCharging = battery.wiredCharging || 0;
    const chargingScore = Math.min(100, (wiredCharging / 120) * 100);

    // Wireless charging bonus
    const wirelessBonus = battery.wirelessCharging ? 10 : 0;

    const weighted = capacityScore * 0.7 + chargingScore * 0.2 + wirelessBonus;
    return Score.create(Math.min(100, weighted));
  }

  /**
   * Calculate display score
   */
  calculateDisplayScore(): Score {
    const display = this.specs.display;

    // Display type score
    const typeScores: Record<string, number> = {
      'LTPO OLED': 100,
      'LTPO AMOLED': 100,
      'AMOLED': 90,
      'Super AMOLED': 90,
      'OLED': 85,
      'IPS': 70,
      'LCD': 60,
    };
    const typeScore = typeScores[display.type] || 70;

    // Refresh rate score
    const refreshScore = Math.min(100, (display.refreshRate / 144) * 100);

    // Brightness score
    const brightnessScore = Math.min(
      100,
      ((display.peakBrightness || 1000) / 2000) * 100
    );

    const weighted = typeScore * 0.5 + refreshScore * 0.25 + brightnessScore * 0.25;
    return Score.create(weighted);
  }

  /**
   * Calculate value score (price-to-performance ratio)
   */
  calculateValueScore(): Score {
    const basePrice = this.getBasePrice();
    if (!basePrice) return Score.create(50);

    // Get average of other scores
    const perfScore = this.calculatePerformanceScore();
    const cameraScore = this.calculateCameraScore();
    const batteryScore = this.calculateBatteryScore();

    const avgFeatureScore = (perfScore.value + cameraScore.value + batteryScore.value) / 3;

    // Value ratio: features per 1000 currency units
    const valueRatio = avgFeatureScore / (basePrice.amount / 1000);

    return Score.create(Math.min(100, valueRatio * 10));
  }

  /**
   * Get all category scores
   */
  getAllScores(): Record<string, Score> {
    return {
      camera: this.calculateCameraScore(),
      performance: this.calculatePerformanceScore(),
      battery: this.calculateBatteryScore(),
      display: this.calculateDisplayScore(),
      value: this.calculateValueScore(),
    };
  }

  /**
   * Get full name (brand + model)
   */
  getFullName(): string {
    return `${this.brand} ${this.model}`;
  }

  /**
   * Check if phone is flagship tier
   */
  isFlagship(): boolean {
    const perfScore = this.calculatePerformanceScore();
    const basePrice = this.getBasePrice();
    return perfScore.value >= 85 && (basePrice?.amount || 0) >= 40000;
  }

  /**
   * Get the raw data (for compatibility with existing code)
   */
  toRaw(): PhoneType {
    return this.rawData || ({
      id: this.id,
      brand: this.brand,
      model: this.model,
      specs: this.specs,
      pricing: this.pricing,
      benchmarks: this.benchmarks,
      releaseDate: this.releaseDate || '',
      images: this.images || { hero: '' },
      variant: 'global',
    } as PhoneType);
  }

  equals(other: PhoneEntity): boolean {
    return this.id === other.id;
  }
}

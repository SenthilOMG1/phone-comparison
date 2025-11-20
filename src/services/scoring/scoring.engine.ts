import { Phone, PersonaType } from '../../types';
import { personasConfig } from '../../config/personas.config';
import { scoringConfig } from '../../config/scoring.config';
import { calculateCategoryScore } from '../../utils';

export interface CategoryScoreResult {
  category: string;
  phone1Score: number;
  phone2Score: number;
  winner: 'phone1' | 'phone2' | 'tie';
}

function calculateCameraScore(phone: Phone): number {
  const camera = phone.specs.camera;
  const cameraScore = phone.specs.cameraScore;

  if (cameraScore) {
    return Math.min(100, (cameraScore.overall / 160) * 100);
  }

  const metrics = {
    mainMegapixels: camera.main.megapixels,
    sensorSize: camera.main.sensorSize || 0.7,
    aperture: 3.0 - camera.main.aperture,
  };

  return calculateCategoryScore(metrics, scoringConfig.cameraWeights, scoringConfig.normalizationRanges.camera);
}

function calculatePerformanceScore(phone: Phone): number {
  const benchmarks = phone.benchmarks;

  if (!benchmarks?.geekbench || !benchmarks?.antutu) {
    return 50;
  }

  const metrics = {
    geekbenchSingle: benchmarks.geekbench.singleCore.median,
    geekbenchMulti: benchmarks.geekbench.multiCore.median,
    antutuTotal: benchmarks.antutu.total.median,
  };

  return calculateCategoryScore(metrics, scoringConfig.performanceWeights, scoringConfig.normalizationRanges.performance);
}

function calculateBatteryScore(phone: Phone): number {
  const battery = phone.specs.battery;

  const metrics = {
    capacity: battery.capacityMah,
    wiredCharging: battery.wiredCharging || 0,
    wirelessCharging: battery.wirelessCharging || 0,
  };

  return calculateCategoryScore(metrics, scoringConfig.batteryWeights, scoringConfig.normalizationRanges.battery);
}

function calculateDisplayScore(phone: Phone): number {
  const display = phone.specs.display;

  const typeScores: Record<string, number> = {
    'LTPO OLED': 100,
    'LTPO AMOLED': 100,
    'AMOLED': 90,
    'Super AMOLED': 90,
    'OLED': 85,
    'IPS': 70,
    'LCD': 60,
  };

  const metrics = {
    refreshRate: display.refreshRate,
    brightness: display.peakBrightness || 1000,
  };

  const baseScore = calculateCategoryScore(metrics, scoringConfig.displayWeights, scoringConfig.normalizationRanges.display);
  const typeScore = typeScores[display.type] || 70;

  return Math.round(baseScore * 0.7 + typeScore * 0.3);
}

function calculateValueScore(phone: Phone): number {
  const pricing = phone.pricing?.[0];
  if (!pricing) return 50;

  const price = pricing.basePrice;
  const performanceScore = calculatePerformanceScore(phone);
  const cameraScore = calculateCameraScore(phone);
  const batteryScore = calculateBatteryScore(phone);

  const avgFeatureScore = (performanceScore + cameraScore + batteryScore) / 3;

  const valueRatio = avgFeatureScore / (price / 10);

  return Math.min(100, valueRatio * 10);
}

export function calculateAllScores(
  phone1: Phone,
  phone2: Phone,
  persona: PersonaType = 'photographer'
): Record<string, CategoryScoreResult> {
  const results: Record<string, CategoryScoreResult> = {};

  const categories = ['camera', 'performance', 'battery', 'display', 'value'];

  categories.forEach((category) => {
    let phone1Score = 0;
    let phone2Score = 0;

    switch (category) {
      case 'camera':
        phone1Score = calculateCameraScore(phone1);
        phone2Score = calculateCameraScore(phone2);
        break;
      case 'performance':
        phone1Score = calculatePerformanceScore(phone1);
        phone2Score = calculatePerformanceScore(phone2);
        break;
      case 'battery':
        phone1Score = calculateBatteryScore(phone1);
        phone2Score = calculateBatteryScore(phone2);
        break;
      case 'display':
        phone1Score = calculateDisplayScore(phone1);
        phone2Score = calculateDisplayScore(phone2);
        break;
      case 'value':
        phone1Score = calculateValueScore(phone1);
        phone2Score = calculateValueScore(phone2);
        break;
    }

    const personaWeights = personasConfig.personas[persona].weights;
    const weight = personaWeights[category as keyof typeof personaWeights] || 1;

    phone1Score = Math.round(phone1Score * weight * 100) / 100;
    phone2Score = Math.round(phone2Score * weight * 100) / 100;

    let winner: 'phone1' | 'phone2' | 'tie' = 'tie';
    const diff = Math.abs(phone1Score - phone2Score);
    if (diff > 3) {
      winner = phone1Score > phone2Score ? 'phone1' : 'phone2';
    }

    results[category] = {
      category,
      phone1Score: Math.round(phone1Score),
      phone2Score: Math.round(phone2Score),
      winner,
    };
  });

  return results;
}

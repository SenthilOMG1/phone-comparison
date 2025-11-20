import { SignificanceLevel } from '../../types';

export interface DeltaResult {
  absolute: number;
  percentage: number;
  significance: SignificanceLevel;
}

export function calculateDelta(value1: number, value2: number, thresholds = { major: 0.25, notable: 0.10, minor: 0.05 }): DeltaResult {
  const max = Math.max(value1, value2);
  const absolute = Math.abs(value1 - value2);
  const percentage = max > 0 ? absolute / max : 0;

  let significance: SignificanceLevel = 'none';
  if (percentage >= thresholds.major) {
    significance = 'major';
  } else if (percentage >= thresholds.notable) {
    significance = 'notable';
  } else if (percentage >= thresholds.minor) {
    significance = 'minor';
  }

  return {
    absolute,
    percentage,
    significance,
  };
}

export function calculatePercentageDifference(value1: number, value2: number): number {
  if (value2 === 0) return 0;
  return ((value1 - value2) / value2) * 100;
}

export function compareValues(value1: number, value2: number): 'greater' | 'less' | 'equal' {
  if (Math.abs(value1 - value2) < 0.01) return 'equal';
  return value1 > value2 ? 'greater' : 'less';
}

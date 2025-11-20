export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(100, normalized * 100));
}

export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  return weightedSum / totalWeight;
}

export function calculateCategoryScore(metrics: Record<string, number>, weights: Record<string, number>, ranges: Record<string, { min: number; max: number }>): number {
  const normalizedValues: number[] = [];
  const weightValues: number[] = [];

  Object.keys(metrics).forEach((key) => {
    if (weights[key] !== undefined && ranges[key]) {
      const normalizedValue = normalize(metrics[key], ranges[key].min, ranges[key].max);
      normalizedValues.push(normalizedValue);
      weightValues.push(weights[key]);
    }
  });

  return Math.round(weightedAverage(normalizedValues, weightValues));
}

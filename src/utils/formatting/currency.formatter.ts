export function formatCurrency(amount: number, currency: string = 'MUR'): string {
  return new Intl.NumberFormat('en-MU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(amount: number, currency: string = 'MUR', region?: string): string {
  const formatted = formatCurrency(amount, currency);
  return region ? `${formatted} (${region})` : formatted;
}

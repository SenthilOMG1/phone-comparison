export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatStorage(gb: number): string {
  if (gb >= 1024) {
    return `${gb / 1024}TB`;
  }
  return `${gb}GB`;
}

export function formatBattery(mah: number): string {
  return `${formatNumber(mah)}mAh`;
}

export function formatWeight(grams: number): string {
  return `${grams}g`;
}

export function formatDimensions(heightMm: number, widthMm: number, thicknessMm: number): string {
  return `${heightMm} × ${widthMm} × ${thicknessMm}mm`;
}

export function formatRefreshRate(hz: number): string {
  return `${hz}Hz`;
}

export function formatCharging(watts: number): string {
  return `${watts}W`;
}

export function formatResolution(width: number, height: number): string {
  return `${width} × ${height}`;
}

export function formatAperture(aperture: number): string {
  return `f/${aperture}`;
}

export function formatMegapixels(mp: number): string {
  return `${mp}MP`;
}

export function formatZoom(zoom: number): string {
  return `${zoom}x`;
}

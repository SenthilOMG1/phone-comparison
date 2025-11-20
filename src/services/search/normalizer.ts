export function normalizeModelName(input: string): string {
  let normalized = input.toLowerCase().trim();

  normalized = normalized.replace(/[^\w\s]/g, ' ');

  const microTokens = ['global', '4g', '5g', 'nfc', 'cn', 'eu', 'us', 'dual', 'sim'];
  microTokens.forEach((token) => {
    const regex = new RegExp(`\\b${token}\\b`, 'gi');
    normalized = normalized.replace(regex, '');
  });

  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

export function expandShorthand(input: string): string {
  const expansions: Record<string, string> = {
    'pro+': 'pro plus',
    'mag': 'magic',
    'gal': 'galaxy',
    's24u': 's24 ultra',
    's23u': 's23 ultra',
    'x9a': 'x9a',
  };

  let expanded = input.toLowerCase();

  Object.entries(expansions).forEach(([short, full]) => {
    const regex = new RegExp(`\\b${short}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  });

  return expanded;
}

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

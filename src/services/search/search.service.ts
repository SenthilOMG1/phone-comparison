import Fuse from 'fuse.js';
import { Phone, PhoneSearchResult } from '../../types';
import { allPhones } from '../../data';
import { normalizeModelName, expandShorthand, tokenize } from './normalizer';
import { similarityScore, tokenSetRatio } from './fuzzy.matcher';

const fuseOptions = {
  keys: [
    { name: 'brand', weight: 0.3 },
    { name: 'model', weight: 0.5 },
    { name: 'series', weight: 0.2 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

const fuse = new Fuse(allPhones, fuseOptions);

export function searchPhones(query: string, maxResults: number = 10): PhoneSearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = normalizeModelName(query);
  const expandedQuery = expandShorthand(normalizedQuery);
  const queryTokens = tokenize(expandedQuery);

  const fuseResults = fuse.search(expandedQuery, { limit: maxResults * 2 });

  const scoredResults: PhoneSearchResult[] = fuseResults.map((result) => {
    const phone = result.item;
    const phoneString = `${phone.brand} ${phone.model}`.toLowerCase();
    const phoneTokens = tokenize(phoneString);

    const stringScore = similarityScore(expandedQuery, phoneString);
    const tokenScore = tokenSetRatio(queryTokens, phoneTokens);
    const fuseScore = 1 - (result.score || 1);

    const combinedScore = stringScore * 0.3 + tokenScore * 0.4 + fuseScore * 0.3;

    const matchType = combinedScore > 0.9 ? 'exact' : combinedScore > 0.6 ? 'fuzzy' : 'partial';

    const matchedFields: string[] = [];
    if (phoneTokens.some((token) => queryTokens.includes(token))) {
      matchedFields.push('model', 'brand');
    }

    return {
      phone,
      confidence: combinedScore,
      matchType,
      matchedFields,
    };
  });

  scoredResults.sort((a, b) => b.confidence - a.confidence);

  return scoredResults.slice(0, maxResults);
}

export function getPhoneById(id: string): Phone | undefined {
  return allPhones.find((phone) => phone.id === id);
}

export function getPhonesByBrand(brand: string): Phone[] {
  return allPhones.filter((phone) => phone.brand.toLowerCase() === brand.toLowerCase());
}

export function getAllPhones(): Phone[] {
  return allPhones;
}

export function getHonorPhones(): Phone[] {
  return getPhonesByBrand('Honor');
}

export function getCompetitorPhones(): Phone[] {
  return allPhones.filter((phone) => phone.brand.toLowerCase() !== 'honor');
}

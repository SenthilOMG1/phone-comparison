import { PhoneSpecs } from './specs.types';
import { BenchmarkData } from './benchmark.types';

export type PhoneVariantType = 'global' | 'china' | 'india' | 'europe' | 'us';

export interface PhoneVariant {
  type: PhoneVariantType;
  label: string;
  differences: string[];
  specs?: Partial<PhoneSpecs>;
}

export interface PhonePricing {
  currency: string;
  basePrice: number;
  variants: {
    configuration: string;
    price: number;
  }[];
  region: string;
}

export interface PhoneReview {
  source: string;
  excerpt: string;
  rating?: number;
  url?: string;
  category?: 'camera' | 'performance' | 'battery' | 'display' | 'general';
}

export interface Phone {
  id: string;
  brand: string;
  model: string;
  series?: string;
  releaseDate: string;
  variant: PhoneVariantType;
  variants?: PhoneVariant[];
  images: {
    hero: string;
    gallery?: string[];
  };
  specs: PhoneSpecs;
  benchmarks?: BenchmarkData;
  pricing?: PhonePricing[];
  reviews?: PhoneReview[];
  badges?: string[];
  popularity?: number;
}

export interface PhoneSearchResult {
  phone: Phone;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
  matchedFields: string[];
}

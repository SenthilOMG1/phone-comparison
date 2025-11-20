import { Phone } from './phone.types';
import { PersonaType, PersonaRecommendation } from './persona.types';

export type SignificanceLevel = 'major' | 'notable' | 'minor' | 'none';

export interface DifferenceHighlight {
  category: string;
  title: string;
  claim: string;
  whyItMatters: string;
  winner: 'phone1' | 'phone2' | 'tie';
  significance: SignificanceLevel;
  delta?: {
    value: number;
    unit: string;
    percentage?: number;
  };
  evidence: {
    phone1Value: string | number;
    phone2Value: string | number;
    sourceField: string;
  };
}

export interface CategoryScore {
  category: 'camera' | 'battery' | 'display' | 'performance' | 'value';
  phone1Score: number;
  phone2Score: number;
  winner: 'phone1' | 'phone2' | 'tie';
  rationale: string;
  supportingMetrics: string[];
  confidence: number;
}

export interface ComparisonInsights {
  tldr: {
    summary: string;
    verdict: string;
    winner: 'phone1' | 'phone2' | 'depends';
  };
  highlights: DifferenceHighlight[];
  categoryScores: CategoryScore[];
  personaRecommendations: PersonaRecommendation[];
  overallConfidence: number;
  dataCompleteness: {
    phone1: number;
    phone2: number;
  };
}

export interface Comparison {
  id: string;
  phone1: Phone;
  phone2: Phone;
  insights: ComparisonInsights;
  activePersona: PersonaType;
  timestamp: string;
}

export interface ComparisonState {
  phone1?: Phone;
  phone2?: Phone;
  activePersona: PersonaType;
  showDifferencesOnly: boolean;
  viewMode: 'quick' | 'deep';
}

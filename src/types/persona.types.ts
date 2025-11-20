export type PersonaType = 'photographer' | 'gamer' | 'battery' | 'value';

export interface PersonaWeights {
  camera: number;
  performance: number;
  battery: number;
  display: number;
  value: number;
}

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
  icon: string;
  weights: PersonaWeights;
  priorities: string[];
}

export interface PersonaConfig {
  personas: Record<PersonaType, Persona>;
  default: PersonaType;
}

export interface PersonaRecommendation {
  persona: PersonaType;
  recommendedPhone: string;
  reason: string;
  confidence: number;
}

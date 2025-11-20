import { Phone, Comparison, ComparisonInsights, PersonaType } from '../../types';
import { extractDifferences } from './difference.engine';
import { calculateAllScores } from '../scoring/scoring.engine';

function generateTLDR(phone1: Phone, phone2: Phone, categoryScores: Record<string, any>): ComparisonInsights['tldr'] {
  let phone1Wins = 0;
  let phone2Wins = 0;

  Object.values(categoryScores).forEach((score: any) => {
    if (score.winner === 'phone1') phone1Wins++;
    if (score.winner === 'phone2') phone2Wins++;
  });

  let winner: 'phone1' | 'phone2' | 'depends' = 'depends';
  let summary = '';
  let verdict = '';

  if (phone1Wins > phone2Wins + 1) {
    winner = 'phone1';
    summary = `${phone1.brand} ${phone1.model} is the better choice overall, winning in ${phone1Wins} out of 5 categories.`;
    verdict = `Choose ${phone1.brand} ${phone1.model} for superior specs and performance.`;
  } else if (phone2Wins > phone1Wins + 1) {
    winner = 'phone2';
    summary = `${phone2.brand} ${phone2.model} takes the lead, excelling in ${phone2Wins} out of 5 categories.`;
    verdict = `Choose ${phone2.brand} ${phone2.model} for better overall value and features.`;
  } else {
    winner = 'depends';
    summary = `Both phones are evenly matched with different strengths. ${phone1.brand} ${phone1.model} and ${phone2.brand} ${phone2.model} each excel in different areas.`;
    verdict = 'Your choice depends on which features matter most to you. Consider your persona preferences.';
  }

  return { summary, verdict, winner };
}

function generatePersonaRecommendations(phone1: Phone, phone2: Phone) {
  const personas: PersonaType[] = ['photographer', 'gamer', 'battery', 'value'];

  return personas.map((persona) => {
    const scores = calculateAllScores(phone1, phone2, persona);

    let totalP1 = 0;
    let totalP2 = 0;

    Object.values(scores).forEach((score) => {
      totalP1 += score.phone1Score;
      totalP2 += score.phone2Score;
    });

    const recommended = totalP1 > totalP2 ? phone1.id : phone2.id;
    const recommendedPhone = totalP1 > totalP2 ? phone1 : phone2;
    const difference = Math.abs(totalP1 - totalP2);

    let reason = '';
    if (persona === 'photographer') {
      reason = `${recommendedPhone.brand} ${recommendedPhone.model} offers superior camera capabilities with better sensors and image processing.`;
    } else if (persona === 'gamer') {
      reason = `${recommendedPhone.brand} ${recommendedPhone.model} delivers higher benchmark scores and better GPU performance for gaming.`;
    } else if (persona === 'battery') {
      reason = `${recommendedPhone.brand} ${recommendedPhone.model} provides longer battery life and faster charging for all-day use.`;
    } else {
      reason = `${recommendedPhone.brand} ${recommendedPhone.model} offers the best value with balanced specs at a competitive price.`;
    }

    return {
      persona,
      recommendedPhone: recommended,
      reason,
      confidence: Math.min(1, difference / 100),
    };
  });
}

export function createComparison(phone1: Phone, phone2: Phone, activePersona: PersonaType = 'photographer'): Comparison {
  const highlights = extractDifferences(phone1, phone2);
  const categoryScores = calculateAllScores(phone1, phone2, activePersona);

  const categoryScoresArray = Object.entries(categoryScores).map(([category, scores]) => {
    let rationale = '';

    if (category === 'camera') {
      rationale = `Camera scores based on sensor specs, megapixels, stabilization, and professional test results.`;
    } else if (category === 'performance') {
      rationale = `Performance evaluated using Geekbench and AnTuTu benchmark scores for real-world CPU/GPU power.`;
    } else if (category === 'battery') {
      rationale = `Battery rating considers capacity, charging speed, and estimated usage time.`;
    } else if (category === 'display') {
      rationale = `Display quality based on panel type, refresh rate, and peak brightness for outdoor visibility.`;
    } else if (category === 'value') {
      rationale = `Value calculated from price-to-performance ratio considering all features and build quality.`;
    }

    return {
      category: category as any,
      phone1Score: scores.phone1Score,
      phone2Score: scores.phone2Score,
      winner: scores.winner,
      rationale,
      supportingMetrics: [],
      confidence: 0.85,
    };
  });

  const tldr = generateTLDR(phone1, phone2, categoryScores);
  const personaRecommendations = generatePersonaRecommendations(phone1, phone2);

  const insights: ComparisonInsights = {
    tldr,
    highlights,
    categoryScores: categoryScoresArray,
    personaRecommendations,
    overallConfidence: 0.88,
    dataCompleteness: {
      phone1: 0.95,
      phone2: 0.93,
    },
  };

  return {
    id: `${phone1.id}_vs_${phone2.id}`,
    phone1,
    phone2,
    insights,
    activePersona,
    timestamp: new Date().toISOString(),
  };
}

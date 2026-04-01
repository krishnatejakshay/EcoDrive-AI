import { User, TyreScan, DetectedProblem, Recommendation, DrivingLog } from '../types';

export function calculateEcoScore(data: {
  tyreVisualCondition: number;
  braking: string;
  acceleration: string;
  speed: number;
  idleTime: number;
  improvedFromLastWeek?: boolean;
}) {
  let score = 100;
  
  if (data.tyreVisualCondition < 40) score -= 25;
  else if (data.tyreVisualCondition < 60) score -= 15;
  else if (data.tyreVisualCondition < 80) score -= 10;
  else if (data.tyreVisualCondition > 90) score += 5;
  
  if (data.braking === 'frequent') score -= 15;
  if (data.acceleration === 'aggressive') score -= 10;
  if (data.speed > 80) score -= 10;
  if (data.idleTime > 10) score -= 5;
  
  if (data.acceleration === 'smooth') score += 5;
  if (data.improvedFromLastWeek) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

export function calculateFuelWaste(data: {
  tyreVisualCondition: number;
  speed: number;
  braking: string;
  acceleration: string;
  monthlyKm: number;
  fuelPrice: number;
}) {
  const baseEfficiency = 15; // km/L
  let efficiency = baseEfficiency;
  
  if (data.tyreVisualCondition < 40) efficiency *= 0.75;
  else if (data.tyreVisualCondition < 60) efficiency *= 0.85;
  else if (data.tyreVisualCondition < 80) efficiency *= 0.90;
  
  if (data.speed > 80) efficiency *= 0.85;
  if (data.braking === 'frequent') efficiency *= 0.80;
  if (data.acceleration === 'aggressive') efficiency *= 0.75;
  
  const fuelNeeded = data.monthlyKm / efficiency;
  const fuelCost = fuelNeeded * data.fuelPrice;
  
  const optimalFuelNeeded = data.monthlyKm / baseEfficiency;
  const optimalCost = optimalFuelNeeded * data.fuelPrice;
  
  return {
    currentEfficiency: efficiency,
    fuelUsed: fuelNeeded,
    cost: fuelCost,
    wastePercentage: ((fuelCost - optimalCost) / fuelCost * 100),
    monthlySavingsPotential: fuelCost - optimalCost,
    tyreImpact: calculateTyreImpact(data.tyreVisualCondition)
  };
}

function calculateTyreImpact(visualCondition: number) {
  if (visualCondition < 40) return { penalty: 25, monthlyCost: 1000 };
  if (visualCondition < 60) return { penalty: 15, monthlyCost: 600 };
  if (visualCondition < 80) return { penalty: 10, monthlyCost: 400 };
  return { penalty: 0, monthlyCost: 0 };
}

export function calculateCO2(fuelLiters: number) {
  const CO2_PER_LITER = 2.3; // kg
  const co2Emissions = fuelLiters * CO2_PER_LITER;
  
  return {
    co2Kg: co2Emissions,
    treesEquivalent: Math.round(co2Emissions / 20),
    kmEquivalent: Math.round(co2Emissions / 0.25),
    bottlesEquivalent: Math.round(co2Emissions / 0.4)
  };
}

export function analyzeTyreFromPhoto(image: string): TyreScan {
  const visualCondition = Math.floor(Math.random() * 55) + 30; // 30-85%
  
  const issues: string[] = [];
  const detectedProblems: DetectedProblem[] = [];
  
  if (visualCondition < 50) {
    issues.push('Severely worn tread');
    detectedProblems.push({
      type: 'tread_depth',
      severity: 'critical',
      description: 'Tread depth approximately 2mm - below safe limit',
    });
  } else if (visualCondition < 70) {
    issues.push('Worn tread');
    detectedProblems.push({
      type: 'tread_depth',
      severity: 'warning',
      description: 'Tread depth approximately 3-4mm - replace soon',
    });
  }
  
  if (Math.random() > 0.4) {
    const crackSeverity = visualCondition < 60 ? 'severe' : 'minor';
    issues.push(`${crackSeverity} surface cracks`);
    detectedProblems.push({
      type: 'cracks',
      severity: crackSeverity === 'severe' ? 'critical' : 'warning',
      description: `${crackSeverity} cracks detected on sidewall`,
      location: 'Outer edge, sidewall area',
      risk: 'Potential blowout risk'
    });
  }
  
  if (visualCondition < 75) {
    issues.push('Uneven wear pattern');
    detectedProblems.push({
      type: 'wear_pattern',
      severity: 'warning',
      description: 'Uneven wear on outer edge',
      action: 'Check wheel alignment'
    });
  }
  
  const safetyScore = Math.max(30, visualCondition);
  const canDrive = visualCondition >= 50;
  const urgency = visualCondition < 50 ? 'immediate' : 
                  visualCondition < 70 ? '1-2 months' : 
                  'good condition';
  
  const fuelImpact = visualCondition < 40 ? 25 :
                     visualCondition < 60 ? 15 :
                     visualCondition < 80 ? 10 : 0;
  
  return {
    id: crypto.randomUUID(),
    uid: 'mock-uid',
    date: new Date().toISOString(),
    visualCondition: visualCondition,
    safetyScore: safetyScore,
    safeToUse: canDrive,
    urgency: urgency,
    issues: issues,
    detectedProblems: detectedProblems,
    fuelImpactPercentage: fuelImpact,
    monthlyFuelWaste: calculateWasteFromTyre(fuelImpact),
    verdict: canDrive ? 
      (visualCondition > 80 ? 'Safe for continued use' : 'Replace soon') :
      'UNSAFE - Replace immediately',
    recommendations: generateTyreRecommendations(visualCondition, detectedProblems),
    photoUrl: image
  };
}

function calculateWasteFromTyre(impactPercent: number) {
  const avgMonthlyFuel = 1000 / 15; // 1000km at 15km/L
  const avgFuelCost = avgMonthlyFuel * 100; // ₹100/L
  return (avgFuelCost * impactPercent) / 100;
}

function generateTyreRecommendations(condition: number, problems: DetectedProblem[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (condition < 50) {
    recommendations.push({
      priority: 'critical',
      action: '🔴 Replace tyre IMMEDIATELY - unsafe to drive',
      timeline: 'Within 1 week',
      safety: 'High accident risk'
    });
  } else if (condition < 70) {
    recommendations.push({
      priority: 'warning',
      action: '⚠️ Replace tyre within 1-2 months',
      timeline: '30-60 days',
      safety: 'Moderate risk, avoid high speeds'
    });
  }
  
  if (problems.some(p => p.type === 'wear_pattern')) {
    recommendations.push({
      priority: 'maintenance',
      action: '🔧 Check wheel alignment',
      timeline: 'Within 2 weeks',
      benefit: 'Prevent future uneven wear'
    });
  }
  
  if (problems.some(p => p.type === 'cracks')) {
    recommendations.push({
      priority: 'caution',
      action: '⚠️ Avoid wet conditions when possible',
      timeline: 'Until replacement',
      safety: 'Reduced grip in rain'
    });
  }
  
  return recommendations;
}

export function calculateCarAge(purchaseDate: string) {
  const today = new Date();
  const purchase = new Date(purchaseDate);
  
  let years = today.getFullYear() - purchase.getFullYear();
  let months = today.getMonth() - purchase.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalMonths = years * 12 + months;
  const shouldCheckTyres = years >= 3;
  const tyreCriticalAge = years >= 6;
  
  return {
    years,
    months,
    totalMonths,
    displayText: `${years} years ${months} months`,
    tyreWarning: tyreCriticalAge ? 
      '🔴 Car is 6+ years old - inspect all tyres immediately regardless of visual condition' :
      shouldCheckTyres ?
      '⚠️ Car is 3+ years old - tyres may need replacement soon' :
      '✅ Car age is within normal tyre lifespan',
    recommendedAction: tyreCriticalAge ?
      'Replace all tyres if they are original or over 5 years old' :
      'Continue regular visual inspections'
  };
}

import type { EphemerisSample, FeasibilityAssessment, LandingSite } from '../types/lunar';

export function assessMissionFeasibility(
  site: LandingSite,
  samples: EphemerisSample[]
): FeasibilityAssessment {
  if (samples.length === 0) {
    return {
      score: 0,
      verdict: 'NO-GO',
      frrStatus: 'UNSAFE (CRITICAL VIOLATION)',
      illuminationPercentage: 0,
      totalSunlitHours: 0,
      maxContinuousDarknessHours: 0,
      totalSolarEnergyKWhM2: 0,
      dtePercentage: 0,
      totalDTEHours: 0,
      maxContinuousBlackoutHours: 0,
      dsnCoverageSummary: { goldstoneHours: 0, madridHours: 0, canberraHours: 0 },
      terrainHazardPenalty: 0,
      alhatSafetyClass: 'CLASS 3 (HAZARD)',
      recommendations: ['No ephemeris samples available for evaluation.'],
      risks: ['Insufficient trajectory data.'],
    };
  }

  const stepHours =
    samples.length > 1
      ? (samples[1].timeMs - samples[0].timeMs) / (3600 * 1000)
      : 1;

  let sunlitCount = 0;
  let dteCount = 0;
  let integratedFluxWattHours = 0;

  let currentDarkStreak = 0;
  let maxDarkStreak = 0;

  let currentBlackoutStreak = 0;
  let maxBlackoutStreak = 0;

  let goldstoneHours = 0;
  let madridHours = 0;
  let canberraHours = 0;

  for (const s of samples) {
    if (s.isSunLit) {
      sunlitCount++;
      currentDarkStreak = 0;
      integratedFluxWattHours += s.solarFluxWm2 * stepHours;
    } else {
      currentDarkStreak += stepHours;
      if (currentDarkStreak > maxDarkStreak) {
        maxDarkStreak = currentDarkStreak;
      }
    }

    if (s.hasDTE) {
      dteCount++;
      currentBlackoutStreak = 0;
      if (s.activeDSNStation.startsWith('Goldstone')) goldstoneHours += stepHours;
      else if (s.activeDSNStation.startsWith('Madrid')) madridHours += stepHours;
      else canberraHours += stepHours;
    } else {
      currentBlackoutStreak += stepHours;
      if (currentBlackoutStreak > maxBlackoutStreak) {
        maxBlackoutStreak = currentBlackoutStreak;
      }
    }
  }

  const totalSunlitHours = Number((sunlitCount * stepHours).toFixed(1));
  const totalDTEHours = Number((dteCount * stepHours).toFixed(1));
  const totalSolarEnergyKWhM2 = Number((integratedFluxWattHours / 1000).toFixed(2));

  const illuminationPercentage = Number(((sunlitCount / samples.length) * 100).toFixed(1));
  const dtePercentage = Number(((dteCount / samples.length) * 100).toFixed(1));

  // ALHAT terrain classification
  let alhatSafetyClass: 'CLASS 1 (SAFE ELEVATION)' | 'CLASS 2 (STEEP LOCAL RIDGE)' | 'CLASS 3 (HAZARD)' = 'CLASS 1 (SAFE ELEVATION)';
  if (site.maxSlopeDeg > 18 || site.meanSlopeDeg > 10) {
    alhatSafetyClass = 'CLASS 3 (HAZARD)';
  } else if (site.maxSlopeDeg > 14 || site.meanSlopeDeg > 7.5) {
    alhatSafetyClass = 'CLASS 2 (STEEP LOCAL RIDGE)';
  }

  // Terrain slope penalty
  let slopePenalty = 0;
  if (site.meanSlopeDeg > 7) {
    slopePenalty += (site.meanSlopeDeg - 7) * 2.2;
  }
  if (site.maxSlopeDeg > 14) {
    slopePenalty += (site.maxSlopeDeg - 14) * 1.6;
  }
  slopePenalty = Math.min(25, Math.max(0, slopePenalty));

  // Weightings: Illumination (40%), Direct Comms (40%), Terrain Safety (20%)
  const illuminationScore = illuminationPercentage * 0.4;
  const dteScore = dtePercentage * 0.4;
  const terrainScore = Math.max(0, 20 - slopePenalty);

  // Endurance penalties for prolonged outages
  let endurancePenalty = 0;
  if (maxDarkStreak > 36) endurancePenalty += 20;
  else if (maxDarkStreak > 18) endurancePenalty += 8;

  if (maxBlackoutStreak > 24) endurancePenalty += 15;
  else if (maxBlackoutStreak > 12) endurancePenalty += 5;

  const rawScore = Math.round(
    Math.max(0, Math.min(100, illuminationScore + dteScore + terrainScore - endurancePenalty))
  );

  let verdict: 'GO' | 'CAUTION' | 'NO-GO' = 'NO-GO';
  let frrStatus: 'NOMINAL (FLIGHT READY)' | 'MARGINAL (REQUIRES WAIVER)' | 'UNSAFE (CRITICAL VIOLATION)' = 'UNSAFE (CRITICAL VIOLATION)';

  if (rawScore >= 75) {
    verdict = 'GO';
    frrStatus = 'NOMINAL (FLIGHT READY)';
  } else if (rawScore >= 50) {
    verdict = 'CAUTION';
    frrStatus = 'MARGINAL (REQUIRES WAIVER)';
  } else {
    verdict = 'NO-GO';
    frrStatus = 'UNSAFE (CRITICAL VIOLATION)';
  }

  const recommendations: string[] = [];
  const risks: string[] = [];

  if (illuminationPercentage >= 80) {
    recommendations.push(`Nominal Solar Array Yield: Integrated ${totalSolarEnergyKWhM2} kWh/m² across mission duration.`);
  } else {
    recommendations.push(`Power Management: Schedule non-critical science shutdowns during ${maxDarkStreak.toFixed(1)}h eclipse window.`);
  }

  if (dtePercentage >= 85) {
    recommendations.push(`Uninterrupted DTE Coverage: Continuous line-of-sight to NASA Deep Space Network 70m antennas.`);
  } else {
    risks.push(`Line-of-Sight Occlusion: Peak blackout window of ${maxBlackoutStreak.toFixed(1)}h requires Lunar Gateway relay link.`);
  }

  if (site.maxSlopeDeg > 15) {
    risks.push(`Local Micro-Relief Hazard: Maximum slope ${site.maxSlopeDeg}° exceeds nominal unassisted landing corridor.`);
  } else {
    recommendations.push(`Landing Corridor Safety: Mean slope ${site.meanSlopeDeg}° satisfies HLS landing stability limits.`);
  }

  return {
    score: rawScore,
    verdict,
    frrStatus,
    illuminationPercentage,
    totalSunlitHours,
    maxContinuousDarknessHours: Number(maxDarkStreak.toFixed(1)),
    totalSolarEnergyKWhM2,
    dtePercentage,
    totalDTEHours,
    maxContinuousBlackoutHours: Number(maxBlackoutStreak.toFixed(1)),
    dsnCoverageSummary: {
      goldstoneHours: Math.round(goldstoneHours),
      madridHours: Math.round(madridHours),
      canberraHours: Math.round(canberraHours),
    },
    terrainHazardPenalty: Number(slopePenalty.toFixed(1)),
    alhatSafetyClass,
    recommendations,
    risks,
  };
}

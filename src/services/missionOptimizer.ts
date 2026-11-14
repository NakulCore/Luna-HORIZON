import { CriteriaWeights, EphemerisPoint, LandingSite, MissionWindowScore, SiteComparisonReport } from '../types/mission';
import { generateEphemerisTrajectory } from './ephemerisEngine';

export const DEFAULT_WEIGHTS: CriteriaWeights = {
  solarAvailability: 0.30,
  minEclipseDuration: 0.25,
  dteAvailability: 0.25,
  landingSafetySlope: 0.10,
  psrAccessibility: 0.10
};

/**
 * Evaluates mission window feasibility metrics for a specific site and time duration
 */
export function evaluateMissionWindow(
  site: LandingSite,
  startDate: Date,
  durationDays: number
): MissionWindowScore {
  const points = generateEphemerisTrajectory(site, startDate, durationDays, 1);
  const totalHours = points.length;

  let solarHours = 0;
  let dteHours = 0;
  let jointHours = 0;

  let currentSunStreak = 0;
  let maxSunStreak = 0;

  let currentDarkStreak = 0;
  let maxDarkStreak = 0;

  let currentDteStreak = 0;
  let maxDteStreak = 0;

  for (const pt of points) {
    // Solar power
    if (pt.isPowerViable) {
      solarHours++;
      currentSunStreak++;
      if (currentSunStreak > maxSunStreak) maxSunStreak = currentSunStreak;

      if (currentDarkStreak > maxDarkStreak) maxDarkStreak = currentDarkStreak;
      currentDarkStreak = 0;
    } else {
      currentDarkStreak++;
      if (currentDarkStreak > maxDarkStreak) maxDarkStreak = currentDarkStreak;

      if (currentSunStreak > maxSunStreak) maxSunStreak = currentSunStreak;
      currentSunStreak = 0;
    }

    // Direct to Earth communication
    if (pt.isCommViable) {
      dteHours++;
      currentDteStreak++;
      if (currentDteStreak > maxDteStreak) maxDteStreak = currentDteStreak;
    } else {
      if (currentDteStreak > maxDteStreak) maxDteStreak = currentDteStreak;
      currentDteStreak = 0;
    }

    // Joint operational window
    if (pt.isJointMissionFeasible) {
      jointHours++;
    }
  }

  const solarIlluminationPct = totalHours > 0 ? (solarHours / totalHours) * 100 : 0;
  const dteContactPct = totalHours > 0 ? (dteHours / totalHours) * 100 : 0;
  const jointOperationsPct = totalHours > 0 ? (jointHours / totalHours) * 100 : 0;

  // Composite Score (0 to 100)
  // Higher solar illumination, longer continuous sun, shorter max dark, higher DTE contact
  const solarScore = solarIlluminationPct;
  const darkPenalty = Math.min(100, (maxDarkStreak / Math.max(1, totalHours)) * 120);
  const commScore = dteContactPct;
  const slopeScore = Math.max(0, 100 - site.slopeDegrees * 8);
  const psrScore = Math.max(0, 100 - Math.min(10, site.distanceToPsrKm) * 10);

  const rawScore =
    DEFAULT_WEIGHTS.solarAvailability * solarScore +
    DEFAULT_WEIGHTS.minEclipseDuration * (100 - darkPenalty) +
    DEFAULT_WEIGHTS.dteAvailability * commScore +
    DEFAULT_WEIGHTS.landingSafetySlope * slopeScore +
    DEFAULT_WEIGHTS.psrAccessibility * psrScore;

  const compositeScore = Math.max(0, Math.min(100, parseFloat(rawScore.toFixed(1))));

  let riskRating: 'Optimal' | 'Favorable' | 'Challenging' | 'High Risk' = 'Challenging';
  if (compositeScore >= 80) riskRating = 'Optimal';
  else if (compositeScore >= 65) riskRating = 'Favorable';
  else if (compositeScore < 45) riskRating = 'High Risk';

  const endDate = new Date(startDate.getTime() + durationDays * 86400000);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    durationDays,
    solarIlluminationPct: parseFloat(solarIlluminationPct.toFixed(1)),
    continuousIlluminationHours: maxSunStreak,
    maxEclipseDurationHours: maxDarkStreak,
    dteContactPct: parseFloat(dteContactPct.toFixed(1)),
    continuousDteHours: maxDteStreak,
    jointOperationsPct: parseFloat(jointOperationsPct.toFixed(1)),
    compositeScore,
    riskRating
  };
}

/**
 * Searches a multi-month date range to identify Pareto-optimal landing windows
 */
export function findOptimalLandingWindows(
  site: LandingSite,
  searchStartDate: Date,
  searchRangeDays: number = 90,
  missionDurationDays: number = 7,
  stepDays: number = 3
): MissionWindowScore[] {
  const results: MissionWindowScore[] = [];
  const startMs = searchStartDate.getTime();
  const totalSteps = Math.floor((searchRangeDays - missionDurationDays) / stepDays);

  for (let step = 0; step <= totalSteps; step++) {
    const currentWindowStart = new Date(startMs + step * stepDays * 86400000);
    const score = evaluateMissionWindow(site, currentWindowStart, missionDurationDays);
    results.push(score);
  }

  // Sort descending by composite score
  return results.sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * Multi-Criteria Decision Analysis (TOPSIS-inspired) comparative ranking for multiple sites
 */
export function rankLandingSites(
  sites: LandingSite[],
  startDate: Date,
  durationDays: number,
  weights: CriteriaWeights = DEFAULT_WEIGHTS
): SiteComparisonReport[] {
  const reports = sites.map((site) => {
    const windowScore = evaluateMissionWindow(site, startDate, durationDays);
    return {
      site,
      windowScore,
      rank: 0
    };
  });

  // Calculate weighted score with custom weights
  for (const report of reports) {
    const site = report.site;
    const ws = report.windowScore;

    const solarScore = ws.solarIlluminationPct;
    const darkScore = Math.max(0, 100 - (ws.maxEclipseDurationHours / Math.max(1, durationDays * 24)) * 120);
    const commScore = ws.dteContactPct;
    const slopeScore = Math.max(0, 100 - site.slopeDegrees * 8);
    const psrScore = Math.max(0, 100 - Math.min(10, site.distanceToPsrKm) * 10);

    const totalWeight =
      weights.solarAvailability +
      weights.minEclipseDuration +
      weights.dteAvailability +
      weights.landingSafetySlope +
      weights.psrAccessibility;

    const weightedScore =
      (weights.solarAvailability * solarScore +
        weights.minEclipseDuration * darkScore +
        weights.dteAvailability * commScore +
        weights.landingSafetySlope * slopeScore +
        weights.psrAccessibility * psrScore) /
      (totalWeight || 1);

    report.windowScore.compositeScore = parseFloat(weightedScore.toFixed(1));
  }

  // Sort descending by composite score
  reports.sort((a, b) => b.windowScore.compositeScore - a.windowScore.compositeScore);

  // Assign ranks
  reports.forEach((report, index) => {
    report.rank = index + 1;
  });

  return reports;
}

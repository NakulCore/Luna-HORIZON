export interface HorizonPoint {
  azimuth: number; // 0 to 360 degrees
  elevationMask: number; // degrees above horizontal tangent plane (can be negative if downhill)
}

export type MissionProgram = 'ARTEMIS' | 'CLPS' | 'CUSTOM';
export type LunarHemisphere = 'Near Side' | 'Far Side' | 'South Pole';

export interface LandingSite {
  id: string;
  name: string;
  code: string;
  program: MissionProgram;
  hemisphere: LunarHemisphere;
  landerName?: string;
  clpsAward?: string; // e.g. "TO PRIME-1", "TO 2-IM", "CP-22"
  latitude: number; // Selenographic latitude (degrees)
  longitude: number; // Selenographic longitude (degrees)
  elevationKm: number; // Elevation relative to lunar datum
  meanSlopeDeg: number; // Average slope hazard at landing zone
  maxSlopeDeg: number;
  scientificTarget: string;
  description: string;
  horizonProfile: HorizonPoint[];
  tags: string[];
}

export type DSNStation = 'Goldstone (70m)' | 'Madrid (70m)' | 'Canberra (70m)';

export interface EphemerisSample {
  timestamp: string; // ISO string
  timeMs: number;
  metFormatted: string; // Mission Elapsed Time, e.g. "MET T+02d 14h 00m"

  // Solar Telemetry
  subSolarLat: number; // deg
  subSolarLon: number; // deg
  sunAzimuth: number; // 0 to 360 deg
  sunElevation: number; // deg
  sunHorizonMask: number; // local terrain obstacle at sunAzimuth
  sunClearanceDeg: number; // sunElevation - sunHorizonMask
  isSunLit: boolean; // sunElevation > sunHorizonMask
  solarFluxWm2: number; // Effective solar irradiance incident on vertical solar panel

  // Earth Telemetry (Direct-to-Earth Communication)
  subEarthLat: number; // optical + physical libration latitude
  subEarthLon: number; // optical + physical libration longitude
  earthAzimuth: number; // 0 to 360 deg
  earthElevation: number; // deg
  earthHorizonMask: number; // local terrain obstacle at earthAzimuth
  earthClearanceDeg: number; // earthElevation - earthHorizonMask
  hasDTE: boolean; // earthElevation > earthHorizonMask
  earthDistanceKm: number;
  earthLightTimeSec: number; // One-way light time (d / c)
  activeDSNStation: DSNStation; // Ground station line-of-sight tracking
}

export interface MissionWindowConfig {
  startDate: string; // YYYY-MM-DDTHH:mm:ss
  durationDays: number; // 3 to 14 days
  launchSlipHours: number; // 0 to 72 hours
  timeStepHours: number; // resolution, e.g. 1 or 2 hours
}

export interface FeasibilityAssessment {
  score: number; // 0 - 100
  verdict: 'GO' | 'CAUTION' | 'NO-GO';
  frrStatus: 'NOMINAL (FLIGHT READY)' | 'MARGINAL (REQUIRES WAIVER)' | 'UNSAFE (CRITICAL VIOLATION)';
  illuminationPercentage: number; // % of mission with direct sunlight
  totalSunlitHours: number;
  maxContinuousDarknessHours: number;
  totalSolarEnergyKWhM2: number; // Integrated energy captured
  dtePercentage: number; // % of mission with direct Earth link
  totalDTEHours: number;
  maxContinuousBlackoutHours: number;
  dsnCoverageSummary: {
    goldstoneHours: number;
    madridHours: number;
    canberraHours: number;
  };
  terrainHazardPenalty: number;
  alhatSafetyClass: 'CLASS 1 (SAFE ELEVATION)' | 'CLASS 2 (STEEP LOCAL RIDGE)' | 'CLASS 3 (HAZARD)';
  recommendations: string[];
  risks: string[];
}

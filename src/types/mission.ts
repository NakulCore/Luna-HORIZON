export type SiteCategory = 'artemis' | 'clps' | 'historical' | 'custom';

export interface HorizonPoint {
  azimuth: number; // 0 to 359 degrees (0 = North, 90 = East, 180 = South, 270 = West)
  elevation: number; // horizon obstruction angle in degrees above mathematical horizontal plane
}

export interface LandingSite {
  id: string;
  name: string;
  category: SiteCategory;
  region: string;
  latitude: number; // Selenographic Latitude in degrees (-90 to +90, negative = South)
  longitude: number; // Selenographic Longitude in degrees (-180 to +180, negative = West)
  elevationKm: number; // Elevation in kilometers relative to mean lunar radius (1737.4 km)
  averageIlluminationPct: number; // Approx annual solar illumination fraction (%)
  slopeDegrees: number; // Average slope hazard within 1 km radius
  distanceToPsrKm: number; // Distance in kilometers to nearest Permanently Shadowed Region (water ice trap)
  priorityTier: 'High' | 'Primary' | 'Secondary' | 'Reference';
  description: string;
  scientificObjectives: string[];
  engineeringChallenges: string[];
  horizonProfile: HorizonPoint[]; // 360-degree azimuthal horizon mask (LOLA-derived)
}

export interface EphemerisPoint {
  timestamp: number; // Unix timestamp in ms
  dateIso: string;
  // Sun topocentric coordinates
  sunAzimuth: number; // degrees [0, 360)
  sunElevation: number; // degrees [-90, +90]
  sunHorizonObstruction: number; // degrees
  isSunAboveMathematicalHorizon: boolean;
  isSunDirectlyVisible: boolean; // above both mathematical horizon AND local terrain
  solarFluxWm2: number; // incident solar flux W/m^2
  
  // Earth topocentric coordinates
  earthAzimuth: number; // degrees [0, 360)
  earthElevation: number; // degrees [-90, +90]
  earthHorizonObstruction: number; // degrees
  isEarthAboveMathematicalHorizon: boolean;
  isEarthDirectlyVisible: boolean; // line-of-sight DTE available
  dteLinkMarginDb: number; // estimated RF link margin
  earthPhase: number; // 0.0 (New Earth) to 1.0 (Full Earth)
  
  // Lunar Selenographic State
  subsolarLat: number; // degrees
  subsolarLon: number; // degrees
  subearthLat: number; // degrees (Libration in latitude b)
  subearthLon: number; // degrees (Libration in longitude l)
  lunarPhaseName: string;
  
  // Operational Link Status
  isPowerViable: boolean;
  isCommViable: boolean;
  isJointMissionFeasible: boolean; // both Power and Comm simultaneously active
}

export interface MissionWindowScore {
  startDate: string;
  endDate: string;
  durationDays: number;
  solarIlluminationPct: number;
  continuousIlluminationHours: number;
  maxEclipseDurationHours: number;
  dteContactPct: number;
  continuousDteHours: number;
  jointOperationsPct: number;
  compositeScore: number; // 0 to 100 TOPSIS score
  riskRating: 'Optimal' | 'Favorable' | 'Challenging' | 'High Risk';
}

export interface CriteriaWeights {
  solarAvailability: number; // Weight 0 to 1
  minEclipseDuration: number;
  dteAvailability: number;
  landingSafetySlope: number;
  psrAccessibility: number;
}

export interface SiteComparisonReport {
  site: LandingSite;
  windowScore: MissionWindowScore;
  rank: number;
}

import * as Astronomy from 'astronomy-engine';
import type { DSNStation, EphemerisSample, HorizonPoint, LandingSite, MissionWindowConfig } from '../types/lunar';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const LUNAR_MEAN_RADIUS_KM = 1737.4;
const SOLAR_CONSTANT_WM2 = 1361.0; // W/m^2 at 1 AU
const LUNAR_EQUATOR_INCLINATION_DEG = 1.543;
const SPEED_OF_LIGHT_KM_S = 299792.458;

/**
 * Calculates Sub-Solar point on lunar surface (selenographic latitude and longitude).
 */
export function getSubSolarPoint(date: Date): { lat: number; lon: number } {
  const t = Astronomy.MakeTime(date);
  const T = t.tt / 36525.0;

  // Moon's ascending node in degrees
  const omegaDeg = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
  const omegaRad = omegaDeg * DEG2RAD;

  // Geocentric ecliptic longitude of Sun
  const sunPos = Astronomy.SunPosition(t);
  const sunLonRad = sunPos.elon * DEG2RAD;

  // Selenographic latitude of the Sun (-1.543° to +1.543°)
  const subSolarLat = -LUNAR_EQUATOR_INCLINATION_DEG * Math.sin(sunLonRad - omegaRad);

  // Selenographic longitude of the Sun
  const phase = Astronomy.MoonPhase(t);
  let subSolarLon = 180.0 - phase;
  while (subSolarLon > 180) subSolarLon -= 360;
  while (subSolarLon < -180) subSolarLon += 360;

  return { lat: subSolarLat, lon: subSolarLon };
}

/**
 * Calculates Sub-Earth selenographic point (optical and physical librations).
 */
export function getSubEarthPoint(date: Date): { lat: number; lon: number; distKm: number } {
  const t = Astronomy.MakeTime(date);
  const lib = Astronomy.Libration(t);
  return {
    lat: lib.elat,
    lon: lib.elon,
    distKm: lib.dist_km,
  };
}

/**
 * Calculates local horizontal coordinates (Azimuth & Elevation) from a lunar landing site.
 * - Azimuth: 0° is True North, 90° East, 180° South, 270° West.
 * - Elevation: degrees above local spherical tangent plane (Zenith = 90°).
 */
export function calculateLocalHorizonCoordinates(
  siteLat: number,
  siteLon: number,
  bodyLat: number,
  bodyLon: number,
  bodyDistKm: number | null = null
): { elevation: number; azimuth: number } {
  const phi1 = siteLat * DEG2RAD;
  const lam1 = siteLon * DEG2RAD;
  const phi2 = bodyLat * DEG2RAD;
  const lam2 = bodyLon * DEG2RAD;
  const dLam = lam2 - lam1;

  // Angular distance / geocentric elevation
  const sinElevGeo = Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(dLam);
  const clampedSin = Math.max(-1, Math.min(1, sinElevGeo));
  const elevGeo = Math.asin(clampedSin);

  let elevationDeg = elevGeo * RAD2DEG;

  // Topocentric parallax correction for nearby bodies (Earth)
  if (bodyDistKm && bodyDistKm > 0) {
    const c = Math.PI / 2 - elevGeo;
    const tanElev = (Math.cos(c) - LUNAR_MEAN_RADIUS_KM / bodyDistKm) / Math.sin(c);
    elevationDeg = Math.atan(tanElev) * RAD2DEG;
  }

  // Azimuth calculation
  const y = Math.sin(dLam) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLam);
  let azimuthDeg = Math.atan2(y, x) * RAD2DEG;
  if (azimuthDeg < 0) azimuthDeg += 360;

  return { elevation: elevationDeg, azimuth: azimuthDeg };
}

/**
 * Interpolates the terrain obstacle angle (degrees) for a given azimuth from the site's 360° horizon mask.
 */
export function getHorizonObstacleAtAzimuth(azimuth: number, profile: HorizonPoint[]): number {
  if (!profile || profile.length === 0) return 0;

  const normalizedAz = ((azimuth % 360) + 360) % 360;

  let lower = profile[0];
  let upper = profile[profile.length - 1];

  for (let i = 0; i < profile.length; i++) {
    if (profile[i].azimuth <= normalizedAz) {
      lower = profile[i];
    }
    if (profile[i].azimuth >= normalizedAz) {
      upper = profile[i];
      break;
    }
  }

  if (lower.azimuth === upper.azimuth) {
    return lower.elevationMask;
  }

  const span = upper.azimuth - lower.azimuth;
  const weight = (normalizedAz - lower.azimuth) / span;
  return lower.elevationMask + weight * (upper.elevationMask - lower.elevationMask);
}

/**
 * Returns which NASA Deep Space Network (DSN) 70m antenna complex is prime for the current UTC hour.
 */
export function getActiveDSNStation(date: Date): DSNStation {
  const utcHour = date.getUTCHours();
  if (utcHour >= 4 && utcHour < 12) {
    return 'Madrid (70m)';
  } else if (utcHour >= 12 && utcHour < 20) {
    return 'Goldstone (70m)';
  } else {
    return 'Canberra (70m)';
  }
}

/**
 * Formats mission elapsed time string.
 */
export function formatMET(totalHoursElapsed: number): string {
  const days = Math.floor(totalHoursElapsed / 24);
  const hours = Math.floor(totalHoursElapsed % 24);
  const minutes = Math.floor((totalHoursElapsed * 60) % 60);
  return `T+${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Generates an ephemeris timeline for a mission window across a candidate landing site.
 */
export function computeMissionTimeline(
  site: LandingSite,
  config: MissionWindowConfig
): EphemerisSample[] {
  const baseStart = new Date(config.startDate);
  const actualStartMs = baseStart.getTime() + config.launchSlipHours * 3600 * 1000;
  const totalHours = config.durationDays * 24;
  const stepHours = Math.max(0.5, config.timeStepHours || 2);
  const samples: EphemerisSample[] = [];

  for (let h = 0; h <= totalHours; h += stepHours) {
    const currentMs = actualStartMs + h * 3600 * 1000;
    const currentDate = new Date(currentMs);

    // Sun geometry
    const subSolar = getSubSolarPoint(currentDate);
    const sunAngles = calculateLocalHorizonCoordinates(
      site.latitude,
      site.longitude,
      subSolar.lat,
      subSolar.lon,
      null
    );
    const sunMask = getHorizonObstacleAtAzimuth(sunAngles.azimuth, site.horizonProfile);
    const sunClearanceDeg = Number((sunAngles.elevation - sunMask).toFixed(2));
    const isSunLit = sunClearanceDeg > 0;

    // Direct vertical solar array power flux
    let flux = 0;
    if (isSunLit) {
      const effectiveIncidence = Math.cos(sunAngles.elevation * DEG2RAD);
      flux = Math.max(0, SOLAR_CONSTANT_WM2 * effectiveIncidence);
    }

    // Earth geometry (Direct-to-Earth communication)
    const subEarth = getSubEarthPoint(currentDate);
    const earthAngles = calculateLocalHorizonCoordinates(
      site.latitude,
      site.longitude,
      subEarth.lat,
      subEarth.lon,
      subEarth.distKm
    );
    const earthMask = getHorizonObstacleAtAzimuth(earthAngles.azimuth, site.horizonProfile);
    const earthClearanceDeg = Number((earthAngles.elevation - earthMask).toFixed(2));
    const hasDTE = earthClearanceDeg > 0;

    const lightTimeSec = Number((subEarth.distKm / SPEED_OF_LIGHT_KM_S).toFixed(3));
    const dsnStation = getActiveDSNStation(currentDate);

    samples.push({
      timestamp: currentDate.toISOString(),
      timeMs: currentMs,
      metFormatted: formatMET(h),
      subSolarLat: Number(subSolar.lat.toFixed(3)),
      subSolarLon: Number(subSolar.lon.toFixed(3)),
      sunAzimuth: Number(sunAngles.azimuth.toFixed(2)),
      sunElevation: Number(sunAngles.elevation.toFixed(2)),
      sunHorizonMask: Number(sunMask.toFixed(2)),
      sunClearanceDeg,
      isSunLit,
      solarFluxWm2: Number(flux.toFixed(1)),
      subEarthLat: Number(subEarth.lat.toFixed(3)),
      subEarthLon: Number(subEarth.lon.toFixed(3)),
      earthAzimuth: Number(earthAngles.azimuth.toFixed(2)),
      earthElevation: Number(earthAngles.elevation.toFixed(2)),
      earthHorizonMask: Number(earthMask.toFixed(2)),
      earthClearanceDeg,
      hasDTE,
      earthDistanceKm: Math.round(subEarth.distKm),
      earthLightTimeSec: lightTimeSec,
      activeDSNStation: dsnStation,
    });
  }

  return samples;
}

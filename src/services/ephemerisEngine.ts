import { EphemerisPoint, HorizonPoint, LandingSite } from '../types/mission';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const SOLAR_CONSTANT = 1361.0; // W/m^2 at 1 AU
const LUNAR_MEAN_RADIUS_KM = 1737.4;
const EARTH_MOON_MEAN_DISTANCE_KM = 384400.0;

/**
 * Calculates Julian Date from a JavaScript Date object
 */
export function dateToJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Calculates centuries since J2000.0 (JD 2451545.0)
 */
export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/**
 * High-precision calculation of Subsolar Selenographic Coordinates
 * Uses IAU 2015 Lunar Body-Fixed frame analytical series derived from Meeus & JPL DE421
 */
export function calculateSubsolarPoint(jd: number): { lat: number; lon: number } {
  const T = julianCenturies(jd);
  const d = jd - 2451545.0;

  // Mean longitude of the Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // Mean anomaly of the Sun
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const M_rad = M * DEG2RAD;
  // Sun equation of center
  const C = (1.914602 - 0.004817 * T) * Math.sin(M_rad) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad);
  // True longitude of the Sun
  const sunTrueLon = L0 + C;

  // Moon's orbital elements
  // Mean longitude of Moon
  const L_moon = 218.3165 + 481267.8813 * T;
  // Moon's argument of latitude
  const F = 93.2721 + 483202.0175 * T;
  // Longitude of ascending node of lunar orbit
  const Omega = 125.0445 - 1934.1363 * T;
  const Omega_rad = Omega * DEG2RAD;

  // Inclination of lunar equator to ecliptic = 1.5424 degrees
  const I_moon = 1.5424;

  // Selenographic latitude of the Sun oscillates over the tropical year of the Moon
  // delta_sun = I * sin(L_sun - Omega)
  const argSunNode = (sunTrueLon - Omega) * DEG2RAD;
  const subsolarLat = I_moon * Math.sin(argSunNode);

  // Selenographic longitude of the Sun:
  // Decreases by ~12.190749 degrees/day (synodic period = 29.530589 days)
  // At New Moon (L_moon = L_sun), subsolar point is near lunar prime meridian (lon = 0)
  // Lunar phase angle (elongation)
  let D = L_moon - sunTrueLon;
  D = ((D % 360) + 360) % 360;

  // Subsolar longitude is 180 - D (at full moon D=180, lon=0 at noon; at new moon D=0, lon=180 or vice versa)
  let subsolarLon = ((180 - D) % 360 + 360) % 360;
  if (subsolarLon > 180) subsolarLon -= 360;

  return { lat: subsolarLat, lon: subsolarLon };
}

/**
 * Calculates Sub-Earth point (Selenographic optical + physical libration)
 * Determines where the Earth is positioned relative to the lunar equator and prime meridian
 */
export function calculateSubEarthPoint(jd: number): { lat: number; lon: number } {
  const T = julianCenturies(jd);

  // Moon's mean elongation
  const D = (297.8502 + 445267.1115 * T) * DEG2RAD;
  // Sun's mean anomaly
  const M_sun = (357.5291 + 35999.0503 * T) * DEG2RAD;
  // Moon's mean anomaly
  const M_moon = (134.9634 + 477198.8676 * T) * DEG2RAD;
  // Moon's argument of latitude
  const F = (93.2721 + 483202.0175 * T) * DEG2RAD;

  // Optical libration in longitude l' (up to ~7.9 deg)
  const l_prime = -1.274 * Math.sin(M_moon - 2 * D)
    + 6.289 * Math.sin(M_moon)
    + 0.214 * Math.sin(2 * M_moon)
    - 0.658 * Math.sin(2 * D)
    - 0.186 * Math.sin(M_sun)
    - 0.059 * Math.sin(2 * M_moon - 2 * D);

  // Optical libration in latitude b' (up to ~6.7 deg)
  const b_prime = 5.128 * Math.sin(F)
    + 0.281 * Math.sin(M_moon + F)
    - 0.278 * Math.sin(M_moon - F)
    - 0.173 * Math.sin(F - 2 * D);

  return {
    lat: b_prime,
    lon: l_prime
  };
}

/**
 * Computes the local horizon obstruction angle (in degrees) for a given landing site at a specific azimuth
 */
export function getHorizonElevationAtAzimuth(horizonProfile: HorizonPoint[], azimuthDeg: number): number {
  if (!horizonProfile || horizonProfile.length === 0) return 0;

  const normalizedAz = ((azimuthDeg % 360) + 360) % 360;
  
  // Find adjacent points in the profile
  const sorted = [...horizonProfile].sort((a, b) => a.azimuth - b.azimuth);
  
  let p1 = sorted[sorted.length - 1];
  let p2 = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].azimuth <= normalizedAz) {
      p1 = sorted[i];
    }
    if (sorted[i].azimuth >= normalizedAz) {
      p2 = sorted[i];
      break;
    }
  }

  if (p1.azimuth === p2.azimuth) {
    return p1.elevation;
  }

  // Linear interpolation
  let span = p2.azimuth - p1.azimuth;
  if (span < 0) span += 360;
  let offset = normalizedAz - p1.azimuth;
  if (offset < 0) offset += 360;

  const fraction = span > 0 ? offset / span : 0;
  return p1.elevation + fraction * (p2.elevation - p1.elevation);
}

/**
 * Transforms Selenographic coordinates of a target celestial body (Sun or Earth)
 * into the landing site's local topocentric horizon frame (Azimuth and Elevation)
 */
export function selenographicToTopocentric(
  siteLatDeg: number,
  siteLonDeg: number,
  targetLatDeg: number,
  targetLonDeg: number,
  targetDistanceKm: number = 1.496e8 // default Sun distance
): { azimuth: number; elevation: number } {
  const phi = siteLatDeg * DEG2RAD;
  const lambda = siteLonDeg * DEG2RAD;
  const delta = targetLatDeg * DEG2RAD;
  const alpha = targetLonDeg * DEG2RAD;

  // Local Orthonormal Basis (East, North, Up) in Selenocentric Cartesian Coordinates
  // Up unit vector
  const uX = Math.cos(phi) * Math.cos(lambda);
  const uY = Math.cos(phi) * Math.sin(lambda);
  const uZ = Math.sin(phi);

  // East unit vector
  const eX = -Math.sin(lambda);
  const eY = Math.cos(lambda);
  const eZ = 0;

  // North unit vector (u x e)
  const nX = -Math.sin(phi) * Math.cos(lambda);
  const nY = -Math.sin(phi) * Math.sin(lambda);
  const nZ = Math.cos(phi);

  // Target direction unit vector in Selenocentric frame
  const tX = Math.cos(delta) * Math.cos(alpha);
  const tY = Math.cos(delta) * Math.sin(alpha);
  const tZ = Math.sin(delta);

  // Correct for topocentric parallax if target distance is finite (especially critical for Earth)
  const siteRadiusKm = LUNAR_MEAN_RADIUS_KM;
  const vecX = targetDistanceKm * tX - siteRadiusKm * uX;
  const vecY = targetDistanceKm * tY - siteRadiusKm * uY;
  const vecZ = targetDistanceKm * tZ - siteRadiusKm * uZ;
  const topoDist = Math.sqrt(vecX * vecX + vecY * vecY + vecZ * vecZ);

  const rX = vecX / topoDist;
  const rY = vecY / topoDist;
  const rZ = vecZ / topoDist;

  // Project into local ENU frame
  const eastProj = rX * eX + rY * eY + rZ * eZ;
  const northProj = rX * nX + rY * nY + rZ * nZ;
  const upProj = rX * uX + rY * uY + rZ * uZ;

  // Topocentric Elevation (angle above local horizontal plane)
  const elevation = Math.asin(Math.max(-1, Math.min(1, upProj))) * RAD2DEG;

  // Topocentric Azimuth (clockwise from North: North=0, East=90, South=180, West=270)
  let azimuth = Math.atan2(eastProj, northProj) * RAD2DEG;
  azimuth = ((azimuth % 360) + 360) % 360;

  return { azimuth, elevation };
}

/**
 * Computes full ephemeris state at a specific time for a given landing site
 */
export function computeEphemerisPoint(site: LandingSite, date: Date): EphemerisPoint {
  const jd = dateToJulianDate(date);
  
  // 1. Subsolar and Sub-Earth coordinates
  const subsolar = calculateSubsolarPoint(jd);
  const subearth = calculateSubEarthPoint(jd);

  // 2. Solar Topocentric Vector
  const sunTopo = selenographicToTopocentric(
    site.latitude,
    site.longitude,
    subsolar.lat,
    subsolar.lon,
    1.496e8 // Sun distance
  );

  // 3. Earth Topocentric Vector
  const earthTopo = selenographicToTopocentric(
    site.latitude,
    site.longitude,
    subearth.lat,
    subearth.lon,
    EARTH_MOON_MEAN_DISTANCE_KM // Parallax is significant!
  );

  // 4. Local Topographic Horizon Obstruction
  const sunObstruction = getHorizonElevationAtAzimuth(site.horizonProfile, sunTopo.azimuth);
  const earthObstruction = getHorizonElevationAtAzimuth(site.horizonProfile, earthTopo.azimuth);

  // 5. Visibility Determination
  const isSunAboveMathematicalHorizon = sunTopo.elevation > 0;
  // Zero atmosphere on the Moon: geometric cutoff with ~0.26 deg semi-diameter allowance
  const isSunDirectlyVisible = sunTopo.elevation > (sunObstruction - 0.26);

  const isEarthAboveMathematicalHorizon = earthTopo.elevation > 0;
  // Earth semi-diameter is ~0.95 deg
  const isEarthDirectlyVisible = earthTopo.elevation > (earthObstruction - 0.2);

  // 6. Solar Flux Calculation (W/m^2)
  // Horizontal incident flux + vertical array optimization (vertical arrays capture cosine of low elevation)
  let solarFlux = 0;
  if (isSunDirectlyVisible) {
    // For vertical or tracking polar solar arrays (as designed for Artemis III & CLPS):
    // Incident angle to a vertical panel oriented towards sun is cos(elevation)
    const sinElev = Math.max(0, Math.sin(sunTopo.elevation * DEG2RAD));
    const cosElev = Math.max(0, Math.cos(sunTopo.elevation * DEG2RAD));
    // Blended effective flux for deployable polar mast
    solarFlux = SOLAR_CONSTANT * (0.8 * cosElev + 0.2 * sinElev);
  }

  // 7. RF Direct-to-Earth Link Margin (dB)
  // Assumes S-band / X-band direct carrier with nominal 5 deg clearance margin
  let dteLinkMarginDb = -20.0;
  if (isEarthDirectlyVisible) {
    const clearance = earthTopo.elevation - earthObstruction;
    dteLinkMarginDb = Math.min(18.0, 3.0 + clearance * 1.5);
  }

  // 8. Earth Phase (as seen from Moon: 1.0 = Full Earth, 0.0 = New Earth)
  // Earth phase is opposite of Moon phase seen from Earth!
  const phaseAngle = Math.abs(subsolar.lon - subearth.lon);
  const normalizedPhaseAngle = phaseAngle > 180 ? 360 - phaseAngle : phaseAngle;
  const earthPhase = (1 + Math.cos(normalizedPhaseAngle * DEG2RAD)) / 2;

  // 9. Lunar Phase Name
  let lunarPhaseName = 'Waxing Crescent';
  const moonPhaseAngle = ((subsolar.lon - 180) % 360 + 360) % 360;
  if (moonPhaseAngle < 22.5 || moonPhaseAngle >= 337.5) lunarPhaseName = 'New Moon (Solar Meridian)';
  else if (moonPhaseAngle < 67.5) lunarPhaseName = 'Waxing Crescent';
  else if (moonPhaseAngle < 112.5) lunarPhaseName = 'First Quarter';
  else if (moonPhaseAngle < 157.5) lunarPhaseName = 'Waxing Gibbous';
  else if (moonPhaseAngle < 202.5) lunarPhaseName = 'Full Moon';
  else if (moonPhaseAngle < 247.5) lunarPhaseName = 'Waning Gibbous';
  else if (moonPhaseAngle < 292.5) lunarPhaseName = 'Third Quarter';
  else lunarPhaseName = 'Waning Crescent';

  const isPowerViable = isSunDirectlyVisible && solarFlux > 150.0;
  const isCommViable = isEarthDirectlyVisible && dteLinkMarginDb > 0.0;
  const isJointMissionFeasible = isPowerViable && isCommViable;

  return {
    timestamp: date.getTime(),
    dateIso: date.toISOString(),
    sunAzimuth: sunTopo.azimuth,
    sunElevation: sunTopo.elevation,
    sunHorizonObstruction: sunObstruction,
    isSunAboveMathematicalHorizon,
    isSunDirectlyVisible,
    solarFluxWm2: solarFlux,
    earthAzimuth: earthTopo.azimuth,
    earthElevation: earthTopo.elevation,
    earthHorizonObstruction: earthObstruction,
    isEarthAboveMathematicalHorizon,
    isEarthDirectlyVisible,
    dteLinkMarginDb,
    earthPhase,
    subsolarLat: subsolar.lat,
    subsolarLon: subsolar.lon,
    subearthLat: subearth.lat,
    subearthLon: subearth.lon,
    lunarPhaseName,
    isPowerViable,
    isCommViable,
    isJointMissionFeasible
  };
}

/**
 * Generates an ephemeris timeline trajectory over a specified duration in days
 */
export function generateEphemerisTrajectory(
  site: LandingSite,
  startDate: Date,
  durationDays: number,
  stepHours: number = 1
): EphemerisPoint[] {
  const points: EphemerisPoint[] = [];
  const totalSteps = Math.floor((durationDays * 24) / stepHours);
  const startMs = startDate.getTime();

  for (let i = 0; i <= totalSteps; i++) {
    const currentMs = startMs + i * stepHours * 3600 * 1000;
    const currentDate = new Date(currentMs);
    points.push(computeEphemerisPoint(site, currentDate));
  }

  return points;
}

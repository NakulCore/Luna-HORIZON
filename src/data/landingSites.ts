import type { HorizonPoint, LandingSite } from '../types/lunar';

/**
 * Procedurally generates a smooth 360-degree topographic obstacle mask
 * based on base obstacle angle, prominent mountain/rim peaks, and random micro-relief.
 */
function generateHorizonProfile(
  baseObstacleDeg: number,
  peaks: { azimuth: number; heightDeg: number; widthDeg: number }[]
): HorizonPoint[] {
  const points: HorizonPoint[] = [];

  for (let az = 0; az < 360; az += 5) {
    let obstacle = baseObstacleDeg;

    for (const p of peaks) {
      let diff = Math.abs(az - p.azimuth);
      if (diff > 180) diff = 360 - diff;
      if (diff < p.widthDeg) {
        // Gaussian/Cosine peak profile
        const factor = Math.cos((diff / p.widthDeg) * (Math.PI / 2));
        obstacle += (p.heightDeg - baseObstacleDeg) * Math.pow(factor, 2);
      }
    }

    // Add slight natural terrain undulation
    const noise = Math.sin((az * 4 * Math.PI) / 180) * 0.15 + Math.cos((az * 7 * Math.PI) / 180) * 0.1;
    points.push({
      azimuth: az,
      elevationMask: Math.max(-0.5, Number((obstacle + noise).toFixed(2))),
    });
  }

  return points;
}

export const CANDIDATE_LANDING_SITES: LandingSite[] = [
  {
    id: 'site-shackleton-ridge',
    name: 'Shackleton - Connecting Ridge',
    code: 'ART-SCR-01',
    latitude: -89.44,
    longitude: 124.5,
    elevationKm: 1.25,
    meanSlopeDeg: 8.4,
    maxSlopeDeg: 16.2,
    scientificTarget: 'Permanently Shadowed Region (PSR) Ice & Ancient Mantle Regolith',
    description:
      'Narrow elevated ridge connecting Shackleton and de Gerlache craters. One of the highest illumination locations on the Moon with periods of near-continuous sunlight during southern summer.',
    tags: ['Artemis III Top Tier', 'Peak of Light', 'High Illumination'],
    horizonProfile: generateHorizonProfile(0.8, [
      { azimuth: 175, heightDeg: 3.8, widthDeg: 45 }, // Shackleton interior rim
      { azimuth: 310, heightDeg: 2.4, widthDeg: 35 }, // de Gerlache flank
      { azimuth: 45, heightDeg: 1.1, widthDeg: 30 },
    ]),
  },
  {
    id: 'site-peak-shackleton',
    name: 'Peak Near Shackleton',
    code: 'ART-PNS-02',
    latitude: -89.54,
    longitude: 129.8,
    elevationKm: 1.78,
    meanSlopeDeg: 11.2,
    maxSlopeDeg: 21.0,
    scientificTarget: 'Sub-surface Volatiles & South Pole-Aitken (SPA) Basin Ejecta',
    description:
      'A sharp topographic high point adjacent to Shackleton crater rim. Receives extended solar exposure but exhibits steeper landing slopes requiring precision hazard detection avoidance.',
    tags: ['Artemis III Candidate', 'Steep Slopes', 'High Visibility'],
    horizonProfile: generateHorizonProfile(1.1, [
      { azimuth: 190, heightDeg: 4.2, widthDeg: 50 },
      { azimuth: 275, heightDeg: 2.1, widthDeg: 30 },
      { azimuth: 80, heightDeg: 1.4, widthDeg: 25 },
    ]),
  },
  {
    id: 'site-malapert',
    name: 'Malapert Massif',
    code: 'ART-MLP-03',
    latitude: -85.99,
    longitude: -2.9,
    elevationKm: 5.1,
    meanSlopeDeg: 4.8,
    maxSlopeDeg: 10.5,
    scientificTarget: 'Relay Telecommunications & Long-Duration Lunar Base Infrastructure',
    description:
      'A colossal 5,000-meter-high mountain plateau. Unmatched Direct-to-Earth line of sight (~94% uninterrupted) and low obstacle horizon, making it the premier site for a permanent lunar outpost.',
    tags: ['Base Camp Ideal', 'Superb DTE Comms', 'Gentle Plateau'],
    horizonProfile: generateHorizonProfile(0.2, [
      { azimuth: 120, heightDeg: 0.9, widthDeg: 30 },
      { azimuth: 240, heightDeg: 0.7, widthDeg: 25 },
    ]),
  },
  {
    id: 'site-de-gerlache-1',
    name: 'de Gerlache Rim 1',
    code: 'ART-DGR-04',
    latitude: -88.31,
    longitude: -88.8,
    elevationKm: 1.42,
    meanSlopeDeg: 7.1,
    maxSlopeDeg: 14.8,
    scientificTarget: 'Volatile Sequestration & Lunar South Pole Stratigraphy',
    description:
      'Elevated crater rim offering accessible slopes into deep interior shadows where primordial volatiles have remained frozen for billions of years.',
    tags: ['Artemis III Candidate', 'PSR Access', 'Moderate Slopes'],
    horizonProfile: generateHorizonProfile(1.2, [
      { azimuth: 40, heightDeg: 3.1, widthDeg: 40 },
      { azimuth: 210, heightDeg: 2.5, widthDeg: 35 },
    ]),
  },
  {
    id: 'site-de-gerlache-2',
    name: 'de Gerlache Rim 2',
    code: 'ART-DGR-05',
    latitude: -88.1,
    longitude: -75.4,
    elevationKm: 1.15,
    meanSlopeDeg: 6.5,
    maxSlopeDeg: 13.0,
    scientificTarget: 'Multi-km Rover Traverse & In-Situ Resource Utilization (ISRU)',
    description:
      'Smooth, wide ridge with lower roughness and gentle ingress routes for lunar terrain rovers (LTV) traveling between sunlight and shadowed crater floors.',
    tags: ['Rover Friendly', 'Low Roughness'],
    horizonProfile: generateHorizonProfile(1.0, [
      { azimuth: 35, heightDeg: 2.8, widthDeg: 35 },
      { azimuth: 180, heightDeg: 1.9, widthDeg: 30 },
    ]),
  },
  {
    id: 'site-haworth',
    name: 'Haworth Rim',
    code: 'ART-HAW-06',
    latitude: -87.45,
    longitude: -5.1,
    elevationKm: 0.85,
    meanSlopeDeg: 9.2,
    maxSlopeDeg: 18.5,
    scientificTarget: 'Deep Cold Trap Volatiles (< 40 Kelvin)',
    description:
      'Bordering Haworth crater, which hosts one of the coldest known spots in the solar system. Excellent for ice core extraction science, though crater walls introduce notable southern horizon masks.',
    tags: ['Cryogenic Traps', 'Coldest Site'],
    horizonProfile: generateHorizonProfile(1.4, [
      { azimuth: 160, heightDeg: 4.6, widthDeg: 55 },
      { azimuth: 260, heightDeg: 2.9, widthDeg: 40 },
    ]),
  },
  {
    id: 'site-nobile-1',
    name: 'Nobile Rim 1',
    code: 'ART-NOB-07',
    latitude: -85.25,
    longitude: 35.8,
    elevationKm: 2.15,
    meanSlopeDeg: 5.9,
    maxSlopeDeg: 12.4,
    scientificTarget: 'VIPER Rover Traverse Region & Impact Melt Sheets',
    description:
      'Wide rim area characterized by smooth rolling terrain and diverse micro-environments, enabling scientific exploration of both ancient highlands and localized shadowed craters.',
    tags: ['VIPER Site', 'Wide Landing Ellipse'],
    horizonProfile: generateHorizonProfile(0.6, [
      { azimuth: 200, heightDeg: 2.2, widthDeg: 40 },
      { azimuth: 340, heightDeg: 1.5, widthDeg: 30 },
    ]),
  },
  {
    id: 'site-faustini',
    name: 'Faustini Rim A',
    code: 'ART-FST-08',
    latitude: -87.18,
    longitude: 77.0,
    elevationKm: 2.34,
    meanSlopeDeg: 7.8,
    maxSlopeDeg: 15.6,
    scientificTarget: 'Ejecta Blanket from South Pole-Aitken & Polar Regolith Evolution',
    description:
      'High-altitude vantage point perched between Faustini and Shoemaker craters. Offers favorable thermal conditions and consistent communication windows back to ground stations on Earth.',
    tags: ['High Altitude', 'Balanced Lighting'],
    horizonProfile: generateHorizonProfile(0.9, [
      { azimuth: 110, heightDeg: 3.4, widthDeg: 45 },
      { azimuth: 290, heightDeg: 1.8, widthDeg: 35 },
    ]),
  },
  {
    id: 'site-amundsen',
    name: 'Amundsen Rim',
    code: 'ART-AMD-09',
    latitude: -84.44,
    longitude: 82.8,
    elevationKm: 2.52,
    meanSlopeDeg: 6.8,
    maxSlopeDeg: 13.9,
    scientificTarget: 'Central Peak Complex & Fresh Impact Craters',
    description:
      'Situated at lower polar latitude, Amundsen Rim benefits from higher solar elevation peaks during lunar summer, providing abundant power for early crewed missions.',
    tags: ['Higher Solar Elevation', 'Large Crater System'],
    horizonProfile: generateHorizonProfile(0.7, [
      { azimuth: 80, heightDeg: 2.5, widthDeg: 40 },
      { azimuth: 220, heightDeg: 1.7, widthDeg: 30 },
    ]),
  },
  {
    id: 'site-leibnitz',
    name: 'Leibnitz Beta Plateau',
    code: 'ART-LBN-10',
    latitude: -85.8,
    longitude: 28.5,
    elevationKm: 3.45,
    meanSlopeDeg: 5.2,
    maxSlopeDeg: 11.0,
    scientificTarget: 'Ancient Crustal Material & Seismic Monitoring Station',
    description:
      'A broad, high-elevation plateau south of Nobile crater with very low terrain slope hazards and expansive visibility of both Earth and Sun.',
    tags: ['Low Slope Risk', 'Safe Landing Zone'],
    horizonProfile: generateHorizonProfile(0.4, [
      { azimuth: 140, heightDeg: 1.2, widthDeg: 30 },
      { azimuth: 320, heightDeg: 1.0, widthDeg: 25 },
    ]),
  },
];

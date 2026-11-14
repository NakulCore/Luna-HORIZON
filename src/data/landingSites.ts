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
        const factor = Math.cos((diff / p.widthDeg) * (Math.PI / 2));
        obstacle += (p.heightDeg - baseObstacleDeg) * Math.pow(factor, 2);
      }
    }

    const noise = Math.sin((az * 4 * Math.PI) / 180) * 0.15 + Math.cos((az * 7 * Math.PI) / 180) * 0.1;
    points.push({
      azimuth: az,
      elevationMask: Math.max(-0.5, Number((obstacle + noise).toFixed(2))),
    });
  }

  return points;
}

export const CANDIDATE_LANDING_SITES: LandingSite[] = [
  // =========================================================================
  // NASA CLPS (COMMERCIAL LUNAR PAYLOAD SERVICES) - FROM OFFICIAL NASA MANIFEST
  // =========================================================================
  {
    id: 'clps-im2-prime1',
    name: 'Intuitive Machines IM-2 (PRIME-1)',
    code: 'CLPS-TO-PRIME-1',
    program: 'CLPS',
    hemisphere: 'South Pole',
    landerName: 'NOVA-C',
    clpsAward: 'TO PRIME-1',
    latitude: -89.44,
    longitude: 124.5,
    elevationKm: 1.25,
    meanSlopeDeg: 8.4,
    maxSlopeDeg: 16.2,
    scientificTarget: 'PRIME-1 Drill & Mass Spectrometer for Volatiles Ice Prospecting',
    description:
      'Targeted for the Shackleton Connecting Ridge. Carries the TRIDENT 1-meter drill to extract subsurface volatile ice for real-time mass spectrometry analysis.',
    tags: ['NASA CLPS Site #10', 'NOVA-C Lander', 'TO PRIME-1', 'South Pole'],
    horizonProfile: generateHorizonProfile(0.8, [
      { azimuth: 175, heightDeg: 3.8, widthDeg: 45 },
      { azimuth: 310, heightDeg: 2.4, widthDeg: 35 },
      { azimuth: 45, heightDeg: 1.1, widthDeg: 30 },
    ]),
  },
  {
    id: 'clps-im1-malapert',
    name: 'Intuitive Machines IM-1 (Odysseus)',
    code: 'CLPS-TO-2-IM',
    program: 'CLPS',
    hemisphere: 'South Pole',
    landerName: 'NOVA-C',
    clpsAward: 'TO 2-IM',
    latitude: -80.13,
    longitude: -1.44,
    elevationKm: 2.85,
    meanSlopeDeg: 6.2,
    maxSlopeDeg: 12.0,
    scientificTarget: 'First Commercial Lunar Landing (Malapert A Crater)',
    description:
      'Historic commercial lunar landing near Malapert A crater. Positioned on the elevated plateau flanking Malapert Massif with superior Earth communication angles.',
    tags: ['NASA CLPS Site #6', 'NOVA-C Lander', 'Completed Mission', 'South Pole'],
    horizonProfile: generateHorizonProfile(0.5, [
      { azimuth: 150, heightDeg: 1.8, widthDeg: 35 },
      { azimuth: 280, heightDeg: 1.2, widthDeg: 30 },
    ]),
  },
  {
    id: 'clps-griffin-mouton',
    name: 'Astrobotic Griffin Mission-1',
    code: 'CLPS-TO-20A',
    program: 'CLPS',
    hemisphere: 'South Pole',
    landerName: 'Griffin Lunar Lander',
    clpsAward: 'TO 20A',
    latitude: -84.9,
    longitude: -29.5,
    elevationKm: 3.82,
    meanSlopeDeg: 5.4,
    maxSlopeDeg: 11.2,
    scientificTarget: 'Heavy Payload Delivery to Mons Mouton Polar Plateau',
    description:
      'Massive flat plateau at Mons Mouton named after NASA mathematician Melba Mouton. Features extended periods of solar illumination and direct line-of-sight to Earth.',
    tags: ['NASA CLPS Site #7', 'Griffin Lander', 'TO 20A', 'Mons Mouton'],
    horizonProfile: generateHorizonProfile(0.4, [
      { azimuth: 100, heightDeg: 1.6, widthDeg: 30 },
      { azimuth: 260, heightDeg: 1.1, widthDeg: 25 },
    ]),
  },
  {
    id: 'clps-im4-mouton',
    name: 'Intuitive Machines IM-4',
    code: 'CLPS-CP-22-IM4',
    program: 'CLPS',
    hemisphere: 'South Pole',
    landerName: 'NOVA-C',
    clpsAward: 'CP-22',
    latitude: -84.9,
    longitude: -31.0,
    elevationKm: 3.65,
    meanSlopeDeg: 5.8,
    maxSlopeDeg: 11.8,
    scientificTarget: 'South Pole Long-Duration Surface Payload Deployment',
    description:
      'Follow-on mission to Mons Mouton under NASA Task Order CP-22 carrying international scientific experiments and ESA packages.',
    tags: ['NASA CLPS Site #8', 'NOVA-C Lander', 'CP-22', 'Mons Mouton'],
    horizonProfile: generateHorizonProfile(0.45, [
      { azimuth: 95, heightDeg: 1.5, widthDeg: 30 },
      { azimuth: 270, heightDeg: 1.3, widthDeg: 25 },
    ]),
  },
  {
    id: 'clps-blue-moon-mk1',
    name: 'Blue Origin Blue Moon / MK1 Pathfinder',
    code: 'CLPS-CP-22-BO',
    program: 'CLPS',
    hemisphere: 'South Pole',
    landerName: 'Blue Moon Mark 1 Lander',
    clpsAward: 'CP-22',
    latitude: -86.5,
    longitude: 15.0,
    elevationKm: 2.9,
    meanSlopeDeg: 6.0,
    maxSlopeDeg: 12.5,
    scientificTarget: 'Cargo & Pathfinder Demonstration for Artemis Human Landing System',
    description:
      'Direct cargo lander technology demonstration verifying hydrogen/oxygen cryo-propellant boil-off mitigation and precision South Polar landing capability.',
    tags: ['NASA CLPS Site #9', 'Blue Moon MK1', 'CP-22', 'South Pole'],
    horizonProfile: generateHorizonProfile(0.6, [
      { azimuth: 130, heightDeg: 2.1, widthDeg: 35 },
      { azimuth: 310, heightDeg: 1.4, widthDeg: 30 },
    ]),
  },
  {
    id: 'clps-im3-reiner-gamma',
    name: 'Intuitive Machines IM-3 (Reiner Gamma)',
    code: 'CLPS-TO-CP-11',
    program: 'CLPS',
    hemisphere: 'Near Side',
    landerName: 'NOVA-C',
    clpsAward: 'TO CP-11',
    latitude: 7.5,
    longitude: -59.0,
    elevationKm: -1.8,
    meanSlopeDeg: 2.8,
    maxSlopeDeg: 6.5,
    scientificTarget: 'Lunar Magnetic Swirls & Space Weathering Mini-Magnetosphere',
    description:
      'Equatorial Near Side site at Reiner Gamma swirl. Flat volcanic plains with exceptional 100% continuous Direct-to-Earth communication and ~14 days of direct sunlight.',
    tags: ['NASA CLPS Site #2', 'NOVA-C Lander', 'Near Side', 'Magnetic Swirl'],
    horizonProfile: generateHorizonProfile(0.1, [
      { azimuth: 90, heightDeg: 0.3, widthDeg: 20 },
      { azimuth: 270, heightDeg: 0.2, widthDeg: 20 },
    ]),
  },
  {
    id: 'clps-blue-ghost-1',
    name: 'Firefly Blue Ghost Mission 1',
    code: 'CLPS-TO-19D',
    program: 'CLPS',
    hemisphere: 'Near Side',
    landerName: 'Blue Ghost Lander',
    clpsAward: 'TO 19D',
    latitude: 18.56,
    longitude: 61.81,
    elevationKm: -3.2,
    meanSlopeDeg: 3.1,
    maxSlopeDeg: 7.2,
    scientificTarget: 'Mare Crisium Basin Regolith & Regolith-X-Ray Imaging',
    description:
      'Near Side eastern mare basin hosting 10 NASA-sponsored payloads exploring the Moon’s regolith thermal properties, GPS line-of-sight, and solar wind interactions.',
    tags: ['NASA CLPS Site #3', 'Blue Ghost Lander', 'Near Side', 'Mare Crisium'],
    horizonProfile: generateHorizonProfile(0.15, [
      { azimuth: 60, heightDeg: 0.8, widthDeg: 40 },
      { azimuth: 240, heightDeg: 0.4, widthDeg: 30 },
    ]),
  },
  {
    id: 'clps-blue-ghost-2',
    name: 'Firefly Blue Ghost Mission 2',
    code: 'CLPS-TO-CS-3-4',
    program: 'CLPS',
    hemisphere: 'Far Side',
    landerName: 'Blue Ghost Lander',
    clpsAward: 'TO CS-3 and CS-4',
    latitude: -75.0,
    longitude: 132.5,
    elevationKm: -1.5,
    meanSlopeDeg: 6.9,
    maxSlopeDeg: 14.2,
    scientificTarget: 'Far Side Radio Astronomy & Lunar South Pole Relay Satellite Network',
    description:
      'Far Side mission shielded from Earth radio frequency interference. Operates in conjunction with an orbital relay satellite for non-line-of-sight telecommunications.',
    tags: ['NASA CLPS Site #4', 'Blue Ghost Lander', 'Far Side', 'Relay Required'],
    horizonProfile: generateHorizonProfile(1.5, [
      { azimuth: 120, heightDeg: 3.2, widthDeg: 45 },
      { azimuth: 300, heightDeg: 2.8, widthDeg: 40 },
    ]),
  },
  {
    id: 'clps-draper-apex',
    name: 'Team Draper (ispace-U.S. APEX 1.0)',
    code: 'CLPS-TO-CP-12',
    program: 'CLPS',
    hemisphere: 'Far Side',
    landerName: 'ispace-U.S. APEX 1.0',
    clpsAward: 'TO CP-12',
    latitude: -75.2,
    longitude: 132.8,
    elevationKm: -1.2,
    meanSlopeDeg: 7.2,
    maxSlopeDeg: 15.0,
    scientificTarget: 'Schrödinger Basin Impact Melt Geology & Geophysics',
    description:
      'Complex impact basin on the lunar far side. Collects seismic and heat flow data from deep inside the South Pole-Aitken Basin using satellite relay.',
    tags: ['NASA CLPS Site #5', 'APEX Lander', 'Far Side', 'Schrödinger Basin'],
    horizonProfile: generateHorizonProfile(1.6, [
      { azimuth: 110, heightDeg: 3.5, widthDeg: 45 },
      { azimuth: 290, heightDeg: 2.9, widthDeg: 40 },
    ]),
  },

  // =========================================================================
  // NASA ARTEMIS HUMAN LANDING SYSTEM (HLS) CANDIDATE REGIONS
  // =========================================================================
  {
    id: 'artemis-shackleton-ridge',
    name: 'Shackleton - Connecting Ridge',
    code: 'ART-SCR-01',
    program: 'ARTEMIS',
    hemisphere: 'South Pole',
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
      { azimuth: 175, heightDeg: 3.8, widthDeg: 45 },
      { azimuth: 310, heightDeg: 2.4, widthDeg: 35 },
      { azimuth: 45, heightDeg: 1.1, widthDeg: 30 },
    ]),
  },
  {
    id: 'artemis-malapert',
    name: 'Malapert Massif',
    code: 'ART-MLP-03',
    program: 'ARTEMIS',
    hemisphere: 'South Pole',
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
    id: 'artemis-de-gerlache-1',
    name: 'de Gerlache Rim 1',
    code: 'ART-DGR-04',
    program: 'ARTEMIS',
    hemisphere: 'South Pole',
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
    id: 'artemis-haworth',
    name: 'Haworth Rim',
    code: 'ART-HAW-06',
    program: 'ARTEMIS',
    hemisphere: 'South Pole',
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
    id: 'artemis-nobile-1',
    name: 'Nobile Rim 1',
    code: 'ART-NOB-07',
    program: 'ARTEMIS',
    hemisphere: 'South Pole',
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
    id: 'artemis-amundsen',
    name: 'Amundsen Rim',
    code: 'ART-AMD-09',
    program: 'ARTEMIS',
    hemisphere: 'South Pole',
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
];

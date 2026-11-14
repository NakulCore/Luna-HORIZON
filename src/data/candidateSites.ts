import { HorizonPoint, LandingSite } from '../types/mission';

/**
 * Procedural LOLA-calibrated horizon obstruction profile generator
 * Models realistic ridge lines, crater walls, and peaks based on LOLA topography statistics
 */
export function generateLolaHorizonProfile(
  baseElevationDeg: number,
  peakAzimuths: { az: number; height: number; width: number }[],
  craterRimDepressions: { az: number; depth: number; width: number }[] = []
): HorizonPoint[] {
  const points: HorizonPoint[] = [];

  for (let az = 0; az < 360; az += 2) {
    let elev = baseElevationDeg;

    // Apply peaks
    for (const peak of peakAzimuths) {
      let diff = Math.abs(az - peak.az);
      if (diff > 180) diff = 360 - diff;
      const sigma = peak.width / 2.355; // Gaussian width
      const contribution = peak.height * Math.exp(-(diff * diff) / (2 * sigma * sigma));
      elev += contribution;
    }

    // Apply valleys/craters
    for (const valley of craterRimDepressions) {
      let diff = Math.abs(az - valley.az);
      if (diff > 180) diff = 360 - diff;
      const sigma = valley.width / 2.355;
      const depression = valley.depth * Math.exp(-(diff * diff) / (2 * sigma * sigma));
      elev = Math.max(0, elev - depression);
    }

    // Add fine LOLA surface roughness noise (0.1 deg)
    const microTerrain = 0.08 * Math.sin(az * 0.17) + 0.05 * Math.cos(az * 0.37);
    points.push({
      azimuth: az,
      elevation: Math.max(0, parseFloat((elev + microTerrain).toFixed(2)))
    });
  }

  return points;
}

export const CANDIDATE_LANDING_SITES: LandingSite[] = [
  {
    id: 'artemis-shackleton-connecting-ridge',
    name: 'Shackleton Connecting Ridge',
    category: 'artemis',
    region: 'South Pole / Shackleton Crater Rim',
    latitude: -89.78,
    longitude: 128.45,
    elevationKm: 1.12,
    averageIlluminationPct: 86.4,
    slopeDegrees: 6.8,
    distanceToPsrKm: 0.45,
    priorityTier: 'Primary',
    description: 'Premier candidate for Artemis III crewed lunar landing. Located on the razor-thin elevated rim between Shackleton and de Gerlache craters. Offers quasi-continuous solar illumination during austral summer and immediate access to 4.2 km-deep cryogenic water ice traps.',
    scientificObjectives: [
      'Sample cryogenic volatiles in Shackleton crater PSR',
      'Deploy long-duration South Pole environmental monitoring package',
      'Direct measurement of regolith thermal inertia in permanent shadows'
    ],
    engineeringChallenges: [
      'Steep terrain slope hazard on crater wall flanks (>15° slopes within 200m)',
      'Narrow landing ellipse margin (<100m landing precision required)',
      'Earth dips below terrain horizon during maximum northern libration'
    ],
    horizonProfile: generateLolaHorizonProfile(
      0.8,
      [
        { az: 45, height: 2.8, width: 35 }, // Shackleton rim high point
        { az: 135, height: 1.9, width: 40 }, // Peak near Shackleton
        { az: 260, height: 3.2, width: 30 }  // Connecting Ridge shoulder
      ],
      [
        { az: 190, depth: 0.6, width: 25 }, // Low notch towards Faustini
        { az: 330, depth: 0.5, width: 30 }  // de Gerlache gap
      ]
    )
  },
  {
    id: 'artemis-malapert-mountain',
    name: 'Malapert Mountain (Peak of Light)',
    category: 'artemis',
    region: 'Malapert Massif',
    latitude: -85.92,
    longitude: 2.91,
    elevationKm: 5.08,
    averageIlluminationPct: 91.2,
    slopeDegrees: 4.2,
    distanceToPsrKm: 4.8,
    priorityTier: 'Primary',
    description: 'A massive 5,000-meter-high mountain massif overlooking the lunar South Pole. Because of its extreme elevation, it remains continuously bathed in sunlight for over 90% of the year and maintains near-permanent Direct-to-Earth radio line-of-sight.',
    scientificObjectives: [
      'Regional geochronology of South Pole-Aitken (SPA) basin impact melt sheet',
      'High-altitude lunar astronomical observatory site assessment',
      'Long-baseline lunar seismic network node installation'
    ],
    engineeringChallenges: [
      'Rocky boulder fields on upper summit plateau',
      'Transit route to nearby PSRs requires traversing steep 20° descents',
      'High thermal swing on unshadowed summit regolith'
    ],
    horizonProfile: generateLolaHorizonProfile(
      0.2, // Summit elevation sits above surrounding horizon
      [
        { az: 180, height: 1.1, width: 20 }, // South ridge
        { az: 290, height: 0.8, width: 15 }  // Cabeus massif distant edge
      ],
      []
    )
  },
  {
    id: 'artemis-peak-near-shackleton',
    name: 'Peak Near Shackleton',
    category: 'artemis',
    region: 'South Pole Highlands',
    latitude: -88.80,
    longitude: 124.20,
    elevationKm: 1.84,
    averageIlluminationPct: 83.1,
    slopeDegrees: 7.9,
    distanceToPsrKm: 1.2,
    priorityTier: 'Primary',
    description: 'Prominent peak situated 30 km from the exact South Pole. Offers strategic elevated vantage overlooking both Shackleton and Shoemaker craters with excellent solar persistence during summer mission windows.',
    scientificObjectives: [
      'Cross-sampling of Shoemaker and Shackleton ejecta blankets',
      'Analysis of solar wind implantation in high-latitude regolith',
      'Radio astronomy background measurement in lunar shadow'
    ],
    engineeringChallenges: [
      'Significant shadow corridors cast by Shackleton rim during autumn',
      'Touchdown velocity constraints on sloping crest'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.1,
      [
        { az: 10, height: 2.4, width: 25 },
        { az: 110, height: 3.1, width: 35 }, // Shoemaker rim
        { az: 230, height: 1.8, width: 30 }
      ]
    )
  },
  {
    id: 'artemis-de-gerlache-rim-1',
    name: 'de Gerlache Rim 1',
    category: 'artemis',
    region: 'de Gerlache Crater Western Wall',
    latitude: -88.71,
    longitude: -88.35,
    elevationKm: 0.95,
    averageIlluminationPct: 78.5,
    slopeDegrees: 5.5,
    distanceToPsrKm: 0.8,
    priorityTier: 'Primary',
    description: 'Western rim crest of de Gerlache crater. Features broad, flat plateaus on the outer flank offering benign landing slopes while keeping traverse distances to deep interior PSR cold traps under 1 km.',
    scientificObjectives: [
      'In-situ resource utilization (ISRU) ice concentration drilling',
      'Spectroscopic analysis of volatile sublimation under rover headlights',
      'Stratigraphy of South Pole crater rims'
    ],
    engineeringChallenges: [
      'Shadow cast by eastern rim during low sun elevations',
      'Occasional Earth occultation when Earth is at minimum declination'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.2,
      [
        { az: 85, height: 3.5, width: 45 },  // de Gerlache eastern rim
        { az: 175, height: 2.1, width: 30 },
        { az: 310, height: 1.5, width: 20 }
      ]
    )
  },
  {
    id: 'artemis-connecting-ridge-ext',
    name: 'Connecting Ridge Extension',
    category: 'artemis',
    region: 'South Pole Ridge Corridor',
    latitude: -89.44,
    longitude: 152.18,
    elevationKm: 0.82,
    averageIlluminationPct: 81.3,
    slopeDegrees: 6.2,
    distanceToPsrKm: 0.6,
    priorityTier: 'Secondary',
    description: 'Extension ridge branching north-east from the Shackleton Connecting Ridge towards the South Pole highlands. Provides gentle approach corridors for the Human Landing System (HLS).',
    scientificObjectives: [
      'Study regolith grain size variations along polar ridges',
      'Deploy autonomous solar array experiment'
    ],
    engineeringChallenges: [
      'Complex intermittent shadow bands from moving solar vector'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.0,
      [
        { az: 60, height: 2.6, width: 30 },
        { az: 210, height: 2.9, width: 40 }
      ]
    )
  },
  {
    id: 'artemis-haworth-rim',
    name: 'Haworth Crater Rim',
    category: 'artemis',
    region: 'Haworth Crater Massif',
    latitude: -87.52,
    longitude: -5.19,
    elevationKm: 1.45,
    averageIlluminationPct: 79.8,
    slopeDegrees: 5.8,
    distanceToPsrKm: 1.1,
    priorityTier: 'Secondary',
    description: 'High northern rim of Haworth crater, which shelters one of the coldest Permanently Shadowed Regions on the Moon (measured at 35 Kelvin by Diviner).',
    scientificObjectives: [
      'Investigation of ultra-cold volatile chemistry (methane, ammonia, CO2 ices)',
      'Core drill sampling into pristine ice-cemented regolith'
    ],
    engineeringChallenges: [
      'Extreme cryogenic temperatures within traverse shadow',
      'Earth comm link low on horizon (~2° above rim)'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.4,
      [
        { az: 170, height: 4.1, width: 50 }, // Haworth inner crater drop
        { az: 20, height: 1.8, width: 30 }
      ]
    )
  },
  {
    id: 'artemis-nobile-rim-1',
    name: 'Nobile Rim 1 (VIPER Zone)',
    category: 'artemis',
    region: 'Nobile Crater Highlands',
    latitude: -85.25,
    longitude: 53.52,
    elevationKm: 1.35,
    averageIlluminationPct: 80.2,
    slopeDegrees: 4.8,
    distanceToPsrKm: 1.4,
    priorityTier: 'Primary',
    description: 'Landing area targeted for NASA VIPER rover mission. Broad, relatively smooth highland plateau between Nobile and Faustini craters featuring accessible micro-cold traps.',
    scientificObjectives: [
      'Ground-truth neutron spectrometer signatures of subsurface hydrogen',
      'Rover traverse viability across high-latitude polar plains'
    ],
    engineeringChallenges: [
      'Multiple 24-to-48 hour eclipse periods requiring battery survival',
      'Dust levitation effects along the terminator'
    ],
    horizonProfile: generateLolaHorizonProfile(
      0.9,
      [
        { az: 120, height: 2.2, width: 35 },
        { az: 240, height: 2.5, width: 40 }
      ]
    )
  },
  {
    id: 'artemis-amundsen-rim',
    name: 'Amundsen Crater Rim',
    category: 'artemis',
    region: 'Amundsen Crater Rim Plateau',
    latitude: -84.38,
    longitude: 82.80,
    elevationKm: 2.15,
    averageIlluminationPct: 82.7,
    slopeDegrees: 5.1,
    distanceToPsrKm: 2.8,
    priorityTier: 'Secondary',
    description: 'Northern rim crest of Amundsen crater (105 km diameter). Large ancient impact basin exposing central peak uplift materials from the lower lunar crust.',
    scientificObjectives: [
      'Sample uplifted anorthosite and deep crustal lithologies',
      'Investigate central peak shock metamorphism'
    ],
    engineeringChallenges: [
      'Longer traverse distances to permanent ice reserves'
    ],
    horizonProfile: generateLolaHorizonProfile(
      0.7,
      [
        { az: 195, height: 3.8, width: 55 },
        { az: 340, height: 1.2, width: 25 }
      ]
    )
  },
  {
    id: 'artemis-faustini-rim',
    name: 'Faustini Rim A',
    category: 'artemis',
    region: 'Faustini / Shoemaker Divide',
    latitude: -87.12,
    longitude: 77.05,
    elevationKm: 1.62,
    averageIlluminationPct: 81.0,
    slopeDegrees: 6.0,
    distanceToPsrKm: 0.9,
    priorityTier: 'Secondary',
    description: 'Elevated ridge separating Faustini crater and Shoemaker crater. Excellent strategic hub for robotic precursor scouts exploring multiple independent cold traps.',
    scientificObjectives: [
      'Dual-crater volatile comparative geochemistry',
      'Analysis of cosmic ray sputtering rates on exposed polar ice'
    ],
    engineeringChallenges: [
      'Complex local topography creating sharp line-of-sight occultation'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.1,
      [
        { az: 90, height: 3.2, width: 40 },
        { az: 270, height: 2.8, width: 35 }
      ]
    )
  },
  {
    id: 'artemis-leibniz-beta',
    name: 'Leibniz Beta Plateau',
    category: 'artemis',
    region: 'South Pole-Aitken Basin Rim',
    latitude: -85.80,
    longitude: 29.80,
    elevationKm: 3.40,
    averageIlluminationPct: 84.8,
    slopeDegrees: 4.5,
    distanceToPsrKm: 3.2,
    priorityTier: 'Secondary',
    description: 'Enormous elevated plateau located on the inner ring structure of the South Pole-Aitken impact basin. Features vast, flat landing zones suitable for large cargo landers.',
    scientificObjectives: [
      'Direct dating of South Pole-Aitken basin formation event (~4.3 Ga)',
      'Characterize mantle-derived impact melt rocks'
    ],
    engineeringChallenges: [
      'Distal distance to water ice deposits'
    ],
    horizonProfile: generateLolaHorizonProfile(
      0.4,
      [
        { az: 140, height: 1.6, width: 30 },
        { az: 320, height: 1.2, width: 20 }
      ]
    )
  },

  // CLPS Commercial Landers
  {
    id: 'clps-im1-odysseus',
    name: 'Malapert A (Intuitive Machines IM-1)',
    category: 'clps',
    region: 'Malapert A Crater',
    latitude: -80.13,
    longitude: 1.44,
    elevationKm: -0.35,
    averageIlluminationPct: 71.0,
    slopeDegrees: 8.5,
    distanceToPsrKm: 12.0,
    priorityTier: 'Reference',
    description: 'Landing site of Intuitive Machines IM-1 "Odysseus" lander (February 2024), the first commercial vehicle to soft-land on the Moon and the closest landing to the South Pole at that time.',
    scientificObjectives: [
      'Commercial lunar delivery demonstration',
      'Space weather interaction with lunar regolith'
    ],
    engineeringChallenges: [
      'Rugged crater floor with rolling hills and boulder hazards'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.8,
      [
        { az: 0, height: 3.9, width: 45 },
        { az: 180, height: 4.5, width: 50 }
      ]
    )
  },
  {
    id: 'clps-mons-mouton',
    name: 'Mons Mouton (VIPER Target)',
    category: 'clps',
    region: 'South Pole Flat-Topped Mountain',
    latitude: -84.90,
    longitude: 31.60,
    elevationKm: 3.20,
    averageIlluminationPct: 85.0,
    slopeDegrees: 4.1,
    distanceToPsrKm: 2.1,
    priorityTier: 'Primary',
    description: 'A colossal flat-topped mountain rising 6 km above its surroundings. Flat mesa top provides generous landing safe zones with sweeping uninterrupted horizon views.',
    scientificObjectives: [
      'Detailed mapping of lunar water distribution at 1-meter resolution',
      'Volatile transport dynamics over day-night terminator cycles'
    ],
    engineeringChallenges: [
      'Cliffs bounding the mesa prevent roving off the mountain'
    ],
    horizonProfile: generateLolaHorizonProfile(
      0.3,
      [
        { az: 200, height: 1.2, width: 20 }
      ]
    )
  },

  // Historical & International
  {
    id: 'intl-chandrayaan-3',
    name: 'Shiv Shakti Point (Chandrayaan-3)',
    category: 'historical',
    region: 'Manzinus-Boguslawsky Highlands',
    latitude: -69.37,
    longitude: 32.32,
    elevationKm: -0.42,
    averageIlluminationPct: 52.0,
    slopeDegrees: 3.8,
    distanceToPsrKm: 45.0,
    priorityTier: 'Reference',
    description: 'Historic touchdown site of ISRO Chandrayaan-3 Vikram lander and Pragyan rover (August 23, 2023). Demonstrator of high-latitude landing precision and in-situ elemental composition (alpha particle X-ray spectrometer).',
    scientificObjectives: [
      'In-situ plasma density measurements with Langmuir probe',
      'First thermophysical profile of top 10cm polar regolith with ChaSTE'
    ],
    engineeringChallenges: [
      'Experiencing full 14-day cryogenic polar night (night survival challenges)'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.5,
      [
        { az: 90, height: 2.8, width: 35 },
        { az: 270, height: 2.5, width: 40 }
      ]
    )
  },
  {
    id: 'hist-apollo-11',
    name: 'Apollo 11 Tranquility Base',
    category: 'historical',
    region: 'Mare Tranquillitatis (Equatorial)',
    latitude: 0.67,
    longitude: 23.47,
    elevationKm: -2.57,
    averageIlluminationPct: 50.0,
    slopeDegrees: 1.2,
    distanceToPsrKm: 2500.0,
    priorityTier: 'Reference',
    description: 'First crewed landing on the Moon (July 20, 1969). Equatorial mare basalt plain. Serves as a reference benchmark for equatorial lighting (Sun ascends to 90° zenith overhead, unlike the grazing polar horizon).',
    scientificObjectives: [
      'First sample return of pristine lunar mare basalt',
      'Laser retroreflector array deployment for lunar laser ranging'
    ],
    engineeringChallenges: [
      'Boulders in West Crater required manual terminal diversion by Neil Armstrong'
    ],
    horizonProfile: generateLolaHorizonProfile(0.1, []) // Flat mare horizon
  },
  {
    id: 'hist-apollo-17',
    name: 'Apollo 17 Taurus-Littrow Valley',
    category: 'historical',
    region: 'Taurus-Littrow Valley',
    latitude: 20.19,
    longitude: 30.77,
    elevationKm: -2.10,
    averageIlluminationPct: 48.0,
    slopeDegrees: 8.2,
    distanceToPsrKm: 1800.0,
    priorityTier: 'Reference',
    description: 'Final Apollo landing mission (December 1972). Deep valley framed by the North and South Massifs (2 km high), demonstrating severe valley terrain horizon masking.',
    scientificObjectives: [
      'Discovery of pyroclastic orange volcanic glass beads',
      'Subsurface geological profiling with lunar seismic profiling'
    ],
    engineeringChallenges: [
      'High surrounding massifs created severe local horizon obstruction'
    ],
    horizonProfile: generateLolaHorizonProfile(
      1.0,
      [
        { az: 0, height: 12.5, width: 60 },   // North Massif
        { az: 180, height: 14.2, width: 65 }  // South Massif
      ]
    )
  }
];

/**
 * Creates a dynamic custom landing site entered by the user
 */
export function createCustomLandingSite(
  name: string,
  latitude: number,
  longitude: number,
  elevationKm: number = 0.0
): LandingSite {
  // Generate realistic horizon based on latitude (near poles = rugged rim effects, near equator = lower)
  const isPolar = Math.abs(latitude) > 75;
  const baseHorizon = isPolar ? 1.0 : 0.3;
  const peaks = isPolar
    ? [
        { az: 40, height: 2.2, width: 30 },
        { az: 160, height: 1.8, width: 35 },
        { az: 280, height: 2.5, width: 40 }
      ]
    : [{ az: 90, height: 0.8, width: 25 }];

  const approxIllum = isPolar ? 78.0 : 50.0;
  const distToPsr = isPolar ? Math.max(0.5, (90 - Math.abs(latitude)) * 25) : 2000;

  return {
    id: `custom-${Date.now()}`,
    name: name || `Custom Site (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
    category: 'custom',
    region: isPolar ? 'Custom Polar Region' : 'Custom Selenographic Region',
    latitude,
    longitude,
    elevationKm,
    averageIlluminationPct: approxIllum,
    slopeDegrees: 5.0,
    distanceToPsrKm: distToPsr,
    priorityTier: 'Reference',
    description: `User-defined landing site located at Selenographic coordinates: Latitude ${latitude.toFixed(4)}°, Longitude ${longitude.toFixed(4)}°, Elevation ${elevationKm.toFixed(2)} km.`,
    scientificObjectives: [
      'User-specified mission objectives evaluation',
      'Local horizon skyline obstruction verification'
    ],
    engineeringChallenges: [
      'Custom trajectory descent corridor evaluation'
    ],
    horizonProfile: generateLolaHorizonProfile(baseHorizon, peaks)
  };
}

import { EphemerisPoint, LandingSite, MissionWindowScore } from '../types/mission';

/**
 * Generates and downloads a CSV file containing high-resolution ephemeris trajectory telemetry
 */
export function exportTrajectoryToCsv(
  site: LandingSite,
  trajectory: EphemerisPoint[],
  filename?: string
): void {
  const headers = [
    'Timestamp_UTC',
    'Sun_Azimuth_deg',
    'Sun_Elevation_deg',
    'Sun_Horizon_Obstruction_deg',
    'Sun_Directly_Visible',
    'Solar_Flux_W_m2',
    'Earth_Azimuth_deg',
    'Earth_Elevation_deg',
    'Earth_Horizon_Obstruction_deg',
    'Earth_DTE_Visible',
    'DTE_Link_Margin_dB',
    'Earth_Phase',
    'Subsolar_Lat_deg',
    'Subsolar_Lon_deg',
    'Libration_Latitude_b_deg',
    'Libration_Longitude_l_deg',
    'Power_Viable',
    'Comm_Viable',
    'Joint_Feasible'
  ];

  const rows = trajectory.map((pt) => [
    pt.dateIso,
    pt.sunAzimuth.toFixed(3),
    pt.sunElevation.toFixed(3),
    pt.sunHorizonObstruction.toFixed(3),
    pt.isSunDirectlyVisible ? 1 : 0,
    pt.solarFluxWm2.toFixed(1),
    pt.earthAzimuth.toFixed(3),
    pt.earthElevation.toFixed(3),
    pt.earthHorizonObstruction.toFixed(3),
    pt.isEarthDirectlyVisible ? 1 : 0,
    pt.dteLinkMarginDb.toFixed(2),
    pt.earthPhase.toFixed(3),
    pt.subsolarLat.toFixed(4),
    pt.subsolarLon.toFixed(4),
    pt.subearthLat.toFixed(4),
    pt.subearthLon.toFixed(4),
    pt.isPowerViable ? 1 : 0,
    pt.isCommViable ? 1 : 0,
    pt.isJointMissionFeasible ? 1 : 0
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    filename || `${site.id}-trajectory-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports a complete JSON flight manifest
 */
export function exportFlightManifestJson(
  site: LandingSite,
  windowScore: MissionWindowScore,
  trajectory: EphemerisPoint[]
): void {
  const manifest = {
    missionManifestVersion: '2.0-NASA-SPACEAPPS',
    generationTime: new Date().toISOString(),
    landingSite: {
      id: site.id,
      name: site.name,
      region: site.region,
      selenographicCoordinates: {
        latitudeDeg: site.latitude,
        longitudeDeg: site.longitude,
        elevationKm: site.elevationKm
      },
      topography: {
        meanSlopeDeg: site.slopeDegrees,
        distanceToNearestPsrKm: site.distanceToPsrKm,
        annualIlluminationFractionPct: site.averageIlluminationPct
      },
      scientificObjectives: site.scientificObjectives,
      engineeringChallenges: site.engineeringChallenges
    },
    missionWindowEvaluation: windowScore,
    trajectorySummary: {
      totalTimeSteps: trajectory.length,
      sampleIntervalHours: 1,
      startTimeUtc: trajectory[0]?.dateIso,
      endTimeUtc: trajectory[trajectory.length - 1]?.dateIso
    }
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${site.id}-flight-manifest.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

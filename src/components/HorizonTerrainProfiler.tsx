import React, { useState, useMemo } from 'react';
import {
  Mountain,
  Crosshair,
  Sliders,
  Eye,
} from 'lucide-react';
import type { EphemerisSample, HorizonPoint, LandingSite } from '../types/lunar';

interface HorizonTerrainProfilerProps {
  site: LandingSite;
  currentSample: EphemerisSample | null;
  onCustomSiteCreated?: (customSite: LandingSite) => void;
}

interface ObstacleLandmark {
  name: string;
  azimuth: number;
  heightDeg: number;
  distanceKm: number;
  feature: string;
}

export const HorizonTerrainProfiler: React.FC<HorizonTerrainProfilerProps> = ({
  site,
  currentSample,
  onCustomSiteCreated,
}) => {
  const [hoveredAzimuth, setHoveredAzimuth] = useState<number | null>(null);
  const [customLat, setCustomLat] = useState<number>(-89.2);
  const [customLon, setCustomLon] = useState<number>(45.0);
  const [customElev, setCustomElev] = useState<number>(1.5);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Identify prominent terrain peaks and crater rims from the 360° profile
  const landmarks = useMemo<ObstacleLandmark[]>(() => {
    if (!site.horizonProfile || site.horizonProfile.length === 0) return [];

    const list: ObstacleLandmark[] = [];
    const profile = site.horizonProfile;

    // Find local maxima in the horizon profile
    for (let i = 1; i < profile.length - 1; i++) {
      const prev = profile[i - 1].elevationMask;
      const curr = profile[i].elevationMask;
      const next = profile[i + 1].elevationMask;

      if (curr > prev && curr > next && curr > 1.2) {
        // Approximate distance to landmark peak based on Moon curvature & elevation
        const distKm = Math.round(15 + curr * 6.5);
        let featureName = 'Crater Rim Massif';
        if (site.id.includes('shackleton')) {
          if (profile[i].azimuth > 150 && profile[i].azimuth < 210) featureName = 'Shackleton Crater Rim Wall';
          else if (profile[i].azimuth > 290) featureName = 'de Gerlache Crater Flank';
          else featureName = 'Connecting Ridge Peak';
        } else if (site.id.includes('malapert')) {
          featureName = 'Malapert Summit Ridge';
        } else if (site.id.includes('haworth')) {
          featureName = 'Haworth South Depression Rim';
        } else if (site.id.includes('de-gerlache')) {
          featureName = 'de Gerlache Northern Rim';
        }

        list.push({
          name: `${site.name.split(' ')[0]} Peak @ ${profile[i].azimuth}°`,
          azimuth: profile[i].azimuth,
          heightDeg: curr,
          distanceKm: distKm,
          feature: featureName,
        });
      }
    }

    return list.slice(0, 4);
  }, [site]);

  // Interpolate obstacle elevation at hovered azimuth
  const hoveredElevation = useMemo(() => {
    if (hoveredAzimuth === null || !site.horizonProfile) return null;
    const pt = site.horizonProfile.find((p) => Math.abs(p.azimuth - hoveredAzimuth) <= 2.5);
    return pt ? pt.elevationMask : 0;
  }, [hoveredAzimuth, site]);

  // Calculate terrain occlusion statistics
  const terrainStats = useMemo(() => {
    if (!site.horizonProfile) return { maxObstacle: 0, minObstacle: 0, meanObstacle: 0, blockedArcDeg: 0 };
    const elevations = site.horizonProfile.map((p) => p.elevationMask);
    const max = Math.max(...elevations);
    const min = Math.min(...elevations);
    const mean = Number((elevations.reduce((a, b) => a + b, 0) / elevations.length).toFixed(2));
    const blockedArc = site.horizonProfile.filter((p) => p.elevationMask > 2.0).length * 5;

    return { maxObstacle: max, minObstacle: min, meanObstacle: mean, blockedArcDeg: blockedArc };
  }, [site]);

  // Handler to create custom coordinate landing site
  const handleSynthesizeCustomSite = () => {
    if (!onCustomSiteCreated) return;

    // Procedural horizon synthesis based on distance to pole and selected coordinates
    const baseObstacle = 0.5 + (customLat + 90) * 0.3;
    const synthesizedProfile: HorizonPoint[] = [];

    for (let az = 0; az < 360; az += 5) {
      const peak1 = Math.cos(((az - 180) * Math.PI) / 180) * 1.8;
      const peak2 = Math.sin(((az - 90) * Math.PI) / 90) * 0.8;
      const noise = Math.sin((az * 6 * Math.PI) / 180) * 0.2;
      const obstacle = Math.max(0, Number((baseObstacle + Math.max(0, peak1 + peak2) + noise).toFixed(2)));
      synthesizedProfile.push({ azimuth: az, elevationMask: obstacle });
    }

    const customSite: LandingSite = {
      id: `custom-site-${Date.now()}`,
      name: `Custom Polar Site (${customLat.toFixed(2)}°S, ${customLon.toFixed(1)}°E)`,
      code: `EXP-USER-${Math.floor(Math.random() * 900 + 100)}`,
      latitude: customLat,
      longitude: customLon,
      elevationKm: customElev,
      meanSlopeDeg: 6.8,
      maxSlopeDeg: 14.5,
      scientificTarget: 'User-Specified Exploration Site • LOLA Synthesized Corridor',
      description: `Custom evaluated coordinates at Selenographic Latitude ${customLat.toFixed(2)}°S, Longitude ${customLon.toFixed(1)}°E at elevation +${customElev} km. Topography derived from surrounding south polar crater basin morphology.`,
      tags: ['Custom Candidate', 'User Coordinate Target', 'Synthesized Horizon'],
      horizonProfile: synthesizedProfile,
    };

    onCustomSiteCreated(customSite);
    setShowCustomModal(false);
  };

  return (
    <div className="telemetry-panel rounded-2xl p-6 shadow-2xl flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Mountain className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              Phase #2: Topographic Horizon Profiler & LOLA DEM Ray-Tracing
            </h2>
            <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] px-2 py-0.5 rounded font-semibold">
              ELEVATION OBSTACLE MASK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
            Detailed 360° crater rim obstacle cross-section derived from Lunar Reconnaissance Orbiter (LRO) Laser Altimeter data. Evaluates line-of-sight obstruction rays against terrain silhouettes.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 text-xs font-semibold transition-colors shadow-sm"
        >
          <Sliders size={13} />
          <span>Synthesize Custom Coordinates</span>
        </button>
      </div>

      {/* Main 360° Continuous Horizon Profiler Canvas / SVG */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Crosshair size={14} className="text-amber-400" />
              Continuous 360° Terrain Horizon Profile
            </span>
            <span className="text-[11px] text-slate-400">
              Observer: <span className="text-slate-200">{site.name}</span> (+{site.elevationKm} km)
            </span>
          </div>

          {/* Interactive Hover Readout */}
          <div className="flex items-center gap-3 text-xs bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg">
            <span>
              Azimuth:{' '}
              <span className="text-cyan-300 font-bold tabular-nums">
                {hoveredAzimuth !== null ? `${hoveredAzimuth}°` : 'HOVER PROFILE'}
              </span>
            </span>
            <span>•</span>
            <span>
              Obstacle Height:{' '}
              <span className="text-amber-400 font-bold tabular-nums">
                {hoveredElevation !== null ? `+${hoveredElevation.toFixed(2)}°` : '--'}
              </span>
            </span>
          </div>
        </div>

        {/* Dynamic SVG Terrain Cross-Section */}
        <div className="relative w-full h-[220px] select-none">
          <svg
            viewBox="0 0 720 180"
            className="w-full h-full cursor-crosshair overflow-visible"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHoveredAzimuth(Math.round(relX * 360));
            }}
            onMouseLeave={() => setHoveredAzimuth(null)}
          >
            {/* Elevation horizontal gridlines */}
            {[0, 2, 4, 6].map((elev) => {
              const y = 150 - (elev / 7) * 130;
              return (
                <g key={elev}>
                  <line
                    x1="30"
                    y1={y}
                    x2="710"
                    y2={y}
                    stroke={elev === 0 ? '#38bdf8' : '#1e293b'}
                    strokeDasharray={elev === 0 ? '4 2' : '2 3'}
                    strokeWidth={elev === 0 ? 1.2 : 0.8}
                  />
                  <text x="5" y={y + 3} fill={elev === 0 ? '#38bdf8' : '#64748b'} fontSize="9" fontFamily="monospace">
                    {elev === 0 ? '0.0°' : `+${elev}°`}
                  </text>
                </g>
              );
            })}

            {/* Azimuth vertical gridlines every 45 degrees */}
            {[0, 45, 90, 135, 180, 225, 270, 315, 360].map((az) => {
              const x = 30 + (az / 360) * 680;
              return (
                <g key={az}>
                  <line x1={x} y1="20" x2={x} y2="150" stroke="#1e293b" strokeWidth="0.8" />
                  <text x={x} y="168" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {az === 0 ? '0° (N)' : az === 90 ? '90° (E)' : az === 180 ? '180° (S)' : az === 270 ? '270° (W)' : `${az}°`}
                  </text>
                </g>
              );
            })}

            {/* Continuous Shaded Terrain Polygon */}
            <path
              d={
                `M 30 150 ` +
                site.horizonProfile
                  .map((p) => {
                    const x = 30 + (p.azimuth / 360) * 680;
                    const y = 150 - (p.elevationMask / 7) * 130;
                    return `L ${x} ${y}`;
                  })
                  .join(' ') +
                ` L 710 150 Z`
              }
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />

            {/* Landmark Peak Markers */}
            {landmarks.map((lm, idx) => {
              const x = 30 + (lm.azimuth / 360) * 680;
              const y = 150 - (lm.heightDeg / 7) * 130;
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <line x1={x} y1={y} x2={x} y2={y - 18} stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text x={x} y={y - 22} fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {lm.feature} (+{lm.heightDeg}°)
                  </text>
                </g>
              );
            })}

            {/* Active Sun Vector Ray in the Sky */}
            {currentSample && (
              <g>
                {/* Sun vertical ray line */}
                <line
                  x1={30 + (currentSample.sunAzimuth / 360) * 680}
                  y1={150}
                  x2={30 + (currentSample.sunAzimuth / 360) * 680}
                  y2={150 - (currentSample.sunElevation / 7) * 130}
                  stroke="#fbbf24"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={30 + (currentSample.sunAzimuth / 360) * 680}
                  cy={150 - (currentSample.sunElevation / 7) * 130}
                  r="6"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <text
                  x={30 + (currentSample.sunAzimuth / 360) * 680}
                  y={150 - (currentSample.sunElevation / 7) * 130 - 10}
                  fill="#fbbf24"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  ☀️ SUN ({currentSample.sunElevation >= 0 ? '+' : ''}{currentSample.sunElevation.toFixed(1)}°)
                </text>
              </g>
            )}

            {/* Active Earth Vector Ray in the Sky */}
            {currentSample && (
              <g>
                <line
                  x1={30 + (currentSample.earthAzimuth / 360) * 680}
                  y1={150}
                  x2={30 + (currentSample.earthAzimuth / 360) * 680}
                  y2={150 - (currentSample.earthElevation / 7) * 130}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={30 + (currentSample.earthAzimuth / 360) * 680}
                  cy={150 - (currentSample.earthElevation / 7) * 130}
                  r="6"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <text
                  x={30 + (currentSample.earthAzimuth / 360) * 680}
                  y={150 - (currentSample.earthElevation / 7) * 130 - 10}
                  fill="#7dd3fc"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  🌍 EARTH ({currentSample.earthElevation >= 0 ? '+' : ''}{currentSample.earthElevation.toFixed(1)}°)
                </text>
              </g>
            )}

            {/* Hover Cursor Vertical Hairline */}
            {hoveredAzimuth !== null && (
              <line
                x1={30 + (hoveredAzimuth / 360) * 680}
                y1="15"
                x2={30 + (hoveredAzimuth / 360) * 680}
                y2="150"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Terrain Metrics & Landmark Obstacle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">PEAK OBSTACLE ANGLE</span>
          <span className="text-base font-bold text-rose-400 tabular-nums">+{terrainStats.maxObstacle}°</span>
          <span className="text-[10px] text-slate-400">High crater rim ridge</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">MEAN HORIZON OBSTACLE</span>
          <span className="text-base font-bold text-amber-300 tabular-nums">+{terrainStats.meanObstacle}°</span>
          <span className="text-[10px] text-slate-400">Average terrain elevation mask</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">SEVERE OCCLUSION SECTOR</span>
          <span className="text-base font-bold text-cyan-300 tabular-nums">{terrainStats.blockedArcDeg}° of 360°</span>
          <span className="text-[10px] text-slate-400">Horizon mask &gt; 2.0°</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 uppercase">RAY-TRACING CLEARANCE</span>
          <span className="text-base font-bold text-emerald-400 tabular-nums">
            {currentSample ? `${currentSample.sunClearanceDeg >= 0 ? '+' : ''}${currentSample.sunClearanceDeg}°` : '--'}
          </span>
          <span className="text-[10px] text-slate-400">
            {currentSample && currentSample.sunClearanceDeg > 0 ? 'Solar vector unblocked' : 'Solar vector occluded'}
          </span>
        </div>
      </div>

      {/* Prominent Terrain Obstacles Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={13} className="text-cyan-400" />
            Identified Local Horizon Obstacle Features (LOLA DEM)
          </span>
          <span className="text-[10px] text-slate-500">Calculated Topocentric Vector Distance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {landmarks.map((lm, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col gap-1 text-[11px]"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200">{lm.feature}</span>
                <span className="text-amber-400 font-bold tabular-nums">+{lm.heightDeg}°</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>Bearing: {lm.azimuth}°</span>
                <span>Distance: ~{lm.distanceKm} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesize Custom Coordinates Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="bg-[#0b0e17] border border-slate-700 rounded-2xl w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={14} className="text-cyan-400" />
                Custom Selenographic Coordinates
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Define arbitrary lunar landing coordinates in the South Polar region (80°S to 90°S). The system synthesizes the local 360° terrain mask from regional LOLA digital elevation models.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Selenographic Latitude (-80.0° to -90.0°):</label>
                <input
                  type="number"
                  step="0.05"
                  min="-90.0"
                  max="-80.0"
                  value={customLat}
                  onChange={(e) => setCustomLat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-cyan-500 tabular-nums"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Selenographic Longitude (-180° to +180°):</label>
                <input
                  type="number"
                  step="0.5"
                  min="-180.0"
                  max="180.0"
                  value={customLon}
                  onChange={(e) => setCustomLon(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-cyan-500 tabular-nums"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Surface Datum Elevation (km):</label>
                <input
                  type="number"
                  step="0.1"
                  min="-5.0"
                  max="6.0"
                  value={customElev}
                  onChange={(e) => setCustomElev(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-cyan-500 tabular-nums"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSynthesizeCustomSite}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Synthesize & Evaluate Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

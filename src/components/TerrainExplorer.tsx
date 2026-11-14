import React, { useState } from 'react';
import { LandingSite } from '../types/mission';
import { Mountain, Compass, ShieldAlert, Droplets, Info, Eye } from 'lucide-react';

interface TerrainExplorerProps {
  selectedSite: LandingSite;
}

export const TerrainExplorer: React.FC<TerrainExplorerProps> = ({ selectedSite }) => {
  const [hoveredAzimuth, setHoveredAzimuth] = useState<number | null>(null);

  const profile = selectedSite.horizonProfile;
  const maxElev = Math.max(...profile.map((p) => p.elevation), 5.0);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;

  // Build SVG polygon for 360-degree terrain skyline
  const points = profile.map((p) => {
    const x = (p.azimuth / 359) * svgWidth;
    const y = svgHeight - (p.elevation / maxElev) * (svgHeight - 40);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const skylinePath = `M 0,${svgHeight} L ${points.join(' L ')} L ${svgWidth},${svgHeight} Z`;

  // Find hovered point elevation
  const hoveredPoint = hoveredAzimuth !== null
    ? profile.find((p) => Math.abs(p.azimuth - hoveredAzimuth) <= 1) || profile[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <span>NASA LOLA TOPOGRAPHIC HORIZON & TERRAIN SKYLINE EXPLORER</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-resolution 360° azimuthal terrain occlusion model for <strong className="text-cyan-300">{selectedSite.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <span>Peak Obstruction: <strong className="text-rose-400">{maxElev.toFixed(1)}°</strong></span>
            <span className="text-slate-600">•</span>
            <span>Base Horizon: <strong className="text-slate-200">0.0°</strong></span>
          </div>
        </div>

        {/* 360-Degree Azimuthal Skyline SVG */}
        <div className="mt-4 relative bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Local Horizon Occlusion Angle (Degrees Above Plane)</span>
            {hoveredPoint && (
              <span className="text-cyan-300 font-bold">
                Azimuth: {hoveredPoint.azimuth}° | Obstruction: +{hoveredPoint.elevation}°
              </span>
            )}
          </div>

          <div className="w-full h-56 relative select-none cursor-crosshair">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const az = Math.round((x / rect.width) * 359);
                setHoveredAzimuth(Math.max(0, Math.min(359, az)));
              }}
              onMouseLeave={() => setHoveredAzimuth(null)}
            >
              {/* Horizontal Reference Grid Lines */}
              {[0, 2, 4, 6].map((deg) => {
                const y = svgHeight - (deg / maxElev) * (svgHeight - 40);
                return (
                  <g key={deg}>
                    <line
                      x1="0"
                      y1={y}
                      x2={svgWidth}
                      y2={y}
                      stroke={deg === 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}
                      strokeWidth={deg === 0 ? '1.5' : '1'}
                      strokeDasharray={deg === 0 ? '' : '3,3'}
                    />
                    <text
                      x="10"
                      y={y - 4}
                      fill={deg === 0 ? '#38bdf8' : '#64748b'}
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {deg}° {deg === 0 ? '(Mathematical Horizon)' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Terrain Mountain Profile */}
              <defs>
                <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              <path d={skylinePath} fill="url(#terrainGrad)" />

              {/* Top Ridge Line */}
              <path
                d={`M ${points.join(' L ')}`}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
              />

              {/* Hover Cursor Needle */}
              {hoveredAzimuth !== null && (
                <line
                  x1={(hoveredAzimuth / 359) * svgWidth}
                  y1="0"
                  x2={(hoveredAzimuth / 359) * svgWidth}
                  y2={svgHeight}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
              )}
            </svg>

            {/* Compass Axis Labels */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 border-t border-slate-800 pt-1">
              <span>North (0°)</span>
              <span>NE (45°)</span>
              <span>East (90°)</span>
              <span>SE (135°)</span>
              <span>South (180°)</span>
              <span>SW (225°)</span>
              <span>West (270°)</span>
              <span>NW (315°)</span>
              <span>North (360°)</span>
            </div>
          </div>
        </div>

        {/* Geological & Topographic Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
              <Compass className="w-4 h-4" />
              <span>Zero-Atmosphere Ray Optics</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike Earth, the Moon has zero atmosphere to refract light or scatter twilight. Any celestial target below this topographic ridge is in pitch black shadow with absolute zero solar generation.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Landing Slope Hazard</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Local terrain slope is measured at <strong className="text-slate-100">{selectedSite.slopeDegrees}°</strong>. The Artemis Human Landing System (HLS) requirement specifies a maximum slope threshold of 15° for touchdown stability.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1.5">
              <Droplets className="w-4 h-4" />
              <span>PSR Ice Trap Accessibility</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nearest Permanently Shadowed Region (cryogenic water ice trap) is <strong className="text-cyan-300">{selectedSite.distanceToPsrKm.toFixed(2)} km</strong> away. Allows rover exploration sorties while lander maintains solar contact on the rim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

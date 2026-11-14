import React, { useState } from 'react';
import type { EphemerisSample, LandingSite } from '../types/lunar';

interface SkyDomePlotProps {
  site: LandingSite;
  currentSample: EphemerisSample | null;
  samples: EphemerisSample[];
}

export const SkyDomePlot: React.FC<SkyDomePlotProps> = ({ site, currentSample, samples }) => {
  const [viewMode, setViewMode] = useState<'polar' | 'cylindrical'>('polar');

  const size = 360;
  const center = size / 2;
  const maxRadius = center - 32;
  const minElev = -2;
  const maxElev = 12;

  // Polar projection converter
  const polarToXY = (azimuthDeg: number, elevationDeg: number) => {
    const clampedElev = Math.max(minElev, Math.min(maxElev, elevationDeg));
    const normalized = (maxElev - clampedElev) / (maxElev - minElev);
    const r = normalized * maxRadius;
    const angleRad = (azimuthDeg - 90) * (Math.PI / 180);
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y, r };
  };

  // Build the polygon path for the 360° terrain obstacle mask
  const buildTerrainMaskPath = () => {
    if (!site.horizonProfile || site.horizonProfile.length === 0) return '';
    const outerRadius = maxRadius + 18;

    const innerPoints: string[] = [];
    site.horizonProfile.forEach((p) => {
      const pt = polarToXY(p.azimuth, p.elevationMask);
      innerPoints.push(`${pt.x},${pt.y}`);
    });

    const outerPoints: string[] = [];
    for (let az = 360; az >= 0; az -= 5) {
      const angleRad = (az - 90) * (Math.PI / 180);
      const x = center + outerRadius * Math.cos(angleRad);
      const y = center + outerRadius * Math.sin(angleRad);
      outerPoints.push(`${x},${y}`);
    }

    return `M ${innerPoints.join(' L ')} L ${outerPoints.join(' L ')} Z`;
  };

  const sunPathPoints = samples
    .map((s) => {
      const pt = polarToXY(s.sunAzimuth, s.sunElevation);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const earthPathPoints = samples
    .map((s) => {
      const pt = polarToXY(s.earthAzimuth, s.earthElevation);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const currentSunPt = currentSample
    ? polarToXY(currentSample.sunAzimuth, currentSample.sunElevation)
    : null;
  const currentEarthPt = currentSample
    ? polarToXY(currentSample.earthAzimuth, currentSample.earthElevation)
    : null;

  return (
    <div className="telemetry-panel rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* Top Header & View Mode Switcher */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Radar Horizon Reticle
          </span>
          <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
            360° TOPOGRAPHIC MASK
          </span>
        </div>

        {/* Apple-style Segmented View Control */}
        <div className="segmented-control flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => setViewMode('polar')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'polar'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Polar Radar
          </button>
          <button
            onClick={() => setViewMode('cylindrical')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'cylindrical'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unwrapped Cross-Section
          </button>
        </div>
      </div>

      {/* Main Visualization View */}
      {viewMode === 'polar' ? (
        <div className="relative flex justify-center py-1">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Background disc */}
            <circle cx={center} cy={center} r={maxRadius} fill="#090d16" stroke="#1c2436" strokeWidth="1.5" />

            {/* 36-tick Azimuth Ring */}
            {Array.from({ length: 36 }).map((_, i) => {
              const az = i * 10;
              const angleRad = (az - 90) * (Math.PI / 180);
              const isMajor = az % 30 === 0;
              const r1 = maxRadius;
              const r2 = maxRadius - (isMajor ? 7 : 4);
              const x1 = center + r1 * Math.cos(angleRad);
              const y1 = center + r1 * Math.sin(angleRad);
              const x2 = center + r2 * Math.cos(angleRad);
              const y2 = center + r2 * Math.sin(angleRad);
              return (
                <line
                  key={az}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#3b4a6b' : '#1f2738'}
                  strokeWidth={isMajor ? 1.2 : 0.8}
                />
              );
            })}

            {/* Elevation concentric rings */}
            {[0, 2, 5, 8, 10].map((elev) => {
              const pt = polarToXY(0, elev);
              const r = Math.abs(pt.y - center);
              return (
                <g key={elev}>
                  <circle
                    cx={center}
                    cy={center}
                    r={r}
                    fill="none"
                    stroke={elev === 0 ? '#38bdf8' : '#1b2333'}
                    strokeDasharray={elev === 0 ? '4 3' : '2 3'}
                    strokeWidth={elev === 0 ? 1.2 : 0.8}
                  />
                  <text
                    x={center + 4}
                    y={center - r + 9}
                    fill={elev === 0 ? '#38bdf8' : '#475569'}
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {elev}°
                  </text>
                </g>
              );
            })}

            {/* Crosshairs & Cardinal Labels */}
            {[
              { label: '000° N', az: 0, dx: 0, dy: -12 },
              { label: '090° E', az: 90, dx: 14, dy: 3 },
              { label: '180° S', az: 180, dx: 0, dy: 14 },
              { label: '270° W', az: 270, dx: -16, dy: 3 },
            ].map((dir) => {
              const edge = polarToXY(dir.az, minElev);
              return (
                <g key={dir.az}>
                  <line
                    x1={center}
                    y1={center}
                    x2={edge.x}
                    y2={edge.y}
                    stroke="#1c2436"
                    strokeWidth="0.8"
                  />
                  <text
                    x={edge.x + dir.dx}
                    y={edge.y + dir.dy}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {dir.label}
                  </text>
                </g>
              );
            })}

            {/* Topographic Obstacle Mask Fill */}
            <path
              d={buildTerrainMaskPath()}
              fill="rgba(239, 68, 68, 0.18)"
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />

            {/* Sun Historical Track */}
            <polyline
              points={sunPathPoints}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              opacity="0.75"
            />

            {/* Earth Historical Track */}
            <polyline
              points={earthPathPoints}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeDasharray="3 3"
              opacity="0.75"
            />

            {/* Current Sun Marker */}
            {currentSunPt && currentSample && (
              <g>
                <circle
                  cx={currentSunPt.x}
                  cy={currentSunPt.y}
                  r={8}
                  fill={currentSample.isSunLit ? '#f59e0b' : '#78350f'}
                  opacity="0.3"
                />
                <circle
                  cx={currentSunPt.x}
                  cy={currentSunPt.y}
                  r={4.5}
                  fill={currentSample.isSunLit ? '#fbbf24' : '#b45309'}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <line
                  x1={currentSunPt.x}
                  y1={currentSunPt.y}
                  x2={currentSunPt.x + 16}
                  y2={currentSunPt.y - 12}
                  stroke="#fbbf24"
                  strokeWidth="0.8"
                />
                <rect
                  x={currentSunPt.x + 16}
                  y={currentSunPt.y - 20}
                  width="54"
                  height="14"
                  rx="3"
                  fill="#090d16"
                  stroke="#f59e0b"
                  strokeWidth="0.8"
                />
                <text
                  x={currentSunPt.x + 20}
                  y={currentSunPt.y - 10}
                  fill="#fbbf24"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  SUN {currentSample.sunElevation >= 0 ? '+' : ''}{currentSample.sunElevation.toFixed(1)}°
                </text>
              </g>
            )}

            {/* Current Earth Marker */}
            {currentEarthPt && currentSample && (
              <g>
                <circle
                  cx={currentEarthPt.x}
                  cy={currentEarthPt.y}
                  r={8}
                  fill={currentSample.hasDTE ? '#0284c7' : '#1e3a8a'}
                  opacity="0.3"
                />
                <circle
                  cx={currentEarthPt.x}
                  cy={currentEarthPt.y}
                  r={4.5}
                  fill={currentSample.hasDTE ? '#38bdf8' : '#1e40af'}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <line
                  x1={currentEarthPt.x}
                  y1={currentEarthPt.y}
                  x2={currentEarthPt.x + 16}
                  y2={currentEarthPt.y + 12}
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                />
                <rect
                  x={currentEarthPt.x + 16}
                  y={currentEarthPt.y + 5}
                  width="58"
                  height="14"
                  rx="3"
                  fill="#090d16"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                />
                <text
                  x={currentEarthPt.x + 20}
                  y={currentEarthPt.y + 15}
                  fill="#7dd3fc"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  EARTH {currentSample.earthElevation >= 0 ? '+' : ''}{currentSample.earthElevation.toFixed(1)}°
                </text>
              </g>
            )}

            {/* Center reticle */}
            <circle cx={center} cy={center} r={2} fill="#64748b" />
          </svg>
        </div>
      ) : (
        /* Unwrapped Cylindrical Cross-Section (Azimuth 0°–360° vs Elevation) */
        <div className="py-3 px-1">
          <div className="w-full h-[260px] bg-slate-950/90 border border-slate-800 rounded-xl p-3 relative flex flex-col justify-between font-mono text-xs">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800/80 pb-1.5">
              <span>ELEVATION ANGLE RELATIVE TO HORIZON</span>
              <span className="flex items-center gap-3">
                <span className="text-amber-400">── Solar Vector</span>
                <span className="text-sky-400">── Earth Vector</span>
                <span className="text-rose-400">■ Topographic Mask</span>
              </span>
            </div>

            {/* SVG Plot */}
            <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
              {/* Zero Elevation Baseline */}
              <line x1="25" y1="140" x2="395" y2="140" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
              <text x="2" y="143" fill="#38bdf8" fontSize="8">0°</text>

              {/* 5° Line */}
              <line x1="25" y1="80" x2="395" y2="80" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />
              <text x="2" y="83" fill="#64748b" fontSize="8">+5°</text>

              {/* 10° Line */}
              <line x1="25" y1="20" x2="395" y2="20" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />
              <text x="2" y="23" fill="#64748b" fontSize="8">+10°</text>

              {/* Azimuth Vertical Gridlines */}
              {[0, 90, 180, 270, 360].map((az) => {
                const x = 25 + (az / 360) * 370;
                return (
                  <g key={az}>
                    <line x1={x} y1="15" x2={x} y2="145" stroke="#1e293b" strokeWidth="0.8" />
                    <text x={x} y="160" fill="#64748b" fontSize="8" textAnchor="middle">
                      {az}°
                    </text>
                  </g>
                );
              })}

              {/* Topographic Obstacle Mask Area */}
              <path
                d={
                  `M 25 140 ` +
                  site.horizonProfile
                    .map((p) => {
                      const x = 25 + (p.azimuth / 360) * 370;
                      const y = 140 - (p.elevationMask / 12) * 120;
                      return `L ${x} ${y}`;
                    })
                    .join(' ') +
                  ` L 395 140 Z`
                }
                fill="rgba(239, 68, 68, 0.25)"
                stroke="#ef4444"
                strokeWidth="1.2"
              />

              {/* Current Sun Point */}
              {currentSample && (
                <circle
                  cx={25 + (currentSample.sunAzimuth / 360) * 370}
                  cy={140 - (currentSample.sunElevation / 12) * 120}
                  r="5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              )}

              {/* Current Earth Point */}
              {currentSample && (
                <circle
                  cx={25 + (currentSample.earthAzimuth / 360) * 370}
                  cy={140 - (currentSample.earthElevation / 12) * 120}
                  r="5"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Real-time Clearance Telemetry Cards */}
      {currentSample && (
        <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
              currentSample.isSunLit
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold flex items-center gap-1.5 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                SOLAR VECTOR
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950 font-bold">
                {currentSample.isSunLit ? 'ILLUMINATED' : 'OCCLUDED'}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-slate-400">Elev / Az:</span>
              <span className="tabular-nums font-bold">
                {currentSample.sunElevation >= 0 ? '+' : ''}{currentSample.sunElevation.toFixed(2)}° / {currentSample.sunAzimuth.toFixed(1)}°
              </span>
            </div>
            <div className="flex justify-between items-baseline text-[10px]">
              <span className="text-slate-400">Rel. Clearance:</span>
              <span
                className={`font-semibold tabular-nums ${
                  currentSample.sunClearanceDeg > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentSample.sunClearanceDeg >= 0 ? '+' : ''}{currentSample.sunClearanceDeg.toFixed(2)}°
              </span>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
              currentSample.hasDTE
                ? 'bg-sky-950/20 border-sky-500/40 text-sky-200'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold flex items-center gap-1.5 text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                DIRECT-TO-EARTH
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950 font-bold">
                {currentSample.hasDTE ? 'DSN LINK' : 'BLACKOUT'}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-slate-400">Elev / Az:</span>
              <span className="tabular-nums font-bold">
                {currentSample.earthElevation >= 0 ? '+' : ''}{currentSample.earthElevation.toFixed(2)}° / {currentSample.earthAzimuth.toFixed(1)}°
              </span>
            </div>
            <div className="flex justify-between items-baseline text-[10px]">
              <span className="text-slate-400">Delay (τ):</span>
              <span className="font-semibold tabular-nums text-slate-300">
                {currentSample.earthLightTimeSec.toFixed(3)}s ({currentSample.activeDSNStation.split(' ')[0]})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

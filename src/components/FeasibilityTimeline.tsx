import React, { useRef } from 'react';
import { EphemerisPoint, LandingSite } from '../types/mission';
import { Zap, Radio, Sun, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface FeasibilityTimelineProps {
  site: LandingSite;
  trajectory: EphemerisPoint[];
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export const FeasibilityTimeline: React.FC<FeasibilityTimelineProps> = ({
  site,
  trajectory,
  currentDate,
  onSelectDate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!trajectory || trajectory.length === 0) return null;

  const totalPoints = trajectory.length;
  const startMs = trajectory[0].timestamp;
  const endMs = trajectory[totalPoints - 1].timestamp;
  const currentMs = currentDate.getTime();

  // Calculate current scrubber position percentage [0, 100]
  const currentProgressPct = Math.max(
    0,
    Math.min(100, ((currentMs - startMs) / Math.max(1, endMs - startMs)) * 100)
  );

  // Elevation range for scaling
  const maxElev = 12; // deg
  const minElev = -6; // deg
  const elevRange = maxElev - minElev;

  const getSvgY = (elev: number) => {
    const clamped = Math.max(minElev, Math.min(maxElev, elev));
    return 100 - ((clamped - minElev) / elevRange) * 100;
  };

  // Build SVG path for Sun elevation
  const sunPathPoints = trajectory.map((pt, idx) => {
    const x = (idx / (totalPoints - 1)) * 100;
    const y = getSvgY(pt.sunElevation);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const sunSvgPath = `M ${sunPathPoints.join(' L ')}`;

  // Build SVG path for Earth elevation
  const earthPathPoints = trajectory.map((pt, idx) => {
    const x = (idx / (totalPoints - 1)) * 100;
    const y = getSvgY(pt.earthElevation);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const earthSvgPath = `M ${earthPathPoints.join(' L ')}`;

  // Build SVG path for Sun Obstruction line
  const sunObstructionPoints = trajectory.map((pt, idx) => {
    const x = (idx / (totalPoints - 1)) * 100;
    const y = getSvgY(pt.sunHorizonObstruction);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const sunObstructionSvgPath = `M ${sunObstructionPoints.join(' L ')}`;

  const zeroHorizonY = getSvgY(0);

  // Handle timeline click to jump
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetMs = startMs + fraction * (endMs - startMs);
    onSelectDate(new Date(targetMs));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-200">
            CHRONOLOGICAL MISSION FEASIBILITY TIMELINE
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            {trajectory[0].dateIso.slice(0, 10)} to {trajectory[totalPoints - 1].dateIso.slice(0, 10)}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" />
            <span className="text-amber-300">Sun Elevation</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-cyan-300">Earth Elevation</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-rose-500 border-dashed inline-block" />
            <span className="text-rose-400">Terrain Mask</span>
          </div>
        </div>
      </div>

      {/* SVG Waveform Graph */}
      <div
        onClick={handleTimelineClick}
        className="relative w-full h-36 bg-slate-950/90 rounded-lg border border-slate-800/80 overflow-hidden cursor-crosshair group select-none"
      >
        {/* Horizontal grid lines */}
        <div
          className="absolute left-0 right-0 border-b border-cyan-500/30 z-0"
          style={{ top: `${zeroHorizonY}%` }}
        >
          <span className="absolute right-2 -top-3.5 text-[9px] font-mono text-cyan-400">
            0° Horizon
          </span>
        </div>

        {/* SVG Curves */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full relative z-10"
        >
          {/* Shaded Obstruction region */}
          <path
            d={`${sunObstructionSvgPath} L 100,${zeroHorizonY} L 0,${zeroHorizonY} Z`}
            fill="rgba(244, 63, 94, 0.12)"
          />

          {/* Terrain Obstruction line */}
          <path
            d={sunObstructionSvgPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="0.8"
            strokeDasharray="1.5,1"
          />

          {/* Earth Elevation Line */}
          <path
            d={earthSvgPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.6"
          />

          {/* Sun Elevation Line */}
          <path
            d={sunSvgPath}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.8"
          />
        </svg>

        {/* Interactive Vertical Scrubber Needle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-cyan-500/50 z-20 pointer-events-none"
          style={{ left: `${currentProgressPct}%` }}
        >
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full -ml-1 -mt-1 shadow-md border border-slate-900" />
          <div className="absolute top-2 -left-12 bg-slate-900/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
            {currentDate.toISOString().slice(11, 16)} UTC
          </div>
        </div>
      </div>

      {/* Operational Feasibility Gantt Bars */}
      <div className="mt-2.5 space-y-1.5" onClick={handleTimelineClick}>
        {/* 1. Solar Power Bar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-mono text-slate-400 w-20 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Solar Power</span>
          </span>
          <div className="flex-1 h-3.5 bg-slate-950 rounded flex overflow-hidden border border-slate-800">
            {trajectory.map((pt, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                title={`${pt.dateIso.slice(0, 16)}: ${pt.isPowerViable ? 'Power Active' : 'Eclipse'}`}
                style={{
                  backgroundColor: pt.isPowerViable ? '#10b981' : '#1e293b'
                }}
              />
            ))}
          </div>
        </div>

        {/* 2. DTE Comm Bar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-mono text-slate-400 w-20 flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>Earth Comm</span>
          </span>
          <div className="flex-1 h-3.5 bg-slate-950 rounded flex overflow-hidden border border-slate-800">
            {trajectory.map((pt, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                title={`${pt.dateIso.slice(0, 16)}: ${pt.isCommViable ? 'DTE Active' : 'No Comm'}`}
                style={{
                  backgroundColor: pt.isCommViable ? '#0284c7' : '#1e293b'
                }}
              />
            ))}
          </div>
        </div>

        {/* 3. Joint Mission Feasibility Bar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-mono text-slate-400 w-20 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Joint Feasible</span>
          </span>
          <div className="flex-1 h-3.5 bg-slate-950 rounded flex overflow-hidden border border-slate-800">
            {trajectory.map((pt, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                title={`${pt.dateIso.slice(0, 16)}: ${pt.isJointMissionFeasible ? 'Power + Comm GO' : 'Constrained'}`}
                style={{
                  backgroundColor: pt.isJointMissionFeasible ? '#fbbf24' : '#090f1d'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 text-right text-[10px] text-slate-500 font-mono">
        Click anywhere on the waveform or bars to scrub mission time
      </div>
    </div>
  );
};

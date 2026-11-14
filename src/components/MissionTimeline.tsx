import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { EphemerisSample } from '../types/lunar';

interface MissionTimelineProps {
  samples: EphemerisSample[];
  currentIndex: number;
  onSeek: (index: number) => void;
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({
  samples,
  currentIndex,
  onSeek,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying || samples.length === 0) return;

    const interval = setInterval(() => {
      onSeek((currentIndex + 1) % samples.length);
    }, 250 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, samples.length, playbackSpeed, onSeek]);

  if (samples.length === 0) return null;

  const currentSample = samples[currentIndex] || samples[0];
  const dateFormatted = new Date(currentSample.timeMs).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  return (
    <div className="telemetry-panel rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Top Controls & NASA Clocks */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-xs ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY SIMULATION'}</span>
          </button>

          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Reset to Mission Start"
          >
            <RotateCcw size={14} />
          </button>

          <div className="segmented-control flex items-center text-xs">
            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-slate-800 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* NASA Clocks: MET, UTC & Active Ground Station */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">MISSION ELAPSED TIME</span>
              <span className="text-cyan-300 font-bold tabular-nums">{currentSample.metFormatted}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">TOUCHDOWN UTC</span>
              <span className="text-slate-200 font-medium tabular-nums">{dateFormatted} UTC</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">DSN PRIME STATION</span>
              <span className="text-emerald-400 font-semibold">{currentSample.activeDSNStation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrubber Slider */}
      <div className="relative w-full pt-1">
        <input
          type="range"
          min={0}
          max={samples.length - 1}
          value={currentIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
        />
      </div>

      {/* Synchronized Illumination & DTE Gantt Ribbons */}
      <div className="flex flex-col gap-1.5 pt-1">
        {/* Solar Illumination Ribbon */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-24 text-slate-400 shrink-0 flex items-center gap-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> SOLAR POWER
          </span>
          <div className="flex-1 h-4 bg-slate-950 rounded border border-slate-800 overflow-hidden flex relative">
            {samples.map((s, idx) => (
              <div
                key={idx}
                onClick={() => onSeek(idx)}
                className={`flex-1 transition-opacity cursor-pointer ${
                  s.isSunLit ? 'bg-amber-500/90 hover:opacity-100' : 'bg-slate-900/60'
                } ${idx === currentIndex ? 'ring-1 ring-white z-10' : ''}`}
                title={`Hour ${idx * 2}: Sun ${s.isSunLit ? 'Lit' : 'Dark'} (${s.sunElevation.toFixed(1)}°)`}
              />
            ))}
            {/* Position needle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-20"
              style={{ left: `${(currentIndex / (samples.length - 1)) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 w-16 text-right tabular-nums">
            {currentSample.solarFluxWm2} W/m²
          </span>
        </div>

        {/* Earth DTE Communication Ribbon */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-24 text-slate-400 shrink-0 flex items-center gap-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> DTE COMMS
          </span>
          <div className="flex-1 h-4 bg-slate-950 rounded border border-slate-800 overflow-hidden flex relative">
            {samples.map((s, idx) => (
              <div
                key={idx}
                onClick={() => onSeek(idx)}
                className={`flex-1 transition-opacity cursor-pointer ${
                  s.hasDTE ? 'bg-sky-500/90 hover:opacity-100' : 'bg-rose-950/70'
                } ${idx === currentIndex ? 'ring-1 ring-white z-10' : ''}`}
                title={`Hour ${idx * 2}: Earth ${s.hasDTE ? 'Visible' : 'Occluded'} (${s.earthElevation.toFixed(1)}°)`}
              />
            ))}
            {/* Position needle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-20"
              style={{ left: `${(currentIndex / (samples.length - 1)) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 w-16 text-right tabular-nums">
            {currentSample.hasDTE ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-500" /> Sunlit Window
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-sky-500" /> DTE Window (Line-of-Sight)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-rose-950" /> Horizon Occlusion Blackout
          </span>
        </div>
        <div>
          Step: 2.0h • Duration: {((samples.length - 1) * 2) / 24} Days ({samples.length} Ephemeris Vectors)
        </div>
      </div>
    </div>
  );
};

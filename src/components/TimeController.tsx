import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Calendar, Clock, Sparkles } from 'lucide-react';

interface TimeControllerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const TimeController: React.FC<TimeControllerProps> = ({
  currentDate,
  onDateChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange
}) => {
  const speeds = [
    { label: '1x (Real)', value: 1 },
    { label: '60x (1m/s)', value: 60 },
    { label: '3,600x (1h/s)', value: 3600 },
    { label: '86,400x (1d/s)', value: 86400 }
  ];

  const presets = [
    {
      name: 'Artemis III Austral Summer Peak',
      date: new Date('2026-12-21T12:00:00Z'),
      desc: 'Maximum solar elevation at South Pole'
    },
    {
      name: 'Artemis Base Camp Target (Spring)',
      date: new Date('2026-10-15T00:00:00Z'),
      desc: 'Prime launch window candidate'
    },
    {
      name: 'IM-2 South Pole Mission',
      date: new Date('2025-11-20T08:00:00Z'),
      desc: 'CLPS Shackleton landing window'
    },
    {
      name: 'Chandrayaan-3 Touchdown',
      date: new Date('2023-08-23T12:34:00Z'),
      desc: 'Shiv Shakti landing moment'
    },
    {
      name: 'Current Real-Time UTC',
      date: new Date(),
      desc: 'Live celestial alignment'
    }
  ];

  const handleStep = (hours: number) => {
    onDateChange(new Date(currentDate.getTime() + hours * 3600 * 1000));
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        onDateChange(parsed);
      }
    }
  };

  const formatForInput = (d: Date) => {
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStep(-24)}
              title="Back 24 Hours"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-mono"
            >
              -1d
            </button>
            <button
              onClick={() => handleStep(-1)}
              title="Back 1 Hour"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'SIMULATE'}</span>
            </button>

            <button
              onClick={() => handleStep(1)}
              title="Forward 1 Hour"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <FastForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStep(24)}
              title="Forward 24 Hours"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-mono"
            >
              +1d
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
            {speeds.map((s) => (
              <button
                key={s.value}
                onClick={() => onSpeedChange(s.value)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                  playbackSpeed === s.value
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Date/Time Picker */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-center">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <input
              type="datetime-local"
              value={formatForInput(currentDate)}
              onChange={handleDateInput}
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded"
            />
            <span className="text-[10px] text-slate-500 font-mono">UTC</span>
          </div>
        </div>

        {/* Right: Mission Presets Dropdown */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto justify-end">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset:</span>
          </span>
          <select
            onChange={(e) => {
              const index = parseInt(e.target.value, 10);
              if (!isNaN(index) && presets[index]) {
                onDateChange(presets[index].date);
              }
            }}
            defaultValue=""
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 max-w-full font-sans cursor-pointer"
          >
            <option value="" disabled>Select Mission Window Preset...</option>
            {presets.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name} ({p.date.toISOString().slice(0, 10)})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

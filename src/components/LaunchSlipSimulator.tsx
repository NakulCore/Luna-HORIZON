import React from 'react';
import { Clock } from 'lucide-react';

interface LaunchSlipSimulatorProps {
  slipHours: number;
  onChangeSlip: (hours: number) => void;
  baseStartDate: string;
}

export const LaunchSlipSimulator: React.FC<LaunchSlipSimulatorProps> = ({
  slipHours,
  onChangeSlip,
  baseStartDate,
}) => {
  const baseDate = new Date(baseStartDate);
  const adjustedDate = new Date(baseDate.getTime() + slipHours * 3600 * 1000);

  const presets = [0, 6, 12, 24, 48, 72];

  return (
    <div className="telemetry-panel rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
            Launch Slip / T0 Contingency Simulator
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Delay:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              slipHours === 0
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            +{slipHours}h
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
        Simulate launch scrub, weather hold, or translunar trajectory dispersion. Dynamically shifts the mission window to recalculate polar illumination and Earth libration.
      </p>

      {/* Tactile Apple-grade segmented buttons */}
      <div className="segmented-control grid grid-cols-6 gap-1 p-1">
        {presets.map((hours) => (
          <button
            key={hours}
            onClick={() => onChangeSlip(hours)}
            className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors ${
              slipHours === hours
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {hours === 0 ? 'Nominal' : `+${hours}h`}
          </button>
        ))}
      </div>

      {/* Timestamp Comparison */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
        <div>
          <span className="text-slate-500 block text-[9px] uppercase">NOMINAL T0 TOUCHDOWN</span>
          <span className="text-slate-300 font-medium tabular-nums">{baseDate.toUTCString().replace('GMT', 'UTC')}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[9px] uppercase">SLIPPED TOUCHDOWN</span>
          <span className="text-amber-400 font-semibold tabular-nums">{adjustedDate.toUTCString().replace('GMT', 'UTC')}</span>
        </div>
      </div>
    </div>
  );
};

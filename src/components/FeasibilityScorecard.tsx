import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Sun,
  Radio,
  Mountain,
  BatteryCharging,
} from 'lucide-react';
import type { FeasibilityAssessment, LandingSite } from '../types/lunar';

interface FeasibilityScorecardProps {
  site: LandingSite;
  assessment: FeasibilityAssessment;
}

export const FeasibilityScorecard: React.FC<FeasibilityScorecardProps> = ({
  site,
  assessment,
}) => {
  const getVerdictBadge = () => {
    switch (assessment.verdict) {
      case 'GO':
        return (
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            MISSION GO • {assessment.frrStatus}
          </div>
        );
      case 'CAUTION':
        return (
          <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/80 text-amber-300 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            CONDITIONAL CAUTION • {assessment.frrStatus}
          </div>
        );
      case 'NO-GO':
        return (
          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/80 text-rose-300 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider shadow-sm">
            <XCircle className="w-4 h-4 text-rose-400" />
            MISSION NO-GO • {assessment.frrStatus}
          </div>
        );
    }
  };

  return (
    <div className="telemetry-panel rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header with Title and NASA Verdict */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-mono">
              Flight Readiness Review (FRR) Engineering Scorecard
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Physics-based feasibility assessment for target landing site: <span className="text-slate-200 font-semibold">{site.name}</span>
          </p>
        </div>
        {getVerdictBadge()}
      </div>

      {/* Main Score Bar & Radial View */}
      <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div
            className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center font-mono ${
              assessment.score >= 75
                ? 'border-emerald-500/80 text-emerald-400 bg-emerald-950/20'
                : assessment.score >= 50
                ? 'border-amber-500/80 text-amber-400 bg-amber-950/20'
                : 'border-rose-500/80 text-rose-400 bg-rose-950/20'
            }`}
          >
            <span className="text-2xl font-black tabular-nums">{assessment.score}</span>
            <span className="text-[10px] text-slate-400 -mt-1 font-sans">/ 100</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 font-mono">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">OVERALL MISSION VIABILITY INDEX</span>
            <span className="text-cyan-400 font-bold tabular-nums">{assessment.score}% Nominal</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                assessment.score >= 75
                  ? 'bg-emerald-500'
                  : assessment.score >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${assessment.score}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-sans">
            <span>Terrain Class: <span className="font-mono text-slate-300 font-semibold">{assessment.alhatSafetyClass}</span></span>
            <span>Terrain Penalty: <span className="font-mono text-rose-400 font-semibold">-{assessment.terrainHazardPenalty} pts</span></span>
          </div>
        </div>
      </div>

      {/* Subsystem Telemetry Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        {/* Power Subsystem */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="flex items-center gap-1.5 font-semibold text-[11px]">
              <Sun size={14} /> Solar Illumination
            </span>
            <span className="font-bold tabular-nums">{assessment.illuminationPercentage}%</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Sunlit: <span className="text-white font-bold">{assessment.totalSunlitHours}h</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            Energy Yield: <span className="text-amber-300 font-semibold">{assessment.totalSolarEnergyKWhM2} kWh/m²</span>
          </div>
        </div>

        {/* Telecommunications Subsystem */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sky-400">
            <span className="flex items-center gap-1.5 font-semibold text-[11px]">
              <Radio size={14} /> DTE Line-of-Sight
            </span>
            <span className="font-bold tabular-nums">{assessment.dtePercentage}%</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Total Link: <span className="text-white font-bold">{assessment.totalDTEHours}h</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            Max Blackout: <span className="text-rose-400 font-semibold">{assessment.maxContinuousBlackoutHours}h</span>
          </div>
        </div>

        {/* DSN Station Coverage */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5 font-semibold text-[11px]">
              <BatteryCharging size={14} /> DSN Ground Stations
            </span>
            <span className="font-bold">Active</span>
          </div>
          <div className="text-slate-300 text-[10px]">
            Goldstone: <span className="text-slate-200">{assessment.dsnCoverageSummary.goldstoneHours}h</span> • Madrid: <span className="text-slate-200">{assessment.dsnCoverageSummary.madridHours}h</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            Canberra: <span className="text-slate-200">{assessment.dsnCoverageSummary.canberraHours}h</span>
          </div>
        </div>

        {/* ALHAT Terrain Corridor */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="flex items-center gap-1.5 font-semibold text-[11px]">
              <Mountain size={14} /> Landing Slope
            </span>
            <span className="font-bold tabular-nums">{site.meanSlopeDeg}° mean</span>
          </div>
          <div className="text-slate-300 text-[11px]">
            Peak Hazard: <span className="text-white font-bold">{site.maxSlopeDeg}° max</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            Datum: <span className="text-slate-200 font-semibold">+{site.elevationKm} km</span>
          </div>
        </div>
      </div>

      {/* Engineering Recommendations & Identified Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
            <ShieldCheck size={14} /> Flight Director Directives & Recommendations
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5">
            {assessment.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase font-mono">
            <AlertTriangle size={14} /> Identified Flight Safety Risks & Constraints
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5">
            {assessment.risks.length === 0 ? (
              <li className="text-slate-500 italic">No critical hazards detected for this window.</li>
            ) : (
              assessment.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 mt-0.5">⚠️</span>
                  <span className="leading-relaxed">{risk}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

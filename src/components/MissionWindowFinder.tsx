import React, { useState } from 'react';
import { LandingSite, MissionWindowScore } from '../types/mission';
import { findOptimalLandingWindows } from '../services/missionOptimizer';
import { Target, Calendar, ArrowRight, ShieldCheck, Sun, Radio, AlertTriangle, CheckCircle, Sparkles, Filter } from 'lucide-react';

interface MissionWindowFinderProps {
  selectedSite: LandingSite;
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export const MissionWindowFinder: React.FC<MissionWindowFinderProps> = ({
  selectedSite,
  currentDate,
  onSelectDate
}) => {
  const [searchStartDate, setSearchStartDate] = useState(
    currentDate.toISOString().slice(0, 10)
  );
  const [searchRangeDays, setSearchRangeDays] = useState(90);
  const [missionDurationDays, setMissionDurationDays] = useState(7);
  const [minSolarPct, setMinSolarPct] = useState(70);

  const parsedStartDate = new Date(searchStartDate);
  const validStartDate = isNaN(parsedStartDate.getTime()) ? new Date() : parsedStartDate;

  const optimalWindows = findOptimalLandingWindows(
    selectedSite,
    validStartDate,
    searchRangeDays,
    missionDurationDays,
    2 // sample step days
  );

  const filteredWindows = optimalWindows.filter(
    (w) => w.solarIlluminationPct >= minSolarPct
  );

  const handleApplyWindow = (w: MissionWindowScore) => {
    onSelectDate(new Date(`${w.startDate}T00:00:00Z`));
  };

  return (
    <div className="space-y-4">
      {/* Search Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>AUTONOMOUS LAUNCH & LANDING WINDOW OPTIMIZER</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-month search identifying optimal mission arrival dates for <strong className="text-cyan-300">{selectedSite.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Found <strong className="text-cyan-300">{filteredWindows.length}</strong> viable windows
            </span>
          </div>
        </div>

        {/* Filter Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Search Start Date</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <input
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none font-mono w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Search Range Window</label>
            <select
              value={searchRangeDays}
              onChange={(e) => setSearchRangeDays(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={30}>30 Days (Next Month)</option>
              <option value={60}>60 Days (2 Months)</option>
              <option value={90}>90 Days (Quarterly Campaign)</option>
              <option value={180}>180 Days (Half-Year Cycle)</option>
              <option value={365}>365 Days (Full Precession Year)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Surface Stay Duration</label>
            <select
              value={missionDurationDays}
              onChange={(e) => setMissionDurationDays(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={3}>3 Days (Fast Robotic Sortie)</option>
              <option value={7}>7 Days (Artemis III Crew Baseline)</option>
              <option value={14}>14 Days (Full Lunar Daylight Period)</option>
              <option value={28}>28 Days (Full Lunar Synodic Cycle)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span className="font-medium">Min Solar Availability</span>
              <span className="font-mono text-amber-400">{minSolarPct}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="5"
              value={minSolarPct}
              onChange={(e) => setMinSolarPct(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Top Ranked Windows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredWindows.slice(0, 12).map((window, idx) => {
          const isTopThree = idx < 3;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all backdrop-blur-sm ${
                isTopThree
                  ? 'bg-slate-900/95 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-slate-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-100 font-mono">
                      {window.startDate}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                      window.riskRating === 'Optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : window.riskRating === 'Favorable'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {window.riskRating}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mb-2.5 font-mono">
                  Stay: {window.startDate} → {window.endDate} ({window.durationDays} days)
                </div>

                {/* Score Chip */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 mb-2.5">
                  <span className="text-[11px] text-slate-400 font-sans">Composite Feasibility Score:</span>
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {window.compositeScore.toFixed(1)} <span className="text-[10px] text-slate-500">/ 100</span>
                  </span>
                </div>

                {/* Telemetry Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-900/50 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px]">Solar Availability</span>
                    <span className="text-amber-300 font-semibold">{window.solarIlluminationPct}%</span>
                    <span className="text-[9px] text-slate-400 block">{window.continuousIlluminationHours}h max continuous</span>
                  </div>

                  <div className="bg-slate-900/50 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px]">Max Eclipse Darkness</span>
                    <span
                      className={`font-semibold ${
                        window.maxEclipseDurationHours === 0
                          ? 'text-emerald-400'
                          : window.maxEclipseDurationHours > 24
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {window.maxEclipseDurationHours} hrs
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      {window.maxEclipseDurationHours === 0 ? 'Zero Eclipse' : 'Battery Burden'}
                    </span>
                  </div>

                  <div className="bg-slate-900/50 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px]">Earth DTE Link</span>
                    <span className="text-cyan-300 font-semibold">{window.dteContactPct}%</span>
                    <span className="text-[9px] text-slate-400 block">{window.continuousDteHours}h continuous</span>
                  </div>

                  <div className="bg-slate-900/50 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px]">Joint Feasible (Go)</span>
                    <span className="text-emerald-400 font-semibold">{window.jointOperationsPct}%</span>
                    <span className="text-[9px] text-slate-400 block">Power + Comm simultaneous</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleApplyWindow(window)}
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-cyan-500/40"
              >
                <span>Load Window into Mission Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CriteriaWeights, LandingSite } from '../types/mission';
import { CANDIDATE_LANDING_SITES } from '../data/candidateSites';
import { DEFAULT_WEIGHTS, rankLandingSites } from '../services/missionOptimizer';
import { Layers, Sliders, Trophy, ArrowRight, ShieldCheck, Sun, Radio, Mountain, Droplets, Check } from 'lucide-react';

interface SiteComparisonMatrixProps {
  currentDate: Date;
  onSelectSite: (site: LandingSite) => void;
}

export const SiteComparisonMatrix: React.FC<SiteComparisonMatrixProps> = ({
  currentDate,
  onSelectSite
}) => {
  const [durationDays, setDurationDays] = useState(7);
  const [weights, setWeights] = useState<CriteriaWeights>(DEFAULT_WEIGHTS);
  const [showWeightSliders, setShowWeightSliders] = useState(false);

  // We analyze the top Artemis III and CLPS candidate sites
  const candidatePool = CANDIDATE_LANDING_SITES.filter(
    (s) => s.category === 'artemis' || s.category === 'clps'
  );

  const rankedReports = rankLandingSites(candidatePool, currentDate, durationDays, weights);

  const handleWeightChange = (key: keyof CriteriaWeights, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: val
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>MULTI-CRITERIA SITE COMPARISON & TRADE STUDY MATRIX</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated Pareto & TOPSIS ranking across Artemis III and CLPS candidate landing zones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWeightSliders(!showWeightSliders)}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-all font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showWeightSliders ? 'Hide Criteria Weights' : 'Adjust Decision Weights'}</span>
            </button>

            <select
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={3}>3-Day Sortie</option>
              <option value={7}>7-Day Artemis III Baseline</option>
              <option value={14}>14-Day Full Lunar Day</option>
              <option value={30}>30-Day Long Duration</option>
            </select>
          </div>
        </div>

        {/* Custom Weight Sliders (Expandable) */}
        {showWeightSliders && (
          <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Solar Availability
                </span>
                <span className="font-mono text-amber-400">{(weights.solarAvailability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.solarAvailability}
                onChange={(e) => handleWeightChange('solarAvailability', parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Eclipse Survival
                </span>
                <span className="font-mono text-purple-400">{(weights.minEclipseDuration * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.minEclipseDuration}
                onChange={(e) => handleWeightChange('minEclipseDuration', parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400" /> DTE Contact Link
                </span>
                <span className="font-mono text-cyan-400">{(weights.dteAvailability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.dteAvailability}
                onChange={(e) => handleWeightChange('dteAvailability', parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-emerald-400" /> Slope Safety
                </span>
                <span className="font-mono text-emerald-400">{(weights.landingSafetySlope * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.landingSafetySlope}
                onChange={(e) => handleWeightChange('landingSafetySlope', parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> PSR Ice Access
                </span>
                <span className="font-mono text-blue-400">{(weights.psrAccessibility * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.psrAccessibility}
                onChange={(e) => handleWeightChange('psrAccessibility', parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Ranked Sites Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3 w-16 text-center">Rank</th>
                <th className="py-3 px-3">Landing Site & Region</th>
                <th className="py-3 px-3">Solar Window</th>
                <th className="py-3 px-3">Max Eclipse</th>
                <th className="py-3 px-3">Earth DTE Link</th>
                <th className="py-3 px-3">Joint Operations</th>
                <th className="py-3 px-3">Slope Hazard</th>
                <th className="py-3 px-3">PSR Ice Dist</th>
                <th className="py-3 px-3 text-right">TOPSIS Score</th>
                <th className="py-3 px-3 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rankedReports.map((report) => {
                const s = report.site;
                const ws = report.windowScore;
                const isTopRanked = report.rank === 1;

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isTopRanked
                        ? 'bg-cyan-950/20 hover:bg-cyan-950/30'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          report.rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : report.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : report.rank === 3
                            ? 'bg-amber-700 text-slate-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {report.rank}
                      </span>
                    </td>

                    {/* Site Details */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-200">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {s.latitude.toFixed(2)}°S, {s.longitude.toFixed(2)}°E ({s.region})
                      </div>
                    </td>

                    {/* Solar Window */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-amber-300">
                        {ws.solarIlluminationPct}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Max {ws.continuousIlluminationHours}h streak
                      </div>
                    </td>

                    {/* Max Eclipse */}
                    <td className="py-3 px-3">
                      <div
                        className={`font-semibold ${
                          ws.maxEclipseDurationHours > 24 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {ws.maxEclipseDurationHours} hrs
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ws.maxEclipseDurationHours === 0 ? 'Zero Eclipse' : 'Battery Burden'}
                      </div>
                    </td>

                    {/* Earth DTE Link */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-cyan-300">
                        {ws.dteContactPct}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Max {ws.continuousDteHours}h streak
                      </div>
                    </td>

                    {/* Joint Operations */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-emerald-400">
                        {ws.jointOperationsPct}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Simultaneous Go
                      </div>
                    </td>

                    {/* Slope Hazard */}
                    <td className="py-3 px-3 text-slate-300">
                      <div>{s.slopeDegrees}°</div>
                      <div className="text-[10px] text-slate-500">
                        {s.slopeDegrees < 5 ? 'Benign' : s.slopeDegrees < 8 ? 'Moderate' : 'Rugged'}
                      </div>
                    </td>

                    {/* PSR Ice Dist */}
                    <td className="py-3 px-3 text-slate-300">
                      <div>{s.distanceToPsrKm.toFixed(1)} km</div>
                      <div className="text-[10px] text-slate-500">
                        {s.distanceToPsrKm < 1.0 ? 'Immediate Walk' : 'Rover Traverse'}
                      </div>
                    </td>

                    {/* TOPSIS Score */}
                    <td className="py-3 px-3 text-right">
                      <div className="text-sm font-bold text-cyan-300">
                        {ws.compositeScore.toFixed(1)}
                      </div>
                      <span
                        className={`text-[9px] font-sans px-1.5 py-0.5 rounded uppercase font-semibold ${
                          ws.riskRating === 'Optimal'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : ws.riskRating === 'Favorable'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ws.riskRating}
                      </span>
                    </td>

                    {/* Select Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectSite(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all"
                        title="Load into Mission Cockpit"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

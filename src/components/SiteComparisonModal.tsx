import React, { useMemo } from 'react';
import { X, Award } from 'lucide-react';
import type { LandingSite, MissionWindowConfig } from '../types/lunar';
import { computeMissionTimeline } from '../services/ephemeris';
import { assessMissionFeasibility } from '../services/feasibilityEngine';

interface SiteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: LandingSite[];
  config: MissionWindowConfig;
  onSelectSite: (site: LandingSite) => void;
}

export const SiteComparisonModal: React.FC<SiteComparisonModalProps> = ({
  isOpen,
  onClose,
  sites,
  config,
  onSelectSite,
}) => {
  if (!isOpen) return null;

  const evaluatedSites = useMemo(() => {
    return sites.map((site) => {
      const samples = computeMissionTimeline(site, config);
      const assessment = assessMissionFeasibility(site, samples);
      return { site, assessment };
    }).sort((a, b) => b.assessment.score - a.assessment.score);
  }, [sites, config]);

  const topSite = evaluatedSites[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-[#0b0e17] border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 font-mono">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              ARTEMIS CANDIDATE SITES • MULTI-TARGET COMPARISON MATRIX
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mission Window: {config.durationDays} Days • Start: {config.startDate.replace('T', ' ')} UTC (Slip: +{config.launchSlipHours}h)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="p-4 overflow-x-auto flex-1 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Rank / Region</th>
                <th className="py-2.5 px-3">FRR Status</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-3 text-right">Solar Illum.</th>
                <th className="py-2.5 px-3 text-right">Max Darkness</th>
                <th className="py-2.5 px-3 text-right">Direct Earth</th>
                <th className="py-2.5 px-3 text-right">Max Blackout</th>
                <th className="py-2.5 px-3 text-right">Mean Slope</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evaluatedSites.map((item, idx) => {
                const isWinner = idx === 0;
                return (
                  <tr
                    key={item.site.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isWinner ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {isWinner ? (
                          <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                            ★1
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded bg-slate-900 text-slate-400 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                        )}
                        <div>
                          <div className="font-semibold text-slate-200">{item.site.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.site.code} • {item.site.latitude.toFixed(2)}°, {item.site.longitude.toFixed(2)}° (+{item.site.elevationKm}km)
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.assessment.verdict === 'GO'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.assessment.verdict === 'CAUTION'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {item.assessment.verdict}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-bold text-cyan-300 tabular-nums">
                        {item.assessment.score}
                      </span>
                      <span className="text-slate-500 text-[10px]">/100</span>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-amber-400 tabular-nums">
                      {item.assessment.illuminationPercentage}%
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {item.assessment.maxContinuousDarknessHours}h
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-sky-400 tabular-nums">
                      {item.assessment.dtePercentage}%
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {item.assessment.maxContinuousBlackoutHours}h
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                      {item.site.meanSlopeDeg}°
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          onSelectSite(item.site);
                          onClose();
                        }}
                        className="bg-slate-900 hover:bg-cyan-600 hover:text-white text-slate-200 px-3 py-1 rounded-md text-[11px] transition-colors border border-slate-700"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex justify-between items-center text-xs font-mono text-slate-400">
          <div>
            Highest Ranking Candidate: <span className="font-bold text-cyan-300">{topSite.site.name}</span> (Score: {topSite.assessment.score}/100)
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium transition-colors border border-slate-800"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

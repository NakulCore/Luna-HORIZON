import React, { useState } from 'react';
import { X, Rocket, Filter } from 'lucide-react';
import type { LandingSite, LunarHemisphere } from '../types/lunar';

interface CLPSDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: LandingSite[];
  onSelectSite: (site: LandingSite) => void;
}

export const CLPSDirectoryModal: React.FC<CLPSDirectoryModalProps> = ({
  isOpen,
  onClose,
  sites,
  onSelectSite,
}) => {
  const [selectedHemisphere, setSelectedHemisphere] = useState<LunarHemisphere | 'ALL'>('ALL');

  if (!isOpen) return null;

  const clpsSites = sites.filter((s) => s.program === 'CLPS');
  const filteredSites =
    selectedHemisphere === 'ALL'
      ? clpsSites
      : clpsSites.filter((s) => s.hemisphere === selectedHemisphere);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-[#0b0e17] border border-slate-700/90 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                NASA Commercial Lunar Payload Services (CLPS) Manifest
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official NASA Commercial Landers & Delivery Contracts: Near Side, Far Side & South Pole
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar matching NASA Hemispheric Infographic */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Filter size={13} />
            <span>HEMISPHERIC FILTER:</span>
          </div>

          <div className="segmented-control flex items-center text-[11px]">
            {(['ALL', 'Near Side', 'Far Side', 'South Pole'] as const).map((hemi) => (
              <button
                key={hemi}
                onClick={() => setSelectedHemisphere(hemi)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedHemisphere === hemi
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hemi}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/60 p-4 rounded-xl flex flex-col justify-between gap-3 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      site.hemisphere === 'South Pole'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : site.hemisphere === 'Near Side'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}
                  >
                    {site.hemisphere}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">{site.clpsAward}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mt-2">
                  {site.name}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Lander: <span className="text-slate-200 font-semibold">{site.landerName}</span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2 line-clamp-3">
                  {site.description}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px]">
                <div className="text-slate-400">
                  <span className="text-cyan-400 font-semibold tabular-nums">
                    {site.latitude.toFixed(2)}°, {site.longitude.toFixed(2)}°
                  </span>
                </div>
                <button
                  onClick={() => {
                    onSelectSite(site);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-cyan-600 hover:text-white text-slate-200 px-3 py-1 rounded-md transition-colors border border-slate-700 font-semibold"
                >
                  Load Corridor
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex justify-between items-center text-slate-500 text-[11px]">
          <span>NASA Commercial Lunar Payload Services Manifest • 10 Contracted Target Sites</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};

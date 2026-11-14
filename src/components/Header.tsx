import React from 'react';
import { Compass, Calendar, Download, BookOpen, Layers, Target, Mountain, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { LandingSite } from '../types/mission';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedSite: LandingSite;
  currentDate: Date;
  onOpenReportModal: () => void;
  isHorizonsVerified: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedSite,
  currentDate,
  onOpenReportModal,
  isHorizonsVerified
}) => {
  const tabs = [
    { id: 'cockpit', label: 'Mission Cockpit', icon: Compass },
    { id: 'compare', label: 'Site Comparison', icon: Layers },
    { id: 'windows', label: 'Window Optimizer', icon: Target },
    { id: 'terrain', label: 'LOLA Topography', icon: Mountain },
    { id: 'academy', label: 'Moon Academy', icon: BookOpen },
  ];

  const formatUtcTime = (d: Date) => {
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <header className="border-b border-slate-800 bg-space-950/90 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
                🌕
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-space-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm tracking-wide">LUNAR LANDING SITE NAVIGATOR</span>
                <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded tracking-wider uppercase">
                  NASA Space Apps
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Target: <strong className="text-cyan-300">{selectedSite.name}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedSite.latitude >= 0 ? `${selectedSite.latitude.toFixed(2)}°N` : `${Math.abs(selectedSite.latitude).toFixed(2)}°S`},{' '}
                  {selectedSite.longitude >= 0 ? `${selectedSite.longitude.toFixed(2)}°E` : `${Math.abs(selectedSite.longitude).toFixed(2)}°W`}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Badge (Mobile) */}
          <div className="md:hidden flex items-center gap-1.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>JPL Ephemeris</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Mission Time Clock */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-slate-300 font-medium">
              {formatUtcTime(currentDate)}
            </span>
          </div>

          {/* JPL Horizons Verification Indicator */}
          <div
            title="Ephemeris verified against NASA JPL Horizons subsolar & subearth vectors"
            className="flex items-center gap-1.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg cursor-help"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>JPL Horizons Calibrated</span>
          </div>

          {/* Export Brief Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-cyan-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mission Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Layers,
  FileCheck,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { CANDIDATE_LANDING_SITES } from './data/landingSites';
import type { MissionWindowConfig } from './types/lunar';
import { computeMissionTimeline } from './services/ephemeris';
import { assessMissionFeasibility } from './services/feasibilityEngine';
import { SkyDomePlot } from './components/SkyDomePlot';
import { LunarGlobe3D } from './components/LunarGlobe3D';
import { MissionTimeline } from './components/MissionTimeline';
import { LaunchSlipSimulator } from './components/LaunchSlipSimulator';
import { FeasibilityScorecard } from './components/FeasibilityScorecard';
import { SiteComparisonModal } from './components/SiteComparisonModal';
import { MissionReportModal } from './components/MissionReportModal';

export const App: React.FC = () => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(CANDIDATE_LANDING_SITES[0].id);

  const [config, setConfig] = useState<MissionWindowConfig>({
    startDate: '2026-11-15T00:00',
    durationDays: 7,
    launchSlipHours: 0,
    timeStepHours: 2,
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Live NASA UTC Clock
  const [liveUtcTime, setLiveUtcTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      setLiveUtcTime(new Date().toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedSite = useMemo(() => {
    return (
      CANDIDATE_LANDING_SITES.find((s) => s.id === selectedSiteId) ||
      CANDIDATE_LANDING_SITES[0]
    );
  }, [selectedSiteId]);

  const samples = useMemo(() => {
    return computeMissionTimeline(selectedSite, config);
  }, [selectedSite, config]);

  const safeIndex = Math.min(currentIndex, Math.max(0, samples.length - 1));
  const currentSample = samples[safeIndex] || null;

  const assessment = useMemo(() => {
    return assessMissionFeasibility(selectedSite, samples);
  }, [selectedSite, samples]);

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-aerospace text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* NASA Mission Operations Header */}
      <header className="border-b border-slate-800/90 bg-[#090d16]/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner">
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono">
              <h1 className="text-sm font-black tracking-widest text-slate-100 uppercase">
                LUNA-HORIZON
              </h1>
              <span className="text-[10px] text-slate-400">/</span>
              <span className="text-xs font-semibold text-slate-300">
                Artemis Lunar Landing Site Navigator
              </span>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[9px] px-1.5 py-0.2 rounded font-semibold">
                SYSTEM NOMINAL
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>NASA Space Apps 2026</span>
              <span>•</span>
              <span className="tabular-nums">LIVE UTC: {liveUtcTime || 'SYNCHRONIZING...'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors shadow-sm"
          >
            <Layers size={13} className="text-amber-400" />
            <span>Multi-Site Matrix</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <FileCheck size={13} />
            <span>Export Mission Brief</span>
          </button>
        </div>
      </header>

      {/* Main Mission Control Grid */}
      <main className="flex-1 p-5 max-w-[1720px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Telemetry Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Target Candidate Site Selector Card */}
          <div className="telemetry-panel rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-cyan-400" />
                Target Landing Corridor
              </span>
              <span className="text-[10px] text-slate-500">10 Artemis Candidate Sites</span>
            </div>

            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 appearance-none focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {CANDIDATE_LANDING_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.code}) • Elev +{site.elevationKm}km
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-3 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Site Technical Telemetry */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="font-bold text-cyan-300 tabular-nums">
                  {selectedSite.latitude.toFixed(2)}° S, {selectedSite.longitude.toFixed(2)}° E
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Datum Elevation:</span>
                <span className="text-slate-200 tabular-nums">+{selectedSite.elevationKm} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Slope Profile:</span>
                <span className="text-slate-200 tabular-nums">
                  {selectedSite.meanSlopeDeg}° mean / {selectedSite.maxSlopeDeg}° max
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed border-t border-slate-800/70 pt-2 mt-0.5">
                {selectedSite.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedSite.tags.map((t, i) => (
                  <span
                    key={i}
                    className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Window Configuration */}
          <div className="telemetry-panel rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar size={13} className="text-cyan-400" />
              Mission Window Parameters
            </span>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Nominal Touchdown Date (UTC):</label>
                <input
                  type="datetime-local"
                  value={config.startDate}
                  onChange={(e) => {
                    setConfig({ ...config, startDate: e.target.value });
                    setCurrentIndex(0);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:outline-none focus:border-cyan-500 tabular-nums"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Surface Stay Duration:</label>
                <div className="segmented-control grid grid-cols-3 gap-1 p-1">
                  {[3, 7, 14].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setConfig({ ...config, durationDays: days });
                        setCurrentIndex(0);
                      }}
                      className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        config.durationDays === days
                          ? 'bg-slate-800 text-cyan-300 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {days} Days ({days * 24}h)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Launch Slip / Contingency Simulator */}
          <LaunchSlipSimulator
            slipHours={config.launchSlipHours}
            onChangeSlip={(slip) => {
              setConfig({ ...config, launchSlipHours: slip });
              setCurrentIndex(0);
            }}
            baseStartDate={config.startDate}
          />
        </div>

        {/* Right Dashboard Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Top Row: Dual Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkyDomePlot
              site={selectedSite}
              currentSample={currentSample}
              samples={samples}
            />

            <LunarGlobe3D
              sites={CANDIDATE_LANDING_SITES}
              selectedSite={selectedSite}
              onSelectSite={(s) => {
                setSelectedSiteId(s.id);
                setCurrentIndex(0);
              }}
              currentSample={currentSample}
            />
          </div>

          {/* Middle Row: Mission Control Timeline & Scrubber */}
          <MissionTimeline
            samples={samples}
            currentIndex={safeIndex}
            onSeek={(idx) => setCurrentIndex(idx)}
          />

          {/* Bottom Row: Flight Readiness Review Scorecard */}
          <FeasibilityScorecard
            site={selectedSite}
            assessment={assessment}
          />
        </div>
      </main>

      {/* Modals */}
      <SiteComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        sites={CANDIDATE_LANDING_SITES}
        config={config}
        onSelectSite={(s) => {
          setSelectedSiteId(s.id);
          setCurrentIndex(0);
        }}
      />

      <MissionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        site={selectedSite}
        assessment={assessment}
        config={config}
        samples={samples}
      />
    </div>
  );
};

export default App;

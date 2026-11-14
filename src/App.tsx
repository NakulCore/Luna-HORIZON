import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Layers,
  FileCheck,
  MapPin,
  ChevronDown,
  Mountain,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { CANDIDATE_LANDING_SITES } from './data/landingSites';
import type { LandingSite, MissionWindowConfig } from './types/lunar';
import { computeMissionTimeline } from './services/ephemeris';
import { assessMissionFeasibility } from './services/feasibilityEngine';
import { SkyDomePlot } from './components/SkyDomePlot';
import { LunarGlobe3D } from './components/LunarGlobe3D';
import { MissionTimeline } from './components/MissionTimeline';
import { LaunchSlipSimulator } from './components/LaunchSlipSimulator';
import { FeasibilityScorecard } from './components/FeasibilityScorecard';
import { SiteComparisonModal } from './components/SiteComparisonModal';
import { MissionReportModal } from './components/MissionReportModal';
import { HorizonTerrainProfiler } from './components/HorizonTerrainProfiler';

type WorkspaceMode = 'tactical' | 'terrain-profiler' | 'flight-readiness';

export const App: React.FC = () => {
  const [sitesList, setSitesList] = useState<LandingSite[]>(CANDIDATE_LANDING_SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(CANDIDATE_LANDING_SITES[0].id);
  const [activeMode, setActiveMode] = useState<WorkspaceMode>('tactical');

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
      sitesList.find((s) => s.id === selectedSiteId) ||
      sitesList[0]
    );
  }, [selectedSiteId, sitesList]);

  const samples = useMemo(() => {
    return computeMissionTimeline(selectedSite, config);
  }, [selectedSite, config]);

  const safeIndex = Math.min(currentIndex, Math.max(0, samples.length - 1));
  const currentSample = samples[safeIndex] || null;

  const assessment = useMemo(() => {
    return assessMissionFeasibility(selectedSite, samples);
  }, [selectedSite, samples]);

  const handleCustomSiteCreated = (newSite: LandingSite) => {
    setSitesList((prev) => [newSite, ...prev]);
    setSelectedSiteId(newSite.id);
    setCurrentIndex(0);
  };

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

        {/* Apple-grade Segmented Mode Switcher (Declutters the Dashboard) */}
        <div className="segmented-control flex items-center p-1 text-xs font-mono">
          <button
            onClick={() => setActiveMode('tactical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeMode === 'tactical'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge size={13} />
            <span>Tactical HUD</span>
          </button>

          <button
            onClick={() => setActiveMode('terrain-profiler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeMode === 'terrain-profiler'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mountain size={13} className="text-amber-400" />
            <span>Phase #2: Horizon Profiler</span>
          </button>

          <button
            onClick={() => setActiveMode('flight-readiness')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeMode === 'flight-readiness'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>FRR Feasibility</span>
          </button>
        </div>

        {/* Global Action Controls */}
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

      {/* Main Workspace View */}
      <main className="flex-1 p-5 max-w-[1720px] w-full mx-auto flex flex-col gap-5">
        {/* Top Control Bar across all modes: Quick Site & Duration Summary */}
        <div className="telemetry-panel rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin size={13} className="text-cyan-400" /> Target:
            </span>
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  setCurrentIndex(0);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1 rounded-lg pr-7 appearance-none cursor-pointer text-xs focus:outline-none focus:border-cyan-500"
              >
                {sitesList.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.code}) • +{site.elevationKm}km
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              Coords: <span className="text-cyan-300 font-semibold">{selectedSite.latitude.toFixed(2)}° S, {selectedSite.longitude.toFixed(2)}° E</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar size={13} className="text-cyan-400" /> Touchdown:
            </span>
            <input
              type="datetime-local"
              value={config.startDate}
              onChange={(e) => {
                setConfig({ ...config, startDate: e.target.value });
                setCurrentIndex(0);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-2 py-0.5 rounded-lg text-xs tabular-nums focus:outline-none"
            />
            <div className="segmented-control flex items-center text-[11px]">
              {[3, 7, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setConfig({ ...config, durationDays: d });
                    setCurrentIndex(0);
                  }}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    config.durationDays === d
                      ? 'bg-slate-800 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODE 1: TACTICAL HUD (Clean, Declustered Orbit & Radar View) */}
        {activeMode === 'tactical' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SkyDomePlot
                site={selectedSite}
                currentSample={currentSample}
                samples={samples}
              />

              <LunarGlobe3D
                sites={sitesList}
                selectedSite={selectedSite}
                onSelectSite={(s) => {
                  setSelectedSiteId(s.id);
                  setCurrentIndex(0);
                }}
                currentSample={currentSample}
              />
            </div>

            <MissionTimeline
              samples={samples}
              currentIndex={safeIndex}
              onSeek={(idx) => setCurrentIndex(idx)}
            />
          </div>
        )}

        {/* MODE 2: PHASE #2 TOPOGRAPHIC HORIZON PROFILER & RAY-TRACING */}
        {activeMode === 'terrain-profiler' && (
          <div className="flex flex-col gap-5">
            <HorizonTerrainProfiler
              site={selectedSite}
              currentSample={currentSample}
              onCustomSiteCreated={handleCustomSiteCreated}
            />

            <MissionTimeline
              samples={samples}
              currentIndex={safeIndex}
              onSeek={(idx) => setCurrentIndex(idx)}
            />
          </div>
        )}

        {/* MODE 3: FLIGHT READINESS REVIEW & CONTINGENCY SIMULATOR */}
        {activeMode === 'flight-readiness' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4">
                <LaunchSlipSimulator
                  slipHours={config.launchSlipHours}
                  onChangeSlip={(slip) => {
                    setConfig({ ...config, launchSlipHours: slip });
                    setCurrentIndex(0);
                  }}
                  baseStartDate={config.startDate}
                />
              </div>

              <div className="lg:col-span-8">
                <FeasibilityScorecard
                  site={selectedSite}
                  assessment={assessment}
                />
              </div>
            </div>

            <MissionTimeline
              samples={samples}
              currentIndex={safeIndex}
              onSeek={(idx) => setCurrentIndex(idx)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <SiteComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        sites={sitesList}
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

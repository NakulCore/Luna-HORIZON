import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TelemetryHUD } from './components/TelemetryHUD';
import { TimeController } from './components/TimeController';
import { Globe3D } from './components/Globe3D';
import { HorizonSkyDome3D } from './components/HorizonSkyDome3D';
import { PolarHorizonRadar } from './components/PolarHorizonRadar';
import { FeasibilityTimeline } from './components/FeasibilityTimeline';
import { SiteSelector } from './components/SiteSelector';
import { SiteComparisonMatrix } from './components/SiteComparisonMatrix';
import { MissionWindowFinder } from './components/MissionWindowFinder';
import { TerrainExplorer } from './components/TerrainExplorer';
import { EducationalGuide } from './components/EducationalGuide';
import { MissionReportModal } from './components/MissionReportModal';

import { CANDIDATE_LANDING_SITES } from './data/candidateSites';
import { LandingSite } from './types/mission';
import { computeEphemerisPoint, generateEphemerisTrajectory } from './services/ephemerisEngine';
import { evaluateMissionWindow } from './services/missionOptimizer';

export const App: React.FC = () => {
  // 1. Mission State
  const [selectedSite, setSelectedSite] = useState<LandingSite>(CANDIDATE_LANDING_SITES[0]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-12-21T12:00:00Z'));
  const [currentTab, setCurrentTab] = useState<string>('cockpit');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(3600); // 1 hour per second default
  const [customSites, setCustomSites] = useState<LandingSite[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // 2. Compute Ephemeris & Telemetry State
  const currentEphemerisPoint = computeEphemerisPoint(selectedSite, currentDate);
  const trajectory = generateEphemerisTrajectory(selectedSite, currentDate, 7, 1);
  const missionWindowScore = evaluateMissionWindow(selectedSite, currentDate, 7);

  // 3. Playback Animation Loop
  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const tick = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentDate((prevDate) => {
        const addedMs = deltaSec * playbackSpeed * 1000;
        return new Date(prevDate.getTime() + addedMs);
      });

      animId = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  const handleAddCustomSite = (site: LandingSite) => {
    setCustomSites((prev) => [site, ...prev]);
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col bg-radar-grid selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header Telemetry Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedSite={selectedSite}
        currentDate={currentDate}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isHorizonsVerified={true}
      />

      {/* 2. Main Content Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* TAB 1: MISSION COCKPIT & 3D NAVIGATOR */}
        {currentTab === 'cockpit' && (
          <div className="space-y-4">
            {/* Aerospace Telemetry Readout HUD */}
            <TelemetryHUD point={currentEphemerisPoint} site={selectedSite} />

            {/* Time Warp & Playback Controller */}
            <TimeController
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />

            {/* 3D Visualizer Row (Digital Globe & Local Horizon Sky Dome) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Globe3D
                selectedSite={selectedSite}
                onSelectSite={setSelectedSite}
                point={currentEphemerisPoint}
              />
              <HorizonSkyDome3D
                site={selectedSite}
                point={currentEphemerisPoint}
              />
            </div>

            {/* Secondary Visualizers Row (Polar Radar & Candidate Site Directory) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PolarHorizonRadar
                site={selectedSite}
                point={currentEphemerisPoint}
                trajectory={trajectory}
              />
              <SiteSelector
                selectedSite={selectedSite}
                onSelectSite={setSelectedSite}
                customSites={customSites}
                onAddCustomSite={handleAddCustomSite}
              />
            </div>

            {/* Chronological Mission Feasibility Waveforms & Operational Gantt Bars */}
            <FeasibilityTimeline
              site={selectedSite}
              trajectory={trajectory}
              currentDate={currentDate}
              onSelectDate={setCurrentDate}
            />
          </div>
        )}

        {/* TAB 2: MULTI-SITE COMPARATIVE MATRIX */}
        {currentTab === 'compare' && (
          <SiteComparisonMatrix
            currentDate={currentDate}
            onSelectSite={(site) => {
              setSelectedSite(site);
              setCurrentTab('cockpit');
            }}
          />
        )}

        {/* TAB 3: AUTONOMOUS LAUNCH & LANDING WINDOW FINDER */}
        {currentTab === 'windows' && (
          <MissionWindowFinder
            selectedSite={selectedSite}
            currentDate={currentDate}
            onSelectDate={(date) => {
              setCurrentDate(date);
              setCurrentTab('cockpit');
            }}
          />
        )}

        {/* TAB 4: NASA LOLA TOPOGRAPHIC TERRAIN EXPLORER */}
        {currentTab === 'terrain' && (
          <TerrainExplorer selectedSite={selectedSite} />
        )}

        {/* TAB 5: MOON ACADEMY & EDUCATIONAL BRIEFING */}
        {currentTab === 'academy' && (
          <EducationalGuide />
        )}
      </main>

      {/* 3. Flight Dynamics Mission Manifest Modal */}
      {isReportModalOpen && (
        <MissionReportModal
          site={selectedSite}
          windowScore={missionWindowScore}
          trajectory={trajectory}
          currentDate={currentDate}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-space-950/90 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div>
          LUNAR LANDING SITE NAVIGATOR • DEVELOPED FOR NASA INTERNATIONAL SPACE APPS CHALLENGE
        </div>
        <div className="mt-1 text-[11px] text-slate-600">
          IAU 2015 Selenographic Frame • NASA LOLA Digital Elevation Models • JPL Horizons Ephemeris Calibration
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

interface MissionTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'tactical' | 'terrain-profiler' | 'flight-readiness') => void;
}

interface TutorialStep {
  title: string;
  badge: string;
  summary: string;
  keyPoints: string[];
  operationalDirective: string;
  navTab?: 'tactical' | 'terrain-profiler' | 'flight-readiness';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '1. NASA Program & Target Selection (Artemis & CLPS)',
    badge: 'MISSION PLANNING',
    summary:
      'LUNA-HORIZON is pre-loaded with both official NASA Artemis III Human Landing System (HLS) candidate regions and Commercial Lunar Payload Services (CLPS) missions (IM-1, IM-2 PRIME-1, Astrobotic Griffin, Blue Origin Blue Moon MK1, Firefly Blue Ghost).',
    keyPoints: [
      'Toggle between Artemis Human Sorties and CLPS Robotic Landers (Nova-C, Griffin, Blue Moon, Blue Ghost).',
      'Review target Selenographic coordinates (Latitude, Longitude) and surface datum elevation (km).',
      'Inspect lander specifications and NASA Task Order awards (e.g. TO PRIME-1, CP-22).',
    ],
    operationalDirective: 'Select your target region from the top corridor dropdown before configuring flight windows.',
    navTab: 'tactical',
  },
  {
    title: '2. 3D Planetary Cartography & Hemispheric HUD',
    badge: 'TACTICAL VIEW',
    summary:
      'The 3D WebGL cartography globe provides real-time orbital perspective with the exact three hemispheric views specified in NASA flight documents: Near Side, Far Side, and the South Pole.',
    keyPoints: [
      'Near Side: Focuses on equatorial mare sites (e.g. Reiner Gamma, Mare Crisium).',
      'Far Side: Focuses on deep radio-quiet basins (e.g. Schrödinger Basin).',
      'South Pole: Features the 80°S–88°S graticule and tactical 100m landing ellipse reticle.',
      'Click directly on any 3D marker on the Moon to select that target candidate.',
    ],
    operationalDirective: 'Use the "South Pole" and "Solar Aspect" camera presets in the bottom-right corner of the 3D globe.',
    navTab: 'tactical',
  },
  {
    title: '3. Phase #2: 360° LOLA Topographic Horizon Profiler',
    badge: 'TERRAIN RAY-TRACING',
    summary:
      'Because the Moon has no atmosphere, shadows are razor-sharp. The continuous 360° Topographic Profiler visualizes crater rim silhouettes derived from LRO LOLA laser altimetry.',
    keyPoints: [
      'Hover over any azimuth (0°–360°) to inspect the exact obstacle elevation angle.',
      'Identify critical massifs and crater rims (e.g. Shackleton Rim Wall ~22km, de Gerlache Flank ~29km).',
      'Verify Ray-Tracing Clearance: Ensure the solar vector angle is higher than the obstacle angle (Δθ > 0°).',
      'Synthesize Custom Coordinates: Test any coordinate between 80°S and 90°S using regional DEM interpolation.',
    ],
    operationalDirective: 'Switch to the "Phase #2: Horizon Profiler" tab to analyze terrain occlusion zones.',
    navTab: 'terrain-profiler',
  },
  {
    title: '4. Mission Scrubber & Deep Space Network (DSN) Tracking',
    badge: 'TELECOMMUNICATIONS',
    summary:
      'Lunar libration wobbles the Moon by up to ±7.9°, causing Earth to oscillate near the polar horizon. The timeline scrubber lets you step through every hour of the mission stay.',
    keyPoints: [
      'Mission Elapsed Time (MET): Displays standardized NASA timecode (MET T+DDd HHh MMm).',
      'Deep Space Network (DSN): Tracks prime 70m antenna handoffs (Goldstone, Madrid, Canberra) as Earth rotates.',
      'Synchronized Gantt Ribbons: Amber bar indicates direct solar power (W/m²), cyan bar indicates Earth line-of-sight.',
      'Play/Pause & 1x/5x/20x speed toggles for rapid mission transit analysis.',
    ],
    operationalDirective: 'Scrub the slider or click any segment of the ribbon to inspect conditions at that specific hour.',
    navTab: 'tactical',
  },
  {
    title: '5. Launch Slip & Contingency Delay Simulator',
    badge: 'CONTINGENCY ANALYSIS',
    summary:
      'Unplanned launch scrubs or weather holds can shift touchdown by hours or days. The Launch Slip Simulator recalculates all celestial mechanics instantly without restarting the analysis.',
    keyPoints: [
      'Select delay presets (+6h, +12h, +24h, +48h, +72h) to simulate launch slips.',
      'Review Nominal Touchdown vs Adjusted Slipped Touchdown in real time.',
      'Watch for newly introduced shadow streaks that could freeze lander batteries.',
    ],
    operationalDirective: 'Switch to the "FRR Feasibility" tab and toggle "+24h" to verify landing window resilience.',
    navTab: 'flight-readiness',
  },
  {
    title: '6. Flight Readiness Review (FRR) & Technical Memorandum',
    badge: 'MISSION DISPATCH',
    summary:
      'Before launch approval, NASA conducts a rigorous Flight Readiness Review (FRR). LUNA-HORIZON scores the mission from 0 to 100 based on physical survival criteria.',
    keyPoints: [
      'FRR Verdict: MISSION GO (Score ≥ 75), CONDITIONAL CAUTION (50–74), or MISSION NO-GO (< 50).',
      'ALHAT Terrain Corridor: Categorizes local slope hazard into Class 1 (Safe), Class 2, or Class 3.',
      '1-Click Technical Memorandum: Generates a printable, NASA-formatted PDF report ready for flight operations.',
      'Export JSON Dataset: Downloads the raw ephemeris trajectory vectors for flight software ingestion.',
    ],
    operationalDirective: 'Click "Export Mission Brief" in the top navbar to print your official NASA flight document.',
    navTab: 'flight-readiness',
  },
];

export const MissionTutorialModal: React.FC<MissionTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      if (onNavigateToTab && TUTORIAL_STEPS[currentStep + 1].navTab) {
        onNavigateToTab(TUTORIAL_STEPS[currentStep + 1].navTab!);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (onNavigateToTab && TUTORIAL_STEPS[currentStep - 1].navTab) {
        onNavigateToTab(TUTORIAL_STEPS[currentStep - 1].navTab!);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-[#0b0e17] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              LUNA-HORIZON • Flight Manual & Mission Tutorial
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-slate-950/60 px-6 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            STEP {currentStep + 1} OF {TUTORIAL_STEPS.length}
          </span>
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  if (onNavigateToTab && TUTORIAL_STEPS[i].navTab) {
                    onNavigateToTab(TUTORIAL_STEPS[i].navTab!);
                  }
                }}
                className={`w-6 h-1.5 rounded-full cursor-pointer transition-all ${
                  i === currentStep
                    ? 'bg-cyan-400'
                    : i < currentStep
                    ? 'bg-slate-600'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-cyan-300 font-bold">{step.badge}</span>
        </div>

        {/* Main Step Content */}
        <div className="p-6 flex flex-col gap-4 font-sans text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono">{step.title}</h3>
            <p className="text-slate-300 mt-1.5 leading-relaxed">{step.summary}</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">
              Operational Protocols:
            </span>
            <ul className="space-y-2">
              {step.keyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-800/40 p-3 rounded-xl flex items-center gap-2.5 font-mono text-[11px] text-cyan-300">
            <span className="font-bold">DIRECTIVE:</span>
            <span>{step.operationalDirective}</span>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span className="text-[11px] text-slate-500 font-mono">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <span>{currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish & Explore' : 'Next Step'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

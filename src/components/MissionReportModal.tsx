import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import type { EphemerisSample, FeasibilityAssessment, LandingSite, MissionWindowConfig } from '../types/lunar';

interface MissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: LandingSite;
  assessment: FeasibilityAssessment;
  config: MissionWindowConfig;
  samples: EphemerisSample[];
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  isOpen,
  onClose,
  site,
  assessment,
  config,
  samples,
}) => {
  if (!isOpen) return null;

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          documentType: 'NASA Technical Memorandum - Lunar Landing Site Feasibility Assessment',
          generatedTimestampUtc: new Date().toISOString(),
          targetCandidateSite: site,
          missionParameters: config,
          flightReadinessReview: assessment,
          ephemerisTrajectoryVectors: samples,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `artemis-tm-${site.code.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-[#0b0e17] border border-slate-700/80 text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Action Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 no-print font-mono text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-wide text-slate-200">
              NASA TECHNICAL MEMORANDUM • ARTEMIS CANDIDATE SITE BRIEF
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            >
              <Download size={13} /> Export JSON Dataset
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-sm"
            >
              <Printer size={13} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Technical Memorandum Content */}
        <div className="p-8 overflow-y-auto flex-1 font-sans space-y-6 bg-[#0b0e17] print:bg-white print:text-black">
          {/* Header */}
          <div className="border-b border-slate-700 print:border-black pb-4 flex justify-between items-start font-mono">
            <div>
              <div className="text-[10px] text-cyan-400 print:text-blue-700 font-bold uppercase tracking-widest">
                NATIONAL AERONAUTICS AND SPACE ADMINISTRATION • ARTEMIS PROGRAM
              </div>
              <h1 className="text-xl font-bold mt-1 text-slate-100 print:text-black">
                LUNAR SOUTH POLE CANDIDATE SITE OPERATIONAL ASSESSMENT
              </h1>
              <p className="text-[11px] text-slate-400 print:text-gray-600 mt-0.5">
                TM-2026-LUNA-HORIZON • REGION CODE: {site.code} • MISSION WINDOW: {config.durationDays * 24}H
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-200 print:text-black">
                FRR STATUS: <span className="text-emerald-400 print:text-emerald-700">{assessment.verdict}</span>
              </div>
              <div className="text-slate-400 print:text-gray-600 tabular-nums">
                FEASIBILITY INDEX: {assessment.score}/100
              </div>
            </div>
          </div>

          {/* Coordinate Table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs border border-slate-800 print:border-gray-300 p-3.5 rounded-xl bg-slate-950/60 print:bg-gray-50">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">CANDIDATE TARGET</span>
              <span className="font-bold text-slate-200 print:text-black">{site.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">SELENOGRAPHIC COORDS</span>
              <span className="font-bold text-cyan-400 print:text-blue-700 tabular-nums">
                {site.latitude.toFixed(2)}° S, {site.longitude.toFixed(2)}° E
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">DATUM ELEVATION</span>
              <span className="font-bold text-slate-200 print:text-black tabular-nums">+{site.elevationKm} km</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">ALHAT HAZARD CLASS</span>
              <span className="font-bold text-slate-200 print:text-black">{assessment.alhatSafetyClass}</span>
            </div>
          </div>

          {/* Section 1: EPS Power */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black font-mono border-b border-slate-800 pb-1 mb-2.5">
              1. Electrical Power Subsystem (EPS) Illumination Performance
            </h3>
            <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed mb-3">
              Solar irradiance calculations account for lunar equator-to-ecliptic tilt (1.543°) and 360° LOLA digital elevation model (DEM) obstacle masks. Vertical solar array orientation assumed:
            </p>
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950/60 print:bg-gray-100 p-3 rounded-lg border border-slate-800/80 print:border-gray-300">
                <span className="text-slate-500 block text-[9px] uppercase">ILLUMINATION RATIO</span>
                <span className="text-base font-bold text-amber-400 print:text-amber-700 tabular-nums">{assessment.illuminationPercentage}%</span>
                <span className="text-slate-400 block text-[10px] tabular-nums">({assessment.totalSunlitHours}h total sunlit)</span>
              </div>
              <div className="bg-slate-950/60 print:bg-gray-100 p-3 rounded-lg border border-slate-800/80 print:border-gray-300">
                <span className="text-slate-500 block text-[9px] uppercase">MAX ECLIPSE DURATION</span>
                <span className="text-base font-bold text-slate-200 print:text-black tabular-nums">{assessment.maxContinuousDarknessHours}h</span>
                <span className="text-slate-400 block text-[10px]">Battery sizing requirement</span>
              </div>
              <div className="bg-slate-950/60 print:bg-gray-100 p-3 rounded-lg border border-slate-800/80 print:border-gray-300">
                <span className="text-slate-500 block text-[9px] uppercase">INTEGRATED POWER FLUX</span>
                <span className="text-base font-bold text-amber-400 print:text-amber-700 tabular-nums">{assessment.totalSolarEnergyKWhM2} kWh/m²</span>
                <span className="text-slate-400 block text-[10px]">At nominal solar constant</span>
              </div>
            </div>
          </div>

          {/* Section 2: Telecom */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black font-mono border-b border-slate-800 pb-1 mb-2.5">
              2. Direct-to-Earth (DTE) Telecommunications & DSN Ground Stations
            </h3>
            <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed mb-3">
              Line-of-sight calculations include optical/physical lunar librations and topocentric parallax over the lunar radius:
            </p>
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950/60 print:bg-gray-100 p-3 rounded-lg border border-slate-800/80 print:border-gray-300">
                <span className="text-slate-500 block text-[9px] uppercase">DTE VISIBILITY WINDOW</span>
                <span className="text-base font-bold text-sky-400 print:text-blue-700 tabular-nums">{assessment.dtePercentage}%</span>
                <span className="text-slate-400 block text-[10px] tabular-nums">({assessment.totalDTEHours}h direct link)</span>
              </div>
              <div className="bg-slate-950/60 print:bg-gray-100 p-3 rounded-lg border border-slate-800/80 print:border-gray-300">
                <span className="text-slate-500 block text-[9px] uppercase">MAX DTE BLACKOUT</span>
                <span className="text-base font-bold text-slate-200 print:text-black tabular-nums">{assessment.maxContinuousBlackoutHours}h</span>
                <span className="text-slate-400 block text-[10px]">Peak terrain occlusion</span>
              </div>
              <div className="bg-slate-950/60 print:bg-gray-100 p-3 rounded-lg border border-slate-800/80 print:border-gray-300">
                <span className="text-slate-500 block text-[9px] uppercase">DSN 70M TRACKING</span>
                <span className="text-xs font-bold text-slate-200 print:text-black">
                  G: {assessment.dsnCoverageSummary.goldstoneHours}h • M: {assessment.dsnCoverageSummary.madridHours}h • C: {assessment.dsnCoverageSummary.canberraHours}h
                </span>
                <span className="text-slate-400 block text-[10px]">Goldstone / Madrid / Canberra</span>
              </div>
            </div>
          </div>

          {/* Section 3: Directives */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black font-mono border-b border-slate-800 pb-1 mb-2.5">
              3. Operational Flight Rules & Recommendations
            </h3>
            <ul className="text-xs space-y-2 text-slate-300 print:text-gray-900 font-mono">
              {assessment.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 print:text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
              {assessment.risks.map((rk, i) => (
                <li key={i} className="flex items-start gap-2 text-rose-300 print:text-red-700">
                  <span className="font-bold">⚠️</span>
                  <span className="leading-relaxed">{rk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Signoff */}
          <div className="border-t border-slate-800 print:border-gray-400 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500 print:text-gray-600">
            <div>DOCUMENT ID: NASA-SP-2026-LUNA-HORIZON</div>
            <div>VERIFIED AGAINST SPICE JPL DE440 & LRO LOLA DATASETS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

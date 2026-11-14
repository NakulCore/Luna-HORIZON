import React from 'react';
import { EphemerisPoint, LandingSite, MissionWindowScore } from '../types/mission';
import { exportFlightManifestJson, exportTrajectoryToCsv } from '../services/reportGenerator';
import { Download, FileText, Printer, X, CheckCircle, ShieldCheck, Sun, Radio, Compass, Mountain } from 'lucide-react';

interface MissionReportModalProps {
  site: LandingSite;
  windowScore: MissionWindowScore;
  trajectory: EphemerisPoint[];
  currentDate: Date;
  onClose: () => void;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  site,
  windowScore,
  trajectory,
  currentDate,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportTrajectoryToCsv(site, trajectory);
  };

  const handleExportJson = () => {
    exportFlightManifestJson(site, windowScore, trajectory);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4" />
            <span>NASA Space Apps 2026 • Flight Dynamics Briefing</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            LUNAR LANDING SITE FEASIBILITY MANIFEST
          </h2>
          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
            <span>Target: <strong className="text-cyan-300">{site.name}</strong></span>
            <span>•</span>
            <span>Generated: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</span>
          </div>
        </div>

        {/* Target Site Details Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Selenographic Lat</span>
            <span className="font-bold text-slate-200">{site.latitude >= 0 ? `${site.latitude.toFixed(3)}°N` : `${Math.abs(site.latitude).toFixed(3)}°S`}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Selenographic Lon</span>
            <span className="font-bold text-slate-200">{site.longitude >= 0 ? `${site.longitude.toFixed(3)}°E` : `${Math.abs(site.longitude).toFixed(3)}°W`}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Elevation / Radius</span>
            <span className="font-bold text-slate-200">{site.elevationKm > 0 ? `+${site.elevationKm.toFixed(2)}` : site.elevationKm.toFixed(2)} km</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Slope Hazard Risk</span>
            <span className="font-bold text-slate-200">{site.slopeDegrees.toFixed(1)}° (Max 15°)</span>
          </div>
        </div>

        {/* Evaluated Window Metrics */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Mission Window Evaluation Telemetry
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> Solar Availability
              </span>
              <span className="text-base font-bold text-amber-300 mt-1 block">
                {windowScore.solarIlluminationPct}%
              </span>
              <span className="text-[10px] text-slate-400">{windowScore.continuousIlluminationHours}h max daylight</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Max Eclipse Dark
              </span>
              <span className="text-base font-bold text-slate-200 mt-1 block">
                {windowScore.maxEclipseDurationHours} hrs
              </span>
              <span className="text-[10px] text-slate-400">Battery survival burden</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" /> DTE Contact Link
              </span>
              <span className="text-base font-bold text-cyan-300 mt-1 block">
                {windowScore.dteContactPct}%
              </span>
              <span className="text-[10px] text-slate-400">{windowScore.continuousDteHours}h max continuous</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Composite Score
              </span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {windowScore.compositeScore.toFixed(1)} / 100
              </span>
              <span className="text-[10px] text-slate-400">{windowScore.riskRating} rating</span>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 mb-6 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Site Assessment:</strong> {site.description}
          </p>
          <p>
            <strong>Scientific Rationale:</strong> {site.scientificObjectives.join('. ')}.
          </p>
          <p>
            <strong>Engineering Constraints:</strong> {site.engineeringChallenges.join('. ')}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download CSV Telemetry</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Download Flight Manifest JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print Briefing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

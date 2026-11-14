import React from 'react';
import { Sun, Radio, Globe, Zap, AlertTriangle, CheckCircle, ShieldAlert, Wifi, BatteryCharging, Orbit } from 'lucide-react';
import { EphemerisPoint, LandingSite } from '../types/mission';

interface TelemetryHUDProps {
  point: EphemerisPoint;
  site: LandingSite;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ point, site }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Solar Subsystem & Power Generation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs tracking-wider uppercase">
              <Sun className="w-4 h-4" />
              <span>Solar Illumination</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                point.isSunDirectlyVisible
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : point.isSunAboveMathematicalHorizon
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {point.isSunDirectlyVisible
                ? 'DIRECT SUN'
                : point.isSunAboveMathematicalHorizon
                ? 'TERRAIN OCCLUDED'
                : 'SUB-HORIZON'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Elevation (Local)</span>
              <span
                className={`text-base font-bold ${
                  point.sunElevation > 0 ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {point.sunElevation > 0 ? '+' : ''}
                {point.sunElevation.toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Azimuth (North=0°)</span>
              <span className="text-base font-bold text-slate-200">
                {point.sunAzimuth.toFixed(1)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Terrain Ridge Mask</span>
              <span className="text-sm font-semibold text-slate-300">
                {point.sunHorizonObstruction.toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Solar Flux</span>
              <span className="text-sm font-semibold text-amber-300">
                {point.solarFluxWm2.toFixed(0)} <span className="text-[10px] text-slate-400">W/m²</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Power Viability:</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              point.isPowerViable ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <Zap className="w-3 h-3" />
            {point.isPowerViable ? 'Operational (>150 W/m²)' : 'Battery Depletion Risk'}
          </span>
        </div>
      </div>

      {/* 2. Direct-to-Earth (DTE) Communication Subsystem */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Radio className="w-4 h-4" />
              <span>DTE Earth Comm Link</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                point.isEarthDirectlyVisible
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : point.isEarthAboveMathematicalHorizon
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {point.isEarthDirectlyVisible
                ? 'LINK ACQUIRED'
                : point.isEarthAboveMathematicalHorizon
                ? 'RIDGE BLOCKED'
                : 'EARTHSET / BLACKOUT'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Earth Elevation</span>
              <span
                className={`text-base font-bold ${
                  point.earthElevation > 0 ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {point.earthElevation > 0 ? '+' : ''}
                {point.earthElevation.toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Earth Azimuth</span>
              <span className="text-base font-bold text-slate-200">
                {point.earthAzimuth.toFixed(1)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Ridge Clearance</span>
              <span
                className={`text-sm font-semibold ${
                  point.earthElevation - point.earthHorizonObstruction > 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {(point.earthElevation - point.earthHorizonObstruction).toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">RF Link Margin</span>
              <span
                className={`text-sm font-semibold ${
                  point.dteLinkMarginDb > 0 ? 'text-cyan-300' : 'text-rose-400'
                }`}
              >
                {point.dteLinkMarginDb > 0 ? `+${point.dteLinkMarginDb.toFixed(1)} dB` : 'NO SIGNAL'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Earth Illum Phase:</span>
          <span className="font-semibold text-slate-300 font-mono">
            {(point.earthPhase * 100).toFixed(0)}% Illuminated
          </span>
        </div>
      </div>

      {/* 3. Selenographic Geometry & Libration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Orbit className="w-4 h-4" />
              <span>Lunar Libration</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-300 border-purple-500/30">
              IAU 2015 FRAME
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Libration Lat (b)</span>
              <span className="text-sm font-bold text-slate-200">
                {point.subearthLat >= 0 ? '+' : ''}
                {point.subearthLat.toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Libration Lon (l)</span>
              <span className="text-sm font-bold text-slate-200">
                {point.subearthLon >= 0 ? '+' : ''}
                {point.subearthLon.toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Subsolar Lat</span>
              <span className="text-sm font-semibold text-slate-300">
                {point.subsolarLat >= 0 ? '+' : ''}
                {point.subsolarLat.toFixed(2)}°
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Subsolar Lon</span>
              <span className="text-sm font-semibold text-slate-300">
                {point.subsolarLon.toFixed(1)}°
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Lunar Cycle:</span>
          <span className="font-semibold text-purple-300 truncate max-w-[140px]">
            {point.lunarPhaseName}
          </span>
        </div>
      </div>

      {/* 4. Operational Go/No-Go Feasibility */}
      <div
        className={`border rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm transition-all ${
          point.isJointMissionFeasible
            ? 'bg-emerald-950/30 border-emerald-500/40'
            : point.isPowerViable || point.isCommViable
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-rose-950/20 border-rose-500/40'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase text-slate-200">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Mission Status</span>
            </div>
            <span
              className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                point.isJointMissionFeasible
                  ? 'bg-emerald-500 text-space-950 border-emerald-400 animate-pulse'
                  : point.isPowerViable
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {point.isJointMissionFeasible
                ? 'GO: JOINT FEASIBLE'
                : point.isPowerViable
                ? 'POWER ONLY (NO DTE)'
                : point.isCommViable
                ? 'COMM ONLY (DARK)'
                : 'NO-GO: BLACKOUT'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Solar Power:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  point.isPowerViable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {point.isPowerViable ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                {point.isPowerViable ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Earth Telemetry:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  point.isCommViable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {point.isCommViable ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                {point.isCommViable ? 'LOCKED' : 'UNAVAILABLE'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">PSR Ice Proximity:</span>
              <span className="font-semibold text-cyan-300 font-mono">
                {site.distanceToPsrKm.toFixed(2)} km
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Slope Risk:</span>
          <span className="font-semibold text-slate-300 font-mono">
            {site.slopeDegrees.toFixed(1)}° (Max 15°)
          </span>
        </div>
      </div>
    </div>
  );
};

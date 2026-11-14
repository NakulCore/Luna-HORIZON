import React from 'react';
import { BookOpen, Orbit, Sun, Radio, Droplets, Mountain, Award, CheckCircle2, Compass } from 'lucide-react';

export const EducationalGuide: React.FC = () => {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Academy Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              MOON ACADEMY: LUNAR POLAR ASTRODYNAMICS & HORIZON SCIENCE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              An educational briefing on why planning missions to the Moon's South Pole is so scientifically vital and geometrically challenging
            </p>
          </div>
        </div>

        {/* Core Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* 1. Low Obliquity */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
              <Sun className="w-4 h-4" />
              <span>1. The 1.54° Axial Tilt & Grazing Polar Sun</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Moon’s rotational axis is tilted only <strong>1.54°</strong> relative to the ecliptic plane (compared to Earth's 23.4°). At the lunar equator, the Sun rises high overhead at noon. But at the lunar South Pole (latitudes 85°S to 90°S), the Sun never rises high in the sky. Instead, it skims continuously around the horizon in a 360° circle, rising at most ~1.5° above or dipping ~1.5° below the horizontal plane.
            </p>
          </div>

          {/* 2. PSRs vs Peaks of Light */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-2">
              <Droplets className="w-4 h-4" />
              <span>2. Permanently Shadowed Regions & Peaks of Light</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Because the Sun stays grazing on the horizon, deep impact craters (like Shackleton, Haworth, and Faustini) cast permanent shadows into their interiors. These <strong>Permanently Shadowed Regions (PSRs)</strong> have not seen sunlight in over 2 billion years and reach frigid cryogenic temperatures of 35 Kelvin (-238°C), trapping volatile water ice. Conversely, elevated peaks (like Malapert Mountain) remain in quasi-eternal sunlight for over 90% of the year.
            </p>
          </div>

          {/* 3. Lunar Libration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-2">
              <Orbit className="w-4 h-4" />
              <span>3. Lunar Libration & Earth Communication Blackouts</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              While the Moon is tidally locked to Earth, orbital eccentricity and inclination produce an apparent wobble known as <strong>optical and physical libration</strong>. As seen from the lunar South Pole, the Earth oscillates in a complex Lissajous pattern across an elliptical zone up to ±7.9° in longitude and ±6.7° in latitude. When Earth dips below a local mountain ridge, ground teams experience direct-to-Earth communication blackouts without relay satellites.
            </p>
          </div>

          {/* 4. Vertical Solar Panels */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
              <Compass className="w-4 h-4" />
              <span>4. Vertical Solar Array Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              On Earth or at the lunar equator, solar panels lie horizontal or tilt slightly towards the equator. At the lunar poles, horizontal solar panels receive almost zero power ($\sin(1.5^\circ) \approx 2.6\%$). However, tall <strong>vertical deployable solar masts</strong> oriented perpendicularly towards the skimming sun capture the full solar constant ($1361 \, W/m^2 \cdot \cos(1.5^\circ) \approx 1360 \, W/m^2$), generating peak electrical energy.
            </p>
          </div>
        </div>

        {/* Walkthrough Section */}
        <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>HOW TO USE THIS TOOL TO PLAN AN ARTEMIS LANDING</span>
          </h3>

          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Select a Candidate Landing Site:</strong> Choose from the 13 NASA Artemis III candidate zones (e.g. Shackleton Connecting Ridge, Malapert Mountain) or enter custom coordinates.
            </li>
            <li>
              <strong>Inspect the 3D Sky Dome and Polar Radar:</strong> Observe whether the Sun and Earth are currently above the local terrain horizon obstruction angle.
            </li>
            <li>
              <strong>Analyze the Operational Feasibility Timeline:</strong> Look for the gold "Joint Feasible" bands where Solar Power and Earth Telemetry are simultaneously active.
            </li>
            <li>
              <strong>Run the Mission Window Optimizer:</strong> Use the Window Finder to automatically detect multi-month windows that minimize eclipse dark hours and guarantee uninterrupted communication.
            </li>
            <li>
              <strong>Export the Mission Brief:</strong> Download a verified flight manifest in JSON format or raw orbital telemetry in CSV format.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

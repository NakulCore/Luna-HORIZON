# 🛰️ LUNA-HORIZON: Lunar Landing Site Navigator

> **NASA Space Apps Challenge 2026** • Challenge: *Lunar Landing Site Navigator*  
> High-precision planetary astrodynamics, 360° LOLA digital elevation model horizon profiler, and Flight Readiness Review (FRR) feasibility simulator for **NASA Artemis III** & **NASA Commercial Lunar Payload Services (CLPS)** landing sites.

![System Status](https://img.shields.io/badge/System-Flight%20Ready-10b981?style=flat-square)
![Programs](https://img.shields.io/badge/NASA%20Programs-Artemis%20%7C%20CLPS-0284c7?style=flat-square)
![Ephemeris](https://img.shields.io/badge/Ephemeris-JPL%20DE440%20Compatible-f59e0b?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![Three.js](https://img.shields.io/badge/WebGL-Three.js-black?style=flat-square)

---

## 🌒 The Challenge & Real-World Impact

Missions targeting the **Lunar South Pole** and specialized scientific landing corridors encounter extreme operational constraints:
1. **Grazing Solar Illumination**: The Moon's axial tilt relative to the ecliptic is only **$1.543^\circ$**, causing the Sun to perpetually skim the horizon. Towering crater rims and mountain massifs cast vast, dynamic shadows that can rapidly freeze unheated avionics and starve solar arrays.
2. **Earth Libration & Telecommunications**: While the Moon is tidally locked to Earth, **optical and physical librations** (up to $\pm 6.7^\circ$ in latitude and $\pm 7.9^\circ$ in longitude) induce an apparent oscillation of Earth relative to the local horizon. Even gentle rises can occlude Direct-to-Earth (DTE) communication with NASA's Deep Space Network.
3. **NASA Operational Applications**:
   - **Artemis III / IV / V Human Landing System (HLS)**: Crewed surface sorties require continuous DTE coverage during Extravehicular Activities (EVAs) and stable power.
   - **CLPS Robotic Missions**: Commercial landers (Intuitive Machines NOVA-C, Astrobotic Griffin, Blue Origin Blue Moon MK1, Firefly Blue Ghost) rely on precise touchdown windows to prevent battery freeze during prolonged shadow phases.

---

## 🚀 System Architecture & Interface Tabs

The navigator features a unified, responsive interface configured into **5 core operational tabs**:

### 1. 🎛️ Mission Cockpit (`Tab: cockpit`)
* **Aerospace Telemetry HUD**: Real-time readouts for Solar Illumination status, Earth Line-of-Sight (DTE) link margin, Lunar Selenographic Libration angles, and ALHAT Landing Corridor Safety Index.
* **Time Controller**: Interactive simulation scrubber, Play/Pause toggle, 1x to 1000x time warp multipliers, and calendar-based UTC epoch selection.
* **3D Lunar Digital Globe (Three.js)**: Physically accurate Moon sphere with selenographic graticule rings (80°S, 85°S, 88°S), tactical landing ellipse reticles, raycasting marker selection, and sub-solar directional lighting.
* **3D Local Horizon Sky Dome**: Local topocentric celestial sphere showing real-time Sun and Earth trajectory arcs relative to the 360° terrain silhouette.
* **2D Polar Azimuthal Radar**: Polar stereographic radar reticle mapping local LOLA obstacle elevations against celestial vectors.
* **Candidate Site Directory & Custom Coordinates**: Pre-loaded with official Artemis and CLPS landing sites plus an on-the-fly custom coordinate synthesizer.
* **Feasibility Timeline & Operational Gantts**: 7-day chronological waveforms of solar elevation and DTE visibility vs. terrain obstacle masks, complete with operational state ribbons.

### 2. 📊 Site Comparison Matrix (`Tab: compare`)
* Multi-criteria evaluation table ranking all candidate sites across:
  * Cumulative Solar Illumination (%)
  * Continuous DTE Visibility (hrs)
  * Average Landing Slope Hazard (°)
  * Proximity to Permanently Shadowed Regions (PSRs in km)
  * Overall Composite Safety Index (0–100)

### 3. 🎯 Autonomous Window Finder (`Tab: windows`)
* Scans multi-month trajectory windows to compute optimal landing dates and epochs, optimizing for maximum concurrent solar power generation and uninterrupted DTE communications.

### 4. 🏔️ LOLA Topographic Terrain Explorer (`Tab: terrain`)
* 360° unwrapped LOLA skyline visualization.
* Topocentric obstacle distance calculations in kilometers to major massifs and crater rims.
* Terrain slope hazard distribution histograms compliant with NASA Autonomous Landing Hazard Avoidance Technology (ALHAT) criteria.

### 5. 🎓 Moon Academy & Educational Briefing (`Tab: academy`)
* Comprehensive pedagogical guide covering:
  * Selenographic coordinate frames (IAU 2015).
  * Solar grazing mechanics and polar seasons.
  * Earth optical and physical librations.
  * ALHAT slope thresholds and PSR cold-trap science.

---

## 📑 Flight Operations Manual & NASA Deliverables

A complete technical specification and operations flight manual is available in the repository root in both Word (`.docx`) and PDF (`.pdf`) formats:
- **`Lunar_Landing_Site_Navigator_Operations_Manual.docx`** (Word Document)
- **`Lunar_Landing_Site_Navigator_Operations_Manual.pdf`** (Ready-to-print PDF Document)

### Manual Contents:
1. **Executive Summary & Mission Overview**: Purpose, NASA challenge alignment, and real-world mission impact.
2. **Mathematical & Astrodynamics Formulations**: IAU 2015 Moon frame, topocentric parallax, grazing solar illumination, and libration formulas.
3. **Subsystem Architecture & Telemetry**: HUD indicators, scoring algorithms, and DSN tracking.
4. **Step-by-Step Operator Flight Manual**: Instructions for planning, evaluating, and simulating missions.
5. **Validation & Verification Standards**: JPL Horizons ephemeris benchmark comparisons and ALHAT slope hazard guidelines.

---

## 🛠️ Tech Stack

* **Framework**: React 19 + TypeScript + Vite
* **Astrodynamics**: `astronomy-engine` (High-precision celestial mechanics, JPL DE440 compatible)
* **3D Planetary Engine**: Three.js (WebGL)
* **Design & Styling**: Tailwind CSS v4, NASA Open MCT aesthetic
* **Icons**: `lucide-react`
* **Documentation Engine**: `python-docx` + Microsoft Word COM automation

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/NakulCore/Luna-HORIZON.git
cd Luna-HORIZON

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

---

## 🏛️ Acknowledgments & Standards
* **NASA Planetary Data System (PDS)** & **LRO LOLA Science Team**
* **NASA Jet Propulsion Laboratory (JPL)** Horizons System
* **NASA Commercial Lunar Payload Services (CLPS)** Program
* Reference UI/UX Architecture: [FahadKhan-20/lunar-landing](https://github.com/FahadKhan-20/lunar-landing)
* Built for the **NASA International Space Apps Challenge**.

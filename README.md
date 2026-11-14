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

## 🚀 Key Functional Modules

### 1. 🎯 Comprehensive NASA Program Support (Artemis & CLPS)
Pre-loaded with official NASA Artemis candidate sites and commercial missions directly from the **NASA CLPS Manifest**:
* **NASA CLPS Missions**:
  * **Site #10**: Intuitive Machines IM-2 (*NOVA-C / TO PRIME-1* • South Pole)
  * **Site #6**: Intuitive Machines IM-1 (*NOVA-C / TO 2-IM* • Malapert A Crater)
  * **Site #7**: Astrobotic Griffin Mission-1 (*Griffin / TO 20A* • Mons Mouton)
  * **Site #8**: Intuitive Machines IM-4 (*NOVA-C / CP-22* • Mons Mouton)
  * **Site #9**: Blue Origin Blue Moon / MK1 Pathfinder (*Blue Moon MK1 / CP-22* • South Pole)
  * **Site #2**: Intuitive Machines IM-3 (*NOVA-C / TO CP-11* • Reiner Gamma Swirl, Near Side)
  * **Site #3**: Firefly Blue Ghost Mission 1 (*Blue Ghost / TO 19D* • Mare Crisium, Near Side)
  * **Site #4**: Firefly Blue Ghost Mission 2 (*Blue Ghost / TO CS-3/4* • Far Side)
  * **Site #5**: Team Draper (*ispace-U.S. APEX 1.0 / TO CP-12* • Schrödinger Basin, Far Side)
* **NASA Artemis III Candidate Regions**:
  * *Shackleton Connecting Ridge (`ART-SCR-01`)*, *Malapert Massif (`ART-MLP-03`)*, *de Gerlache Rim 1 & 2*, *Haworth Rim*, *Nobile Rim 1*, *Amundsen Rim*.

### 2. 📡 Phase #2: 360° LOLA Topographic Horizon Profiler & Ray-Tracing
* **Continuous Horizon Mask**: Interactive SVG cross-section visualizing the 360° terrain silhouette ($0^\circ$ to $+7^\circ$ obstacle elevation) derived from LRO LOLA data.
* **Dynamic Landmark Identification**: Calculates line-of-sight vector distances to surrounding crater rims in kilometers (e.g. *Shackleton Rim Wall ~22km, de Gerlache Flank ~29km*).
* **Ray-Tracing Collision Detector**: Measures real-time angular clearance ($\Delta \theta = \theta_{\text{vector}} - \theta_{\text{mask}}$) for solar arrays and communication dishes.
* **Custom Coordinate Synthesizer**: Test any arbitrary selenographic coordinate between 80°S and 90°S with procedurally synthesized regional DEM masks.

### 3. 🌐 Phase #3: 3D Planetary Cartography & Hemispheric HUD (WebGL)
* Three.js lunar sphere featuring real-time solar vector lighting, crater terrain textures, and South Polar graticule rings ($80^\circ\text{S}, 85^\circ\text{S}, 88^\circ\text{S}$).
* **3 Hemispheric View Presets** directly matching NASA cartographic standards:
  * `Near Side`: Centers equatorial volcanic plains and magnetic swirls.
  * `Far Side`: Visualizes radio-quiet impact basins.
  * `South Pole`: Polar nadir projection with 100m tactical landing ellipse reticles.
* Click-to-select raycasting on all surface landing markers.

### 4. ⏱️ Phase #4: Mission Timeline, MET Clocks & DSN Ground Stations
* Standardized NASA **Mission Elapsed Time (MET)** counter (`MET T+02d 14h 00m`) alongside live synchronized UTC timecodes.
* **Deep Space Network (DSN) 70m Antenna Handoffs**: Simulates active tracking ground stations across **Goldstone (California)**, **Madrid (Spain)**, and **Canberra (Australia)** based on Earth's rotational aspect.
* Dual Gantt ribbons tracking solar flux ($W/m^2$) and DTE link margins with play/pause and $1\times / 5\times / 20\times$ simulation scrubbers.
* **Launch Slip Contingency Simulator**: Test $+6\text{h}$ to $+72\text{h}$ launch delays with instant recalculation of battery freeze margins and blackout windows.

### 5. 📋 Phase #5: Flight Readiness Review (FRR) & Official Technical Memorandum
* Multi-factor scoring algorithm evaluating Electrical Power Subsystems (EPS), Telecommunications, and ALHAT terrain slope hazards into an objective **0–100 Feasibility Index**:
  * `MISSION GO • NOMINAL (FLIGHT READY)` (Score $\ge 75$)
  * `CONDITIONAL CAUTION • MARGINAL` ($50 \le \text{Score} < 75$)
  * `MISSION NO-GO • UNSAFE` ($\text{Score} < 50$)
* **1-Click NASA Technical Memorandum**: Generates an official printable PDF report formatted to NASA Mission Operations Directorate standards, with raw JSON telemetry downloads for flight software ingestion.

---

## 📖 Mission Operations Flight Manual (Step-by-Step Tutorial)

1. **Step 1 — Program & Target Corridor Selection**: Choose between *Artemis Human Landing System* or *NASA CLPS Commercial Missions* (e.g. IM-2 on Shackleton Ridge or Griffin on Mons Mouton) using the top corridor bar.
2. **Step 2 — Configure Mission Touchdown Window**: Select the nominal touchdown UTC date/time and stay duration (3-day sortie, 7-day nominal stay, or 14-day full lunar daylight cycle).
3. **Step 3 — Inspect 3D Planetary Cartography & Radar Reticle**: Use the `Tactical HUD` to view the 3D Moon sphere with *Near Side*, *Far Side*, and *South Pole* camera presets, while observing the 360° Polar Radar reticle.
4. **Step 4 — Analyze 360° LOLA Topographic Horizon Cross-Section**: Switch to `Phase #2: Horizon Profiler` to hover over mountain landmarks, review topocentric obstacle distances in kilometers, and verify ray-tracing clearance ($\Delta \theta > 0^\circ$).
5. **Step 5 — Scrub Timeline & Run Launch Slip Contingencies**: Advance the mission timeline using the interactive scrubber to observe solar power curves and DSN ground station handoffs. Use the Launch Slip Simulator to evaluate window resilience under $+24\text{h}$ or $+48\text{h}$ launch scrubs.
6. **Step 6 — Review FRR Flight Readiness & Export Brief**: Check the automated Flight Readiness Review verdict and click **Export Mission Brief** to generate an official printable NASA Technical Memorandum or download raw JSON telemetry.

---

## 🧮 Mathematical & Astrodynamics Formulations

1. **Selenographic Sub-Solar Calculation**:
   $$\beta_\odot = -I \cdot \sin(\lambda_{\text{sun}} - \Omega)$$
   Where $I = 1.543^\circ$ (lunar obliquity), $\lambda_{\text{sun}}$ is geocentric ecliptic longitude, and $\Omega$ is the Moon's ascending node.

2. **Topocentric Parallax Correction**:
   $$\tan(E_{\text{topo}}) = \frac{\cos(z) - \frac{R_M}{d}}{\sin(z)}$$
   Where $z$ is the geocentric zenith angle, $R_M = 1737.4\text{ km}$ (Moon radius), and $d \approx 384,400\text{ km}$ (Earth-Moon distance).

3. **Solar Power Flux Model**:
   For vertical solar masts optimized for grazing polar sunlight:
   $$\Phi = \Phi_0 \cdot \cos(\theta_\odot) \quad (\text{for } \theta_\odot > \theta_{\text{mask}})$$
   Where $\Phi_0 \approx 1361.0\text{ W/m}^2$.

---

## 🛠️ Tech Stack

* **Framework**: React 19 + TypeScript + Vite
* **Astrodynamics**: `astronomy-engine` (High-precision sub-arcminute celestial mechanics)
* **3D Planetary Engine**: Three.js (WebGL)
* **Design & Styling**: Tailwind CSS v4, NASA Open MCT & Apple Design System aesthetics
* **Icons**: `lucide-react`

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
* Built for the **NASA International Space Apps Challenge**.

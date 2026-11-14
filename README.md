# 🛰️ LUNA-HORIZON: Lunar Landing Site Navigator

> **NASA Space Apps Challenge 2026** • Challenge: *Lunar Landing Site Navigator*  
> High-precision astrodynamics, topographic horizon masking, and Flight Readiness Review (FRR) feasibility simulator for NASA Artemis III candidate landing regions.

![System Status](https://img.shields.io/badge/System-Nominal-10b981?style=flat-square)
![Artemis Status](https://img.shields.io/badge/Artemis%20III-Flight%20Ready-0284c7?style=flat-square)
![Ephemeris](https://img.shields.io/badge/Ephemeris-JPL%20DE440%20Compatible-f59e0b?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![Three.js](https://img.shields.io/badge/WebGL-Three.js-black?style=flat-square)

---

## 🌒 The Challenge

Missions targeting the **Lunar South Pole** ($80^\circ\text{S}$ to $90^\circ\text{S}$) face severe operational constraints:
1. **Low Solar Elevation**: The Moon's equatorial tilt relative to the ecliptic is only **$1.543^\circ$**, causing the Sun to perpetually skim the horizon. Complex crater rims cast vast, dynamic shadows that threaten surface solar power arrays.
2. **Earth Libration & Occlusion**: While the Moon is tidally locked to Earth, **optical and physical librations** (up to $\pm 6.7^\circ$ in latitude and $\pm 7.9^\circ$ in longitude) create an apparent oscillatory wobble. At the South Pole, Earth hovers near the horizon, meaning even small hills can completely sever Direct-to-Earth (DTE) communication.
3. **Complex Legacy Tools**: Traditional astrodynamics platforms feature steep learning curves and bulky interfaces, hindering rapid evaluation during launch delays or timeline slips.

**LUNA-HORIZON** solves this by providing an intuitive, aerospace-grade flight control dashboard that calculates real-time celestial geometry against high-resolution topographic horizon profiles.

---

## 🚀 Key Features

### 1. 🎯 10 Curated NASA Artemis Candidate Sites
Pre-loaded with official Artemis III landing regions:
* **Shackleton - Connecting Ridge** (`ART-SCR-01`)
* **Peak near Shackleton** (`ART-PNS-02`)
* **Malapert Massif** (`ART-MLP-03`)
* **de Gerlache Rim 1 & 2** (`ART-DGR-04 / 05`)
* **Haworth Rim** (`ART-HAW-06`)
* **Nobile Rim 1** (`ART-NOB-07`)
* **Faustini Rim A** (`ART-FST-08`)
* **Amundsen Rim** (`ART-AMD-09`)
* **Leibnitz Beta Plateau** (`ART-LBN-10`)

### 2. 📡 Radar Horizon Reticle (Dual-Mode Projection)
* **Polar Radar Mode**: $360^\circ$ azimuthal reticle with concentric elevation rings ($0^\circ, 2^\circ, 5^\circ, 8^\circ, 10^\circ$), 36-tick cardinal markers, dynamic topographic obstacle mask, and live celestial vector clearance callouts.
* **Unwrapped Cylindrical Cross-Section**: Planetary cartography view plotting Azimuth ($0^\circ$ to $360^\circ$) on the X-axis against Elevation ($-2^\circ$ to $+10^\circ$) on the Y-axis.

### 3. 🌐 3D Lunar Cartography Explorer (WebGL / Three.js)
* Real-time lunar surface shader with realistic regolith albedo, impact crater topography, and deep-space solar illumination.
* South Polar Graticule ($80^\circ\text{S}, 85^\circ\text{S}, 88^\circ\text{S}$) and active $100\text{m}$ tactical landing ellipse reticle.
* Click-to-select raycasting on all candidate landing sites.
* Quick-action camera presets: *Polar Nadir* and *Sun Vector Aspect*.

### 4. ⏱️ Mission Control Timeline & Scrubber
* **Mission Elapsed Time (MET)** counter (`MET T+02d 14h 00m`) alongside live UTC timecodes.
* **Deep Space Network (DSN) Tracking**: Simulates prime 70m antenna handoffs between **Goldstone (California)**, **Madrid (Spain)**, and **Canberra (Australia)** based on Earth rotation.
* Dual synchronized Gantt ribbons displaying solar illumination ($W/m^2$) and DTE communication windows with real-time scrub and $1\times / 5\times / 20\times$ playback.

### 5. ⏳ Launch Slip / T0 Contingency Simulator
* Allows mission directors to test launch delays ($+6\text{h}, +12\text{h}, +24\text{h}, +48\text{h}, +72\text{h}$) with instantaneous recalculation of illumination and comms blackouts.

### 6. 📋 Flight Readiness Review (FRR) Scorecard
* Evaluates Electrical Power Subsystem (EPS), Telecommunications, and ALHAT Landing Corridor Hazards to output an objective **0–100 Feasibility Score** and verdict:
  * `MISSION GO • NOMINAL (FLIGHT READY)` (Score $\ge 75$)
  * `CONDITIONAL CAUTION • MARGINAL` ($50 \le \text{Score} < 75$)
  * `MISSION NO-GO • UNSAFE` ($\text{Score} < 50$)

### 7. 📄 1-Click NASA Technical Memorandum Export
* Generates an official printable Technical Memorandum (TM) compliant with NASA Mission Operations Directorate formatting, including PDF export and raw JSON telemetry downloads.

---

## 🧮 Astrodynamics & Physics Foundation

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

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **pnpm**

### Installation
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

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏛️ Acknowledgments & Standards
* **NASA Planetary Data System (PDS)** & **LRO LOLA Science Team**
* **NASA Jet Propulsion Laboratory (JPL)** Horizons System
* Built for the **NASA International Space Apps Challenge**.

import React, { useEffect, useRef } from 'react';
import { EphemerisPoint, LandingSite } from '../types/mission';
import { Compass, Sun, Radio } from 'lucide-react';

interface PolarHorizonRadarProps {
  site: LandingSite;
  point: EphemerisPoint;
  trajectory?: EphemerisPoint[];
}

export const PolarHorizonRadar: React.FC<PolarHorizonRadarProps> = ({ site, point, trajectory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 28;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Helper: Map topocentric (azimuthDeg, elevationDeg) to Canvas (x, y)
    // Azimuth 0 = North (Top), 90 = East (Right), 180 = South (Bottom), 270 = West (Left)
    // Elevation: 0 deg = maxRadius (perimeter), 90 deg = 0 radius (center Zenith)
    const polarToCanvas = (azDeg: number, elDeg: number) => {
      // Clamp elevation between -10 and 90 deg
      const clampedEl = Math.max(-5, Math.min(90, elDeg));
      // Radius fraction: at 0 deg elevation fraction = 1.0; at 90 deg fraction = 0
      // To emphasize polar low elevations, we can use linear or slightly scaled radius
      const r = maxRadius * (1 - clampedEl / 90);
      const thetaRad = (azDeg - 90) * (Math.PI / 180); // 0 at top
      return {
        x: centerX + r * Math.cos(thetaRad),
        y: centerY + r * Math.sin(thetaRad)
      };
    };

    // 1. Draw Radar Background & Concentric Elevation Rings
    ctx.fillStyle = '#060d1d';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.fill();

    const elevationRings = [
      { el: 0, label: '0° Horizon' },
      { el: 10, label: '10°' },
      { el: 30, label: '30°' },
      { el: 60, label: '60°' }
    ];

    elevationRings.forEach((ring) => {
      const r = maxRadius * (1 - ring.el / 90);
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = ring.el === 0 ? '#38bdf8' : '#1e293b';
      ctx.lineWidth = ring.el === 0 ? 1.5 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(ring.label, centerX + 5, centerY - r + 12);
    });

    // Center Zenith crosshair (90°)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // 2. Draw Cardinal Azimuth Spokes
    const cardinals = [
      { deg: 0, label: 'N (0°)' },
      { deg: 45, label: 'NE' },
      { deg: 90, label: 'E (90°)' },
      { deg: 135, label: 'SE' },
      { deg: 180, label: 'S (180°)' },
      { deg: 225, label: 'SW' },
      { deg: 270, label: 'W (270°)' },
      { deg: 315, label: 'NW' }
    ];

    cardinals.forEach((c) => {
      const thetaRad = (c.deg - 90) * (Math.PI / 180);
      const edgeX = centerX + maxRadius * Math.cos(thetaRad);
      const edgeY = centerY + maxRadius * Math.sin(thetaRad);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(edgeX, edgeY);
      ctx.strokeStyle = c.deg % 90 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = c.deg % 90 === 0 ? 1.2 : 0.8;
      ctx.stroke();

      // Label outside the perimeter
      const textX = centerX + (maxRadius + 14) * Math.cos(thetaRad);
      const textY = centerY + (maxRadius + 14) * Math.sin(thetaRad);
      ctx.fillStyle = c.deg === 0 ? '#38bdf8' : '#94a3b8';
      ctx.font = c.deg % 90 === 0 ? 'bold 10px monospace' : '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.label, textX, textY);
    });

    // 3. Draw LOLA 360° Terrain Horizon Obstruction Mask
    // Any point between 0° elevation and the terrain elevation angle is shaded mountain terrain!
    if (site.horizonProfile && site.horizonProfile.length > 0) {
      ctx.save();
      ctx.beginPath();

      // Outer boundary (perimeter at 0° elevation)
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);

      // Inner boundary (terrain elevation polygon)
      const sortedProfile = [...site.horizonProfile].sort((a, b) => a.azimuth - b.azimuth);
      const innerCoords = sortedProfile.map((p) => polarToCanvas(p.azimuth, p.elevation));

      ctx.moveTo(innerCoords[0].x, innerCoords[0].y);
      for (let i = 1; i < innerCoords.length; i++) {
        ctx.lineTo(innerCoords[i].x, innerCoords[i].y);
      }
      ctx.closePath();

      // Fill between perimeter and inner terrain ridge
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)'; // reddish mask representing terrain obstruction
      ctx.fill();

      // Draw the terrain ridge boundary line
      ctx.beginPath();
      ctx.moveTo(innerCoords[0].x, innerCoords[0].y);
      for (let i = 1; i < innerCoords.length; i++) {
        ctx.lineTo(innerCoords[i].x, innerCoords[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Trajectory Paths if provided
    if (trajectory && trajectory.length > 1) {
      // Sun Trajectory Track
      ctx.save();
      ctx.beginPath();
      const firstSun = polarToCanvas(trajectory[0].sunAzimuth, trajectory[0].sunElevation);
      ctx.moveTo(firstSun.x, firstSun.y);
      for (let i = 1; i < trajectory.length; i++) {
        const pt = polarToCanvas(trajectory[i].sunAzimuth, trajectory[i].sunElevation);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.restore();

      // Earth Libration Path Track
      ctx.save();
      ctx.beginPath();
      const firstEarth = polarToCanvas(trajectory[0].earthAzimuth, trajectory[0].earthElevation);
      ctx.moveTo(firstEarth.x, firstEarth.y);
      for (let i = 1; i < trajectory.length; i++) {
        const pt = polarToCanvas(trajectory[i].earthAzimuth, trajectory[i].earthElevation);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Current Sun Position
    const sunPos = polarToCanvas(point.sunAzimuth, point.sunElevation);
    // Glow circle
    const sunGlow = ctx.createRadialGradient(sunPos.x, sunPos.y, 2, sunPos.x, sunPos.y, 14);
    sunGlow.addColorStop(0, point.isSunDirectlyVisible ? 'rgba(251, 191, 36, 0.9)' : 'rgba(244, 63, 94, 0.9)');
    sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // Solid Sun disk
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = point.isSunDirectlyVisible ? '#fbbf24' : '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Sun text label
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`☀️ ${point.sunElevation.toFixed(1)}°`, sunPos.x + 8, sunPos.y - 4);

    // 6. Draw Current Earth Position
    const earthPos = polarToCanvas(point.earthAzimuth, point.earthElevation);
    const earthGlow = ctx.createRadialGradient(earthPos.x, earthPos.y, 2, earthPos.x, earthPos.y, 14);
    earthGlow.addColorStop(0, point.isEarthDirectlyVisible ? 'rgba(56, 189, 248, 0.9)' : 'rgba(244, 63, 94, 0.9)');
    earthGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(earthPos.x, earthPos.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // Solid Earth disk
    ctx.beginPath();
    ctx.arc(earthPos.x, earthPos.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = point.isEarthDirectlyVisible ? '#38bdf8' : '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Earth text label
    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`🌍 ${point.earthElevation.toFixed(1)}°`, earthPos.x + 8, earthPos.y + 12);

  }, [site, point, trajectory]);

  return (
    <div className="relative w-full h-[420px] lg:h-[480px] bg-slate-950/80 rounded-xl border border-slate-800 p-3 flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>POLAR HORIZON RADAR (STEREOGRAPHIC SKY PLOT)</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">0°–360° Azimuth vs 0°–90° Elevation</span>
      </div>

      {/* Radar Canvas */}
      <div className="flex-1 flex items-center justify-center py-1">
        <canvas
          ref={canvasRef}
          width={420}
          height={380}
          className="max-w-full max-h-full"
        />
      </div>

      {/* Legend & Telemetry Indicators */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-slate-300">Sun: {point.sunAzimuth.toFixed(0)}° Az</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span className="text-slate-300">Earth: {point.earthAzimuth.toFixed(0)}° Az</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500 inline-block" />
            <span className="text-slate-400">LOLA Ridge Mask</span>
          </div>
        </div>

        <div className="text-slate-400">
          Center = <strong className="text-cyan-300">Zenith (90°)</strong> | Outer = <strong className="text-slate-300">Horizon (0°)</strong>
        </div>
      </div>
    </div>
  );
};

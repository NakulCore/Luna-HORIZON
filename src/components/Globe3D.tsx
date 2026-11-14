import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EphemerisPoint, LandingSite } from '../types/mission';
import { CANDIDATE_LANDING_SITES } from '../data/candidateSites';
import { RotateCw, ZoomIn, ZoomOut, Crosshair, Compass } from 'lucide-react';

interface Globe3DProps {
  selectedSite: LandingSite;
  onSelectSite: (site: LandingSite) => void;
  point: EphemerisPoint;
}

/**
 * Procedurally generates a high-resolution lunar surface texture with realistic craters,
 * lunar maria (dark basalt plains), and highland regolith.
 */
function createProceduralMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base highland regolith (light grey)
  ctx.fillStyle = '#b0b5bc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Add subtle surface noise
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 35;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Draw Lunar Maria (Dark basalt regions: Oceanus Procellarum, Mare Imbrium, Mare Tranquillitatis, etc.)
  const maria = [
    { x: 750, y: 380, rX: 280, rY: 200, color: 'rgba(55, 60, 68, 0.75)' }, // Oceanus Procellarum
    { x: 920, y: 320, rX: 160, rY: 130, color: 'rgba(50, 55, 65, 0.75)' }, // Mare Imbrium
    { x: 1100, y: 360, rX: 130, rY: 100, color: 'rgba(52, 57, 66, 0.70)' }, // Mare Serenitatis
    { x: 1250, y: 400, rX: 140, rY: 110, color: 'rgba(48, 52, 60, 0.72)' }, // Mare Tranquillitatis
    { x: 1450, y: 380, rX: 110, rY: 90, color: 'rgba(50, 54, 62, 0.70)' },  // Mare Crisium
    { x: 1000, y: 650, rX: 240, rY: 180, color: 'rgba(65, 70, 78, 0.65)' }  // South Pole-Aitken Basin
  ];

  for (const m of maria) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rX, m.rY, 0, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.filter = 'blur(16px)';
    ctx.fill();
    ctx.restore();
  }

  // 4. Draw Notable Impact Craters (Tycho, Copernicus, Shackleton at South Pole)
  const craters = [
    { x: 950, y: 720, r: 24, rays: true }, // Tycho with radiant ray system
    { x: 880, y: 440, r: 28, rays: true }, // Copernicus
    { x: 1024, y: 1000, r: 18, rays: false }, // Shackleton (South Pole)
    { x: 1050, y: 980, r: 22, rays: false },  // Malapert / Shoemaker
    { x: 650, y: 400, r: 22, rays: false },
    { x: 1350, y: 600, r: 30, rays: false }
  ];

  for (const c of craters) {
    if (c.rays) {
      // Ray system
      ctx.strokeStyle = 'rgba(240, 245, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + Math.cos(angle) * 160, c.y + Math.sin(angle) * 160);
        ctx.stroke();
      }
    }
    // Crater rim
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 35, 42, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 235, 245, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Converts Selenographic Latitude & Longitude to 3D Cartesian Vector on Moon Sphere
 */
function latLonToVector3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export const Globe3D: React.FC<Globe3DProps> = ({ selectedSite, onSelectSite, point }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);

  // Mouse drag / interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    // Initial camera position angled towards lunar South Pole
    camera.position.set(0, -3.2, 3.8);
    camera.lookAt(0, -0.6, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Moon Sphere
    const MOON_RADIUS = 2.0;
    const geometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
    const moonTexture = createProceduralMoonTexture();
    const material = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.9,
      metalness: 0.05
    });
    const moon = new THREE.Mesh(geometry, material);
    scene.add(moon);
    moonMeshRef.current = moon;

    // 4. Directional Sun Light (represents exact subsolar coordinates)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.2);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Faint ambient light (simulating deep space earthshine / starlight)
    const ambientLight = new THREE.AmbientLight(0x0a1020, 0.25);
    scene.add(ambientLight);

    // 5. Selenographic Coordinate Grid rings
    const polarCircleRadius = MOON_RADIUS * Math.cos((-80 * Math.PI) / 180);
    const polarRingGeo = new THREE.RingGeometry(polarCircleRadius - 0.005, polarCircleRadius + 0.005, 64);
    const polarRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const polarRing = new THREE.Mesh(polarRingGeo, polarRingMat);
    polarRing.rotation.x = Math.PI / 2;
    polarRing.position.y = MOON_RADIUS * Math.sin((-80 * Math.PI) / 180);
    moon.add(polarRing);

    // 6. Site Markers Group
    const markersGroup = new THREE.Group();
    moon.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Add marker pins for all candidate sites
    CANDIDATE_LANDING_SITES.forEach((site) => {
      const pos = latLonToVector3(site.latitude, site.longitude, MOON_RADIUS + 0.02);
      
      let markerColor = 0x38bdf8; // Artemis = cyan
      if (site.category === 'clps') markerColor = 0xfbbf24; // CLPS = gold
      else if (site.category === 'historical') markerColor = 0x10b981; // Historical = emerald

      const markerGeo = new THREE.SphereGeometry(0.035, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      marker.userData = { site };
      markersGroup.add(marker);
    });

    // 7. Active Site Glowing Reticle
    const reticleGeo = new THREE.RingGeometry(0.05, 0.075, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    moon.add(reticle);
    reticleRef.current = reticle;

    // 8. Event Handlers for Drag & Rotate
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !moonMeshRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      moonMeshRef.current.rotation.y += deltaX * 0.006;
      moonMeshRef.current.rotation.x += deltaY * 0.006;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      e.preventDefault();
      const zoomSpeed = 0.002;
      const dist = cameraRef.current.position.length();
      const newDist = Math.max(2.5, Math.min(8.0, dist + e.deltaY * zoomSpeed));
      cameraRef.current.position.setLength(newDist);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Click to raycast landing site marker
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (markersGroupRef.current) {
        const intersects = raycaster.intersectObjects(markersGroupRef.current.children);
        if (intersects.length > 0 && intersects[0].object.userData.site) {
          onSelectSite(intersects[0].object.userData.site);
        }
      }
    };
    domElement.addEventListener('click', onClick);

    // 9. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (reticleRef.current) {
        // Pulsate reticle scale
        const s = 1.0 + 0.15 * Math.sin(Date.now() * 0.005);
        reticleRef.current.scale.set(s, s, s);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Sun Direction Light when subsolar coordinates change
  useEffect(() => {
    if (!sunLightRef.current) return;
    const sunPos = latLonToVector3(point.subsolarLat, point.subsolarLon, 15.0);
    sunLightRef.current.position.copy(sunPos);
  }, [point.subsolarLat, point.subsolarLon]);

  // Update Active Site Reticle Position
  useEffect(() => {
    if (!reticleRef.current) return;
    const pos = latLonToVector3(selectedSite.latitude, selectedSite.longitude, 2.025);
    reticleRef.current.position.copy(pos);
    reticleRef.current.lookAt(pos.clone().multiplyScalar(2));
  }, [selectedSite]);

  // Camera presets
  const focusSouthPole = () => {
    if (!cameraRef.current || !moonMeshRef.current) return;
    moonMeshRef.current.rotation.set(Math.PI / 2.3, 0, 0);
    cameraRef.current.position.set(0, -3.4, 2.6);
    cameraRef.current.lookAt(0, -0.6, 0);
  };

  const focusSelectedSite = () => {
    if (!cameraRef.current || !moonMeshRef.current) return;
    const targetVec = latLonToVector3(selectedSite.latitude, selectedSite.longitude, 1.0);
    moonMeshRef.current.rotation.y = -((selectedSite.longitude + 180) * Math.PI) / 180;
    moonMeshRef.current.rotation.x = ((selectedSite.latitude + 90) * Math.PI) / 180 - Math.PI / 2;
    cameraRef.current.position.set(0, 0, 4.2);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const dist = cameraRef.current.position.length();
    const newDist = Math.max(2.4, Math.min(8.0, dist + delta));
    cameraRef.current.position.setLength(newDist);
  };

  return (
    <div className="relative w-full h-[420px] lg:h-[480px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
      {/* HUD Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D SELENOGRAPHIC DIGITAL GLOBE</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Sun terminator & polar shadow model
          </div>
        </div>
      </div>

      {/* Target Site Readout (Top Right) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <div className="bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md text-right">
          <div className="text-xs font-bold text-cyan-300">{selectedSite.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {selectedSite.latitude.toFixed(2)}° Lat | {selectedSite.longitude.toFixed(2)}° Lon
          </div>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Interactive Controls Overlay (Bottom) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Category Legend */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg backdrop-blur-md text-[10px] pointer-events-auto">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Artemis III</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">CLPS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Historical</span>
          </div>
        </div>

        {/* View Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto ml-auto">
          <button
            onClick={focusSouthPole}
            title="Focus South Pole (80°-90°S)"
            className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all font-mono"
          >
            <span>South Pole</span>
          </button>
          <button
            onClick={focusSelectedSite}
            title="Center On Selected Target"
            className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs px-2.5 py-1.5 rounded-lg border border-cyan-500/30 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Site</span>
          </button>
          <button
            onClick={() => handleZoom(-0.6)}
            title="Zoom In"
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.6)}
            title="Zoom Out"
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

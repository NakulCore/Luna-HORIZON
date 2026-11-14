import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { EphemerisSample, LandingSite } from '../types/lunar';

interface LunarGlobe3DProps {
  sites: LandingSite[];
  selectedSite: LandingSite;
  onSelectSite: (site: LandingSite) => void;
  currentSample: EphemerisSample | null;
}

export const LunarGlobe3D: React.FC<LunarGlobe3DProps> = ({
  sites,
  selectedSite,
  onSelectSite,
  currentSample,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);

  // Converts selenographic lat/lon to 3D Cartesian coordinates on sphere radius R
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, -3.8, 2.3);
    camera.lookAt(0, -1.8, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting (authentic deep space solar illumination)
    const ambientLight = new THREE.AmbientLight(0x0c111d, 0.18);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e6, 3.2);
    sunLight.position.set(8, 0, 8);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Earthshine subtle fill light
    const earthshineLight = new THREE.DirectionalLight(0x38bdf8, 0.12);
    earthshineLight.position.set(0, 0, 8);
    scene.add(earthshineLight);

    // 5. Procedural Lunar Surface Texture & Bump Map
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Regolith gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#53565e');
      grad.addColorStop(0.5, '#6e727c');
      grad.addColorStop(1, '#414349');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Major maria (Imbrium, Serenitatis, Tranquillitatis)
      ctx.fillStyle = '#292b31';
      ctx.beginPath();
      ctx.arc(380, 200, 90, 0, Math.PI * 2);
      ctx.arc(520, 220, 70, 0, Math.PI * 2);
      ctx.arc(620, 260, 60, 0, Math.PI * 2);
      ctx.fill();

      // Polar terrain impact craters
      ctx.fillStyle = '#1c1e22';
      for (let i = 0; i < 400; i++) {
        const cx = Math.random() * 1024;
        const cy = 390 + Math.random() * 122;
        const r = 1.5 + Math.random() * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ejecta rays
      ctx.strokeStyle = 'rgba(235, 240, 250, 0.12)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 30; i++) {
        const cx = 512 + (Math.random() - 0.5) * 350;
        const cy = 340 + Math.random() * 160;
        ctx.beginPath();
        ctx.arc(cx, cy, 12 + Math.random() * 25, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    const moonGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const moonMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.88,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // 6. South Polar Graticule Rings (80°S, 85°S, 88°S)
    const graticuleGroup = new THREE.Group();
    moonMesh.add(graticuleGroup);

    [-80, -85, -88].forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = 1.802 * Math.sin(phi);
      const ringY = 1.802 * Math.cos(phi);

      const circleGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let a = 0; a <= 64; a++) {
        const theta = (a / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(ringRadius * Math.cos(theta), ringY, ringRadius * Math.sin(theta)));
      }
      circleGeo.setFromPoints(points);
      const ringLine = new THREE.Line(
        circleGeo,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18 })
      );
      graticuleGroup.add(ringLine);
    });

    // 7. Landing Site Markers
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Starfield particles
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 45;
      starPos[i + 1] = (Math.random() - 0.5) * 45;
      starPos[i + 2] = (Math.random() - 0.5) * 45;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xdde6ed, size: 0.06, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Mouse drag & Raycasting selection
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let startMouseX = 0;
    let startMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (moonMeshRef.current && markersGroupRef.current) {
        moonMeshRef.current.rotation.y += deltaX * 0.007;
        moonMeshRef.current.rotation.x += deltaY * 0.007;
        markersGroupRef.current.rotation.y = moonMeshRef.current.rotation.y;
        markersGroupRef.current.rotation.x = moonMeshRef.current.rotation.x;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const dist = Math.hypot(e.clientX - startMouseX, e.clientY - startMouseY);
      if (dist < 5 && markersGroupRef.current && cameraRef.current) {
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
        const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData && hit.userData.site) {
            onSelectSite(hit.userData.site as LandingSite);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(2.1, Math.min(7.5, camera.position.z + e.deltaY * 0.003));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [onSelectSite]);

  // Update site markers
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const radius = 1.82;

    sites.forEach((site) => {
      const isSelected = site.id === selectedSite.id;
      const pos = latLonToVector3(site.latitude, site.longitude, radius);

      const markerGeo = new THREE.SphereGeometry(isSelected ? 0.042 : 0.022, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x38bdf8 : 0xf59e0b,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      markerMesh.userData = { site };
      group.add(markerMesh);

      // Tactical landing ellipse outline for selected candidate
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(0.06, 0.075, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(0, 0, 0);
        ringMesh.userData = { site };
        group.add(ringMesh);
      }
    });
  }, [sites, selectedSite]);

  // Directional sunlight adjustment
  useEffect(() => {
    if (!sunLightRef.current || !currentSample) return;
    const sunAzRad = currentSample.sunAzimuth * (Math.PI / 180);
    const sunDist = 15;
    sunLightRef.current.position.set(
      Math.sin(sunAzRad) * sunDist,
      -0.25,
      Math.cos(sunAzRad) * sunDist
    );
  }, [currentSample]);

  // Preset Views matching NASA CLPS / Artemis Hemispheres
  const setViewSouthPole = () => {
    if (cameraRef.current && moonMeshRef.current && markersGroupRef.current) {
      moonMeshRef.current.rotation.set(0, 0, 0);
      markersGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, -3.8, 2.3);
      cameraRef.current.lookAt(0, -1.8, 0);
    }
  };

  const setViewNearSide = () => {
    if (cameraRef.current && moonMeshRef.current && markersGroupRef.current) {
      moonMeshRef.current.rotation.set(0, -Math.PI / 2, 0);
      markersGroupRef.current.rotation.set(0, -Math.PI / 2, 0);
      cameraRef.current.position.set(0, 0, 4.5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const setViewFarSide = () => {
    if (cameraRef.current && moonMeshRef.current && markersGroupRef.current) {
      moonMeshRef.current.rotation.set(0, Math.PI / 2, 0);
      markersGroupRef.current.rotation.set(0, Math.PI / 2, 0);
      cameraRef.current.position.set(0, 0, 4.5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const setViewSolar = () => {
    if (cameraRef.current && moonMeshRef.current && markersGroupRef.current && currentSample) {
      const azRad = currentSample.sunAzimuth * (Math.PI / 180);
      moonMeshRef.current.rotation.set(0, -azRad, 0);
      markersGroupRef.current.rotation.set(0, -azRad, 0);
      cameraRef.current.position.set(0, -3.2, 3.0);
      cameraRef.current.lookAt(0, -1.5, 0);
    }
  };

  return (
    <div className="telemetry-panel rounded-2xl h-[395px] relative overflow-hidden flex flex-col justify-between shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Frame */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              NASA Planetary Cartography
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {selectedSite.hemisphere.toUpperCase()} • {selectedSite.program} MISSION
          </span>
        </div>

        {currentSample && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-[10px] text-right pointer-events-auto">
            <div>
              <span className="text-slate-400">Sub-Solar (β, λ): </span>
              <span className="text-amber-400 font-semibold">
                {currentSample.subSolarLat >= 0 ? '+' : ''}{currentSample.subSolarLat.toFixed(2)}°, {currentSample.subSolarLon.toFixed(1)}°
              </span>
            </div>
            <div>
              <span className="text-slate-400">Sub-Earth Libration: </span>
              <span className="text-sky-400 font-semibold">
                {currentSample.subEarthLat >= 0 ? '+' : ''}{currentSample.subEarthLat.toFixed(2)}°, {currentSample.subEarthLon.toFixed(1)}°
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Aerospace Bar & NASA Hemispheric View Presets */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs font-mono pointer-events-auto">
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
          Target: <span className="font-semibold text-cyan-300">{selectedSite.name}</span> (
          {selectedSite.latitude.toFixed(2)}°, {selectedSite.longitude.toFixed(2)}°)
        </div>

        {/* 3 NASA Infographic Hemispheres */}
        <div className="segmented-control flex items-center text-[10px]">
          <button
            onClick={setViewNearSide}
            className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Near Side view (e.g. Mare Crisium, Reiner Gamma)"
          >
            Near Side
          </button>
          <button
            onClick={setViewFarSide}
            className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Far Side view (e.g. Schrödinger Basin)"
          >
            Far Side
          </button>
          <button
            onClick={setViewSouthPole}
            className="px-2 py-1 rounded hover:bg-slate-800 text-cyan-300 hover:text-white transition-colors font-semibold"
            title="South Pole view (e.g. Shackleton, Mons Mouton, Malapert)"
          >
            South Pole
          </button>
          <button
            onClick={setViewSolar}
            className="px-2 py-1 rounded hover:bg-slate-800 text-amber-300 hover:text-white transition-colors"
            title="View along Solar Vector"
          >
            Solar Aspect
          </button>
        </div>
      </div>
    </div>
  );
};

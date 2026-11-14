import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EphemerisPoint, LandingSite } from '../types/mission';
import { Sun, Radio, Compass, RotateCcw, Eye, ShieldAlert, CheckCircle } from 'lucide-react';

interface HorizonSkyDome3DProps {
  site: LandingSite;
  point: EphemerisPoint;
}

/**
 * Converts topocentric Azimuth (deg, clockwise from North) and Elevation (deg above horizontal plane)
 * to 3D Cartesian coordinates (X = East, Y = Up, Z = North)
 */
function topocentricToCartesian(azDeg: number, elDeg: number, radius: number): THREE.Vector3 {
  const azRad = azDeg * (Math.PI / 180);
  const elRad = elDeg * (Math.PI / 180);

  // In our Three.js coordinate system:
  // Y is UP (Zenith)
  // Z is NORTH (Azimuth = 0)
  // X is EAST (Azimuth = 90)
  // -Z is SOUTH (Azimuth = 180)
  // -X is WEST (Azimuth = 270)
  const y = radius * Math.sin(elRad);
  const horizontalRadius = radius * Math.cos(elRad);
  const x = horizontalRadius * Math.sin(azRad);
  const z = horizontalRadius * Math.cos(azRad);

  return new THREE.Vector3(x, y, z);
}

export const HorizonSkyDome3D: React.FC<HorizonSkyDome3DProps> = ({ site, point }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunBeamRef = useRef<THREE.Line | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const earthBeamRef = useRef<THREE.Line | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);

  // Drag interaction
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 14, theta: 0.2, phi: 1.2 }); // azimuth, elevation angle

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const updateCameraPosition = () => {
      const { radius, theta, phi } = cameraSphericalRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.set(x, Math.max(0.5, y), z);
      camera.lookAt(0, 0.8, 0);
    };
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Ground Plane & Polar Compass Grid
    const groundGeo = new THREE.CircleGeometry(10, 64);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x090f1d,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Compass Radar Rings
    [2.5, 5.0, 7.5, 10.0].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.02, r + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1e335b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.01;
      scene.add(ring);
    });

    // Cardinal Azimuth Spokes (North, East, South, West)
    const axesLinesMat = new THREE.LineBasicMaterial({ color: 0x334b77, transparent: true, opacity: 0.7 });
    const axesGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.02, -10),
      new THREE.Vector3(0, 0.02, 10),
      new THREE.Vector3(-10, 0.02, 0),
      new THREE.Vector3(10, 0.02, 0)
    ]);
    const axesLines = new THREE.LineSegments(axesGeo, axesLinesMat);
    scene.add(axesLines);

    // Center Lander Marker
    const landerGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.3, 8);
    const landerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const lander = new THREE.Mesh(landerGeo, landerMat);
    lander.position.y = 0.15;
    scene.add(lander);

    // 5. Build 360° LOLA Topographic Skyline
    // Construct cylinder strip where the top edge vertices match the LOLA horizon elevation profile!
    const SKYLINE_RADIUS = 10.0;
    const profile = site.horizonProfile;
    const vertices: number[] = [];
    const indices: number[] = [];

    // For each azimuth step, build bottom vertex (elev=0) and top vertex (elev = terrain elevation)
    const count = profile.length;
    for (let i = 0; i < count; i++) {
      const p = profile[i];
      const azRad = p.azimuth * (Math.PI / 180);
      const elevRad = Math.max(0.01, p.elevation) * (Math.PI / 180);

      // Bottom vertex on ground
      const bX = SKYLINE_RADIUS * Math.sin(azRad);
      const bY = 0;
      const bZ = SKYLINE_RADIUS * Math.cos(azRad);

      // Top vertex at elevation angle
      const tY = SKYLINE_RADIUS * Math.tan(elevRad);
      const tX = bX;
      const tZ = bZ;

      vertices.push(bX, bY, bZ); // index 2*i
      vertices.push(tX, tY, tZ); // index 2*i + 1
    }

    // Build triangle faces connecting adjacent azimuths
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const b1 = 2 * i;
      const t1 = 2 * i + 1;
      const b2 = 2 * next;
      const t2 = 2 * next + 1;

      // Two triangles per azimuth slice
      indices.push(b1, t1, t2);
      indices.push(b1, t2, b2);
    }

    const terrainGeo = new THREE.BufferGeometry();
    terrainGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    terrainGeo.setIndex(indices);
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0x1e2638,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Skyline top rim ridge highlight line
    const ridgePoints: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const p = profile[i];
      const azRad = p.azimuth * (Math.PI / 180);
      const elevRad = Math.max(0.01, p.elevation) * (Math.PI / 180);
      ridgePoints.push(
        new THREE.Vector3(
          SKYLINE_RADIUS * Math.sin(azRad),
          SKYLINE_RADIUS * Math.tan(elevRad),
          SKYLINE_RADIUS * Math.cos(azRad)
        )
      );
    }
    ridgePoints.push(ridgePoints[0].clone()); // close loop
    const ridgeGeo = new THREE.BufferGeometry().setFromPoints(ridgePoints);
    const ridgeMat = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 2 });
    const ridgeLine = new THREE.Line(ridgeGeo, ridgeMat);
    scene.add(ridgeLine);

    // 6. Sun Celestial Object
    const sunGeo = new THREE.SphereGeometry(0.4, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Sun directional line of sight beam
    const sunBeamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, 5, 0)
    ]);
    const sunBeamMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.6
    });
    const sunBeam = new THREE.Line(sunBeamGeo, sunBeamMat);
    scene.add(sunBeam);
    sunBeamRef.current = sunBeam;

    // 7. Earth Celestial Object
    const earthGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Earth DTE comm beam
    const earthBeamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, 5, 0)
    ]);
    const earthBeamMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });
    const earthBeam = new THREE.Line(earthBeamGeo, earthBeamMat);
    scene.add(earthBeam);
    earthBeamRef.current = earthBeam;

    // Ambient light
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);

    // 8. Event Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.006;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi + deltaY * 0.006)
      );

      updateCameraPosition();
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoom = e.deltaY * 0.01;
      cameraSphericalRef.current.radius = Math.max(6, Math.min(22, cameraSphericalRef.current.radius + zoom));
      updateCameraPosition();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 9. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [site]);

  // Update Sun and Earth 3D Positions based on Topocentric Ephemeris
  useEffect(() => {
    const CELESTIAL_DISTANCE = 9.8;

    // 1. Sun
    if (sunMeshRef.current && sunBeamRef.current) {
      const sunPos = topocentricToCartesian(point.sunAzimuth, point.sunElevation, CELESTIAL_DISTANCE);
      sunMeshRef.current.position.copy(sunPos);

      // Color changes based on line of sight
      const isSunBlocked = !point.isSunDirectlyVisible;
      const sunColor = isSunBlocked ? 0xf43f5e : 0xfbbf24; // red if blocked, gold if clear
      (sunMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(sunColor);

      // Update beam points
      sunBeamRef.current.geometry.setFromPoints([new THREE.Vector3(0, 0.2, 0), sunPos]);
      (sunBeamRef.current.material as THREE.LineBasicMaterial).color.setHex(sunColor);
    }

    // 2. Earth
    if (earthMeshRef.current && earthBeamRef.current) {
      const earthPos = topocentricToCartesian(point.earthAzimuth, point.earthElevation, CELESTIAL_DISTANCE);
      earthMeshRef.current.position.copy(earthPos);

      const isEarthBlocked = !point.isEarthDirectlyVisible;
      const earthColor = isEarthBlocked ? 0xf43f5e : 0x38bdf8; // red if blocked, cyan if clear
      (earthMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(earthColor);

      earthBeamRef.current.geometry.setFromPoints([new THREE.Vector3(0, 0.2, 0), earthPos]);
      (earthBeamRef.current.material as THREE.LineBasicMaterial).color.setHex(earthColor);
    }
  }, [point]);

  return (
    <div className="relative w-full h-[420px] lg:h-[480px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
      {/* HUD Header */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D LOCAL HORIZON SKY DOME</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            NASA LOLA 360° terrain skyline mask
          </div>
        </div>
      </div>

      {/* Target Status Overlay (Top Right) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none flex flex-col gap-1.5 items-end">
        {/* Sun Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono backdrop-blur-md ${
            point.isSunDirectlyVisible
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/40'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>
            Sun: {point.sunElevation > 0 ? '+' : ''}{point.sunElevation.toFixed(1)}° el / {point.sunAzimuth.toFixed(0)}° az
          </span>
          {point.isSunDirectlyVisible ? (
            <span className="text-[10px] text-emerald-400 font-sans font-bold">CLEAR</span>
          ) : (
            <span className="text-[10px] text-rose-400 font-sans font-bold">BLOCKED</span>
          )}
        </div>

        {/* Earth Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono backdrop-blur-md ${
            point.isEarthDirectlyVisible
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/40'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>
            Earth: {point.earthElevation > 0 ? '+' : ''}{point.earthElevation.toFixed(1)}° el / {point.earthAzimuth.toFixed(0)}° az
          </span>
          {point.isEarthDirectlyVisible ? (
            <span className="text-[10px] text-emerald-400 font-sans font-bold">DTE OK</span>
          ) : (
            <span className="text-[10px] text-rose-400 font-sans font-bold">OCCULTED</span>
          )}
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Footer Orientation Guide */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none text-[11px] font-mono">
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg backdrop-blur-md text-slate-400">
          Orientation: <strong className="text-slate-200">Z+ = North (0°)</strong> | <strong className="text-slate-200">X+ = East (90°)</strong> | Drag to orbit
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg backdrop-blur-md">
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Sun Beam
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Earth Beam
          </span>
        </div>
      </div>
    </div>
  );
};

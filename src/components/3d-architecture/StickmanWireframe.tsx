import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type SimMode = 'walking' | 'running' | 'violence' | 'falling' | 'normal';

interface StickmanWireframeProps {
  state: SimMode;
}

// 30 Line segments = 60 vertices = 180 float coordinates
const TOTAL_SEGMENTS = 30;
const TOTAL_VERTICES = TOTAL_SEGMENTS * 2;
const TOTAL_FLOATS = TOTAL_VERTICES * 3;

export const StickmanWireframe: React.FC<StickmanWireframeProps> = ({ state }) => {
  const isViolence = state === 'violence';
  const isRunning = state === 'running';
  const isFalling = state === 'falling';
  const isWalking = state === 'walking' || state === 'normal';

  const lineSegmentsRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Pre-allocate buffer array once (ZERO garbage collection)
  const [geometry, positionsArray] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(TOTAL_FLOATS);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return [geo, pos];
  }, []);

  // Update material color when state toggles without remounting
  useEffect(() => {
    if (materialRef.current) {
      if (isViolence) {
        materialRef.current.color.setRGB(1.0, 0.15, 0.15); // Crimson Red
      } else if (isFalling) {
        materialRef.current.color.setRGB(1.0, 0.45, 0.1); // Neon Alert Orange
      } else if (isRunning) {
        materialRef.current.color.setRGB(0.95, 0.72, 0.15); // Dynamic Amber
      } else {
        materialRef.current.color.setRGB(0.22, 0.74, 0.97); // Cyan Blue
      }
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        if (isViolence) {
          mat.color.setRGB(1.0, 0.15, 0.15);
          mat.opacity = 0.55;
        } else if (isFalling) {
          mat.color.setRGB(1.0, 0.45, 0.1);
          mat.opacity = 0.5;
        } else if (isRunning) {
          mat.color.setRGB(0.95, 0.72, 0.15);
          mat.opacity = 0.35;
        } else {
          mat.color.setRGB(0.22, 0.74, 0.97);
          mat.opacity = 0.2;
        }
      }
    }
  }, [isViolence, isFalling, isRunning]);

  // Fast direct buffer manipulation in useFrame (ZERO React re-renders!)
  useFrame((stateCtx) => {
    if (!lineSegmentsRef.current) return;
    const t = stateCtx.clock.getElapsedTime();

    // Reusable float variables
    let hX = 0, hY = 1.65, hZ = 0;
    let nX = 0, nY = 1.45, nZ = 0;
    let pX = 0, pY = 0.85, pZ = 0;
    let lsX = -0.25, lsY = 1.35, lsZ = 0;
    let leX = -0.32, leY = 1.05, leZ = 0;
    let lhX = -0.3, lhY = 0.75, lhZ = 0;
    let rsX = 0.25, rsY = 1.35, rsZ = 0;
    let reX = 0.32, reY = 1.05, reZ = 0;
    let rhX = 0.3, rhY = 0.75, rhZ = 0;
    let lhipX = -0.15, lhipY = 0.85, lhipZ = 0;
    let lkX = -0.18, lkY = 0.48, lkZ = 0;
    let lfX = -0.2, lfY = 0.05, lfZ = 0;
    let rhipX = 0.15, rhipY = 0.85, rhipZ = 0;
    let rkX = 0.18, rkY = 0.48, rkZ = 0;
    let rfX = 0.2, rfY = 0.05, rfZ = 0;

    if (isViolence) {
      // Violent combat state: aggressive punches, pushes, torso jerking
      const combatSpeed = t * 14;
      const jitter = (Math.sin(combatSpeed * 2.1) + Math.cos(combatSpeed * 3.3)) * 0.03;
      const torsoX = Math.cos(combatSpeed * 0.7) * 0.09 + jitter;
      const torsoY = 0.85 + Math.sin(combatSpeed * 0.8) * 0.07;
      const torsoZ = Math.sin(combatSpeed * 0.5) * 0.14;

      const punchL = Math.sin(combatSpeed);
      const punchR = Math.cos(combatSpeed * 1.25);

      hX = torsoX; hY = 1.62 + Math.sin(combatSpeed) * 0.05; hZ = torsoZ + 0.08;
      nX = torsoX; nY = 1.42 + Math.sin(combatSpeed) * 0.04; nZ = torsoZ;
      pX = torsoX * 0.5; pY = torsoY; pZ = torsoZ * 0.5;

      // Left arm thrusting forward violently
      lsX = torsoX - 0.28; lsY = 1.35; lsZ = torsoZ;
      leX = torsoX - 0.35; leY = 1.2 + punchL * 0.18; leZ = torsoZ + 0.32 + punchL * 0.22;
      lhX = torsoX - 0.32; lhY = 1.25 + punchL * 0.22; lhZ = torsoZ + 0.62 + punchL * 0.32;

      // Right arm defending / grappling
      rsX = torsoX + 0.28; rsY = 1.35; rsZ = torsoZ;
      reX = torsoX + 0.38; reY = 1.1 + punchR * 0.18; reZ = torsoZ + 0.18 + punchR * 0.18;
      rhX = torsoX + 0.34; rhY = 1.28 + punchR * 0.22; rhZ = torsoZ + 0.42 + punchR * 0.28;

      // Legs braced in dynamic fight stance
      lhipX = pX - 0.18; lhipY = pY; lhipZ = pZ;
      lkX = -0.28; lkY = 0.42 + Math.sin(combatSpeed * 0.9) * 0.08; lkZ = 0.32;
      lfX = -0.34; lfY = 0.05; lfZ = 0.52 + jitter;

      rhipX = pX + 0.18; rhipY = pY; rhipZ = pZ;
      rkX = 0.24; rkY = 0.38 + Math.cos(combatSpeed * 0.9) * 0.08; rkZ = -0.18;
      rfX = 0.3; rfY = 0.05; rfZ = -0.36 + jitter;
    } else if (isFalling) {
      // Falling state: sudden knockdown / slip
      const fallCycle = (t * 1.5) % 3.0; // 3-second fall and impact loop
      const fallProgress = Math.min(1.0, fallCycle / 1.0); // 1 sec fall, 2 sec on ground

      // Drop heights down to ground
      hY = 1.65 - fallProgress * 1.35;
      hZ = fallProgress * 0.5;
      hX = -fallProgress * 0.25;

      nY = 1.45 - fallProgress * 1.25;
      nZ = fallProgress * 0.4;
      pY = 0.85 - fallProgress * 0.72;
      pZ = fallProgress * 0.3;

      // Arms reaching outward / bracing
      lsY = nY - 0.05; leY = nY - 0.15; lhY = nY - 0.2;
      lsZ = nZ + 0.1; leZ = nZ + 0.25; lhZ = nZ + 0.45;
      rsY = nY - 0.05; reY = nY - 0.15; rhY = nY - 0.2;
      rsZ = nZ - 0.1; reZ = nZ - 0.2; rhZ = nZ - 0.35;

      // Legs bent / sprawled
      lhipY = pY; rhipY = pY;
      lkY = 0.18; lkZ = pZ - 0.2;
      lfY = 0.05; lfZ = pZ - 0.55;
      rkY = 0.22; rkZ = pZ + 0.15;
      rfY = 0.05; rfZ = pZ + 0.45;
    } else if (isRunning) {
      // Running / sprinting state: rapid stride, torso forward tilt
      const runSpeed = t * 7.5;
      const legSwing = Math.sin(runSpeed);
      const armSwing = Math.cos(runSpeed);
      const bounce = Math.abs(Math.sin(runSpeed * 2)) * 0.08;

      // Torso tilted forward by 0.12 in Z
      hY = 1.62 + bounce; hZ = 0.12;
      nY = 1.42 + bounce; nZ = 0.1;
      pY = 0.82 + bounce; pZ = 0;

      // Dynamic pumping arms
      lsY = 1.32 + bounce; leY = 1.02 + bounce; leZ = -armSwing * 0.35 + 0.1;
      lhY = 0.85 + bounce; lhZ = -armSwing * 0.5 + 0.2;

      rsY = 1.32 + bounce; reY = 1.02 + bounce; reZ = armSwing * 0.35 + 0.1;
      rhY = 0.85 + bounce; rhZ = armSwing * 0.5 + 0.2;

      // Dynamic high knee leg swings
      lhipY = 0.82 + bounce;
      lkY = 0.48 + bounce + Math.max(0, -legSwing * 0.2); lkZ = legSwing * 0.42;
      lfZ = legSwing * 0.55;

      rhipY = 0.82 + bounce;
      rkY = 0.48 + bounce + Math.max(0, legSwing * 0.2); rkZ = -legSwing * 0.42;
      rfZ = -legSwing * 0.55;
    } else {
      // Normal state: smooth rhythmic walk cycle
      const walkSpeed = t * 3.4;
      const legSwing = Math.sin(walkSpeed);
      const armSwing = Math.cos(walkSpeed);
      const bounce = Math.abs(Math.sin(walkSpeed * 2)) * 0.045;

      hY = 1.65 + bounce;
      nY = 1.45 + bounce;
      pY = 0.85 + bounce;

      lsY = 1.35 + bounce;
      leY = 1.05 + bounce; leZ = -armSwing * 0.2;
      lhY = 0.75 + bounce; lhZ = -armSwing * 0.35;

      rsY = 1.35 + bounce;
      reY = 1.05 + bounce; reZ = armSwing * 0.2;
      rhY = 0.75 + bounce; rhZ = armSwing * 0.35;

      lhipY = 0.85 + bounce;
      lkY = 0.48 + bounce + Math.max(0, -legSwing * 0.09); lkZ = legSwing * 0.24;
      lfZ = legSwing * 0.38;

      rhipY = 0.85 + bounce;
      rkY = 0.48 + bounce + Math.max(0, legSwing * 0.09); rkZ = -legSwing * 0.24;
      rfZ = -legSwing * 0.38;
    }

    // Direct memory pointer into Float32Array (3 coordinates per vertex, 2 vertices per segment)
    let ptr = 0;
    const writeSegment = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      positionsArray[ptr++] = x1; positionsArray[ptr++] = y1; positionsArray[ptr++] = z1;
      positionsArray[ptr++] = x2; positionsArray[ptr++] = y2; positionsArray[ptr++] = z2;
    };

    // 1. Head Wireframe Circle (16 segments = 32 vertices)
    const headRadius = 0.14;
    const segs = 16;
    for (let i = 0; i < segs; i++) {
      const theta1 = (i / segs) * Math.PI * 2;
      const theta2 = ((i + 1) / segs) * Math.PI * 2;
      writeSegment(
        hX + Math.cos(theta1) * headRadius, hY + Math.sin(theta1) * headRadius, hZ,
        hX + Math.cos(theta2) * headRadius, hY + Math.sin(theta2) * headRadius, hZ
      );
    }

    // 2. Head Crosshair (1 segment)
    writeSegment(hX - headRadius * 0.6, hY, hZ, hX + headRadius * 0.6, hY, hZ);

    // 3. Spine (Neck -> Pelvis) (1 segment)
    writeSegment(nX, nY, nZ, pX, pY, pZ);

    // 4. Shoulder Bar (2 segments)
    writeSegment(nX, nY, nZ, lsX, lsY, lsZ);
    writeSegment(nX, nY, nZ, rsX, rsY, rsZ);

    // 5. Left Arm (2 segments)
    writeSegment(lsX, lsY, lsZ, leX, leY, leZ);
    writeSegment(leX, leY, leZ, lhX, lhY, lhZ);

    // 6. Right Arm (2 segments)
    writeSegment(rsX, rsY, rsZ, reX, reY, reZ);
    writeSegment(reX, reY, reZ, rhX, rhY, rhZ);

    // 7. Pelvis to Hips (2 segments)
    writeSegment(pX, pY, pZ, lhipX, lhipY, lhipZ);
    writeSegment(pX, pY, pZ, rhipX, rhipY, rhipZ);

    // 8. Left Leg (2 segments)
    writeSegment(lhipX, lhipY, lhipZ, lkX, lkY, lkZ);
    writeSegment(lkX, lkY, lkZ, lfX, lfY, lfZ);

    // 9. Right Leg (2 segments)
    writeSegment(rhipX, rhipY, rhipZ, rkX, rkY, rkZ);
    writeSegment(rkX, rkY, rkZ, rfX, rfY, rfZ);

    // Mark geometry buffer as updated on GPU
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    attr.needsUpdate = true;

    // Update footprint ring position
    if (ringRef.current) {
      ringRef.current.position.set(pX, 0.01, pZ);
    }
  });

  return (
    <group position={[-0.1, -0.65, 0.6]}>
      {/* High-speed single draw-call line segments */}
      <lineSegments ref={lineSegmentsRef} geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          color={isViolence ? '#ef4444' : '#38bdf8'}
          linewidth={2}
        />
      </lineSegments>

      {/* Ground radar target shadow */}
      <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.36, 24]} />
        <meshBasicMaterial
          color={isViolence ? '#ef4444' : '#38bdf8'}
          transparent
          opacity={isViolence ? 0.5 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

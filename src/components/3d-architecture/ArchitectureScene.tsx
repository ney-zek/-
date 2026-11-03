import React from 'react';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { Esp32Board } from './Esp32Board';
import { RaspberryPiBoard } from './RaspberryPiBoard';
import { StickmanWireframe, SimMode } from './StickmanWireframe';
import { DataPacketsStream } from './DataPacketsStream';

interface ArchitectureSceneProps {
  state: SimMode;
}

export const ArchitectureScene: React.FC<ArchitectureSceneProps> = ({ state }) => {
  const isViolence = state === 'violence' || state === 'falling';

  return (
    <>
      {/* 1. CINEMATIC HIGH-TECH LAB LIGHTING SETUP (Optimized for 60FPS) */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#0e172a', '#020617', 0.5]} />

      {/* Main Key Spotlight (Optimized shadow map) */}
      <spotLight
        position={[-2.4, 3.2, 2.5]}
        target-position={[-2.4, 0.7, 0]}
        angle={0.45}
        penumbra={0.8}
        intensity={2.2}
        color={isViolence ? '#fca5a5' : '#7dd3fc'}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0001}
      />

      {/* Secondary Fill Spotlight (Lightweight no-shadow fill) */}
      <spotLight
        position={[2.2, 3.0, 2.0]}
        target-position={[2.2, -0.68, 0]}
        angle={0.48}
        penumbra={0.7}
        intensity={2.0}
        color="#a7f3d0"
      />

      {/* Center dramatic rim light focused on the Stickman */}
      <pointLight
        position={[0, 2.0, 1.8]}
        intensity={isViolence ? 2.5 : 1.2}
        color={isViolence ? '#ef4444' : '#38bdf8'}
        distance={6}
      />

      {/* 2. HIGH-TECH ENVIRONMENT PRESET (Night preset as requested) */}
      <Environment preset="night" environmentIntensity={0.5} />

      {/* 3. 3D LABORATORY WALL (On the left/back where ESP32 is mounted) */}
      <group position={[-2.4, 0.6, -0.05]}>
        {/* Main Wall Segment */}
        <mesh receiveShadow>
          <planeGeometry args={[2.5, 4.0]} />
          <meshStandardMaterial
            color="#0b1120"
            roughness={0.75}
            metalness={0.2}
          />
        </mesh>
        {/* Wall mounting plate for ESP32 */}
        <mesh position={[0, 0.1, 0.02]} receiveShadow>
          <boxGeometry args={[0.7, 1.15, 0.02]} />
          <meshStandardMaterial color="#030712" roughness={0.5} />
        </mesh>
        {/* Wall grid lines */}
        <mesh position={[0, -0.9, 0.02]}>
          <boxGeometry args={[2.4, 0.03, 0.01]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* 4. LABORATORY DESK & WORKBENCH (Under the Raspberry Pi) */}
      <group position={[2.2, -0.76, 0.1]}>
        {/* Desk Tabletop */}
        <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.8, 0.08, 1.4]} />
          <meshStandardMaterial
            color="#0f172a" // Sleek dark slate lab workbench
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>
        {/* Brushed steel frame edges */}
        <mesh position={[0, -0.09, 0.68]}>
          <boxGeometry args={[1.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Desk Legs */}
        {[
          [-0.8, -0.8, 0.55],
          [0.8, -0.8, 0.55],
          [-0.8, -0.8, -0.55],
          [0.8, -0.8, -0.55],
        ].map(([x, y, z], idx) => (
          <mesh key={idx} position={[x, y, z]}>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* 5. LABORATORY FLOOR GRID (Dark digital tech floor) */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color="#030712"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <gridHelper
        args={[16, 32, '#0d9488', '#0f172a']}
        position={[0, -1.49, 0]}
      />

      {/* 6. HARDWARE & ACTORS */}
      {/* (A) The ESP32-S3 Sensor on the Wall */}
      <Esp32Board state={state} />

      {/* (B) The Stickman in front of the ESP32 (Walking or Fighting wireframe) */}
      <StickmanWireframe state={state} />

      {/* (C) The Raspberry Pi on the Desk with subtle float */}
      <Float speed={1.2} rotationIntensity={0.02} floatIntensity={0.05} floatingRange={[-0.01, 0.01]}>
        <RaspberryPiBoard state={state} />
      </Float>

      {/* (D) Data Packets Streaming from ESP32 to Raspberry Pi */}
      <DataPacketsStream state={state} />

      {/* 7. CINEMATIC ORBIT CONTROLS (Bounded so jury can inspect everything in 3D) */}
      <OrbitControls
        makeDefault
        target={[0, 0.1, 0.2]}
        minDistance={3.0}
        maxDistance={7.5}
        minPolarAngle={Math.PI / 4.5}
        maxPolarAngle={Math.PI / 1.75}
        dampingFactor={0.06}
      />
    </>
  );
};

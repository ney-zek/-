import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { SimMode } from './StickmanWireframe';

interface Esp32BoardProps {
  state: SimMode;
}

export const Esp32Board: React.FC<Esp32BoardProps> = ({ state }) => {
  const isViolence = state === 'violence' || state === 'falling';
  const isRunning = state === 'running';
  const ledRef = useRef<THREE.Mesh>(null);
  const radarGroupRef = useRef<THREE.Group>(null);

  // Animate LED and expanding radar waves bouncing towards the stickman
  useFrame((stateCtx) => {
    const t = stateCtx.clock.getElapsedTime();

    // LED status pulse
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      if (isViolence) {
        // Fast intense red flashing
        const flash = Math.sin(t * 16) > 0 ? 3.0 : 0.4;
        mat.color.setRGB(1.0, 0.05, 0.05);
        mat.emissive.setRGB(1.0, 0.05, 0.05);
        mat.emissiveIntensity = flash;
      } else {
        // Soft calm blue pulse
        const pulse = (Math.sin(t * 3) + 1) / 2;
        mat.color.setRGB(0.15, 0.65, 1.0);
        mat.emissive.setRGB(0.1, 0.5, 0.95);
        mat.emissiveIntensity = 0.8 + pulse * 0.6;
      }
    }

    // Animate expanding WiFi CSI radar waves towards the center/stickman
    if (radarGroupRef.current) {
      const waveSpeed = isViolence ? 1.6 : 0.8;
      radarGroupRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const offset = idx * 0.25;
        const progress = (t * waveSpeed + offset) % 1.0;

        // Scale up as it expands
        const scale = 0.3 + progress * 2.8;
        mesh.scale.set(scale, scale, scale);

        // Move towards the stickman (+X and +Z)
        mesh.position.set(progress * 1.8, 0, progress * 0.6);

        // Fade opacity to 0
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mat) {
          const maxOpacity = isViolence ? 0.75 : 0.45;
          mat.opacity = Math.sin(progress * Math.PI) * maxOpacity * (1 - progress * 0.5);
          if (isViolence) {
            mat.color.setRGB(1.0, 0.15, 0.15);
          } else {
            mat.color.setRGB(0.1, 0.75, 1.0);
          }
        }
      });
    }
  });

  return (
    <group position={[-2.4, 0.7, 0.08]} rotation={[0, 0.22, 0]}>
      {/* 1. GREEN PCB BOARD (Authentic ESP32-S3 Dev Board form factor) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.55, 1.0, 0.025]} />
        <meshStandardMaterial
          color="#15803d" // Authentic dark green solder mask
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>

      {/* Gold edge connection pads on left and right */}
      <mesh position={[-0.25, 0, 0.015]}>
        <boxGeometry args={[0.04, 0.94, 0.005]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.25, 0, 0.015]}>
        <boxGeometry args={[0.04, 0.94, 0.005]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Dual Row Pin Headers (2x15 pins) */}
      <group position={[-0.25, 0, -0.04]}>
        <boxGeometry args={[0.04, 0.9, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </group>
      <group position={[0.25, 0, -0.04]}>
        <boxGeometry args={[0.04, 0.9, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </group>

      {/* 2. ESP32-S3 METALLIC RF SHIELDING CAN */}
      <mesh position={[0, -0.08, 0.035]} castShadow>
        <boxGeometry args={[0.38, 0.44, 0.04]} />
        <meshStandardMaterial
          color="#cbd5e1" // Brushed silver aluminum RF can
          metalness={0.95}
          roughness={0.18}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* 3. MEANDER PCB ANTENNA TRACE ON TOP (Silver/gold inverted-F trace) */}
      <group position={[0, 0.38, 0.02]}>
        <mesh>
          <boxGeometry args={[0.42, 0.16, 0.005]} />
          <meshStandardMaterial color="#14532d" roughness={0.3} />
        </mesh>
        {/* Antenna copper/silver zig-zag line */}
        <mesh position={[0, 0, 0.004]}>
          <boxGeometry args={[0.36, 0.12, 0.002]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* 4. BLACK SILICON MICROCHIPS & ICs */}
      {/* USB-UART chip */}
      <mesh position={[0, -0.38, 0.025]}>
        <boxGeometry args={[0.15, 0.12, 0.02]} />
        <meshStandardMaterial color="#09090b" roughness={0.5} />
      </mesh>
      {/* Power Regulator */}
      <mesh position={[-0.12, -0.38, 0.025]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      {/* Micro USB-C connector on bottom */}
      <mesh position={[0, -0.5, 0.025]}>
        <boxGeometry args={[0.2, 0.08, 0.04]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 5. SMD STATUS LED */}
      <mesh ref={ledRef} position={[0.12, -0.38, 0.028]}>
        <boxGeometry args={[0.04, 0.04, 0.015]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>

      {/* Dynamic Point light from ESP32 status LED */}
      <pointLight
        position={[0.12, -0.38, 0.08]}
        color={isViolence ? '#ef4444' : '#38bdf8'}
        intensity={isViolence ? 1.8 : 0.9}
        distance={2.5}
      />

      {/* 6. EXPANDING 3D RADAR RINGS (WiFi CSI Waves emitted towards stickman) */}
      <group ref={radarGroupRef} position={[0, 0.38, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.6, 0.015, 12, 48, Math.PI * 1.5]} />
            <meshBasicMaterial
              color={isViolence ? '#ef4444' : '#38bdf8'}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* 7. HTML 3D LABEL FOR THE ESP32 */}
      <Html
        position={[0, 0.72, 0.1]}
        distanceFactor={6.5}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="flex flex-col items-center gap-1 animate-fade-in" dir="rtl">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 border border-teal-500/50 backdrop-blur-md shadow-lg shadow-teal-500/20 text-center whitespace-nowrap">
            <div className="flex items-center gap-1.5 justify-center">
              <span className={`w-2 h-2 rounded-full ${isViolence ? 'bg-rose-500 animate-ping' : 'bg-teal-400 animate-pulse'}`} />
              <span className="text-[11px] font-black font-mono text-teal-300">ESP32-S3 (CSI Sensor)</span>
            </div>
            <span className="text-[9px] text-slate-400 block font-mono">
              {isViolence ? 'CSI Anomaly ⚠️' : '5.8GHz Transceiver'}
            </span>
          </div>
          {/* Subtle pointer line */}
          <div className="w-0.5 h-3 bg-gradient-to-b from-teal-500 to-transparent" />
        </div>
      </Html>
    </group>
  );
};

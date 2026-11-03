import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SimMode } from './StickmanWireframe';

interface RaspberryPiBoardProps {
  state: SimMode;
  isPacketImpacting?: boolean;
}

export const RaspberryPiBoard: React.FC<RaspberryPiBoardProps> = ({
  state,
}) => {
  const isViolence = state === 'violence' || state === 'falling';
  const actLedRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  // Animate Pi's activity LEDs when receiving packets
  useFrame((stateCtx) => {
    const t = stateCtx.clock.getElapsedTime();

    if (actLedRef.current && glowLightRef.current) {
      const mat = actLedRef.current.material as THREE.MeshStandardMaterial;

      if (isViolence) {
        // High-frequency activity strobe simulating streaming CSI packet processing
        const strobe = Math.sin(t * 22) > 0.2 ? 3.5 : 0.2;
        mat.color.setRGB(0.1, 1.0, 0.3);
        mat.emissive.setRGB(0.1, 1.0, 0.3);
        mat.emissiveIntensity = strobe;
        glowLightRef.current.intensity = strobe * 1.5;
        glowLightRef.current.color.setRGB(0.1, 1.0, 0.3);
      } else {
        // Intermittent gentle heartbeat LED
        const blink = Math.sin(t * 2) > 0.8 ? 1.4 : 0.3;
        mat.color.setRGB(0.1, 1.0, 0.3);
        mat.emissive.setRGB(0.1, 1.0, 0.3);
        mat.emissiveIntensity = blink;
        glowLightRef.current.intensity = blink * 0.4;
      }
    }
  });

  return (
    <group position={[2.2, -0.68, 0.1]} rotation={[-0.1, -0.28, 0]}>
      {/* 1. GREEN MAINBOARD PCB (Authentic Raspberry Pi 4/5 form factor) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.035, 0.8]} />
        <meshStandardMaterial
          color="#166534" // Authentic Raspberry Pi deep emerald green PCB
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Gold edge contacts & mounting screw holes (4 corners) */}
      {[
        [-0.5, -0.32],
        [0.5, -0.32],
        [-0.5, 0.32],
        [0.5, 0.32],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* 2. BROADCOM SOC WITH ANODIZED ALUMINUM HEATSINK */}
      <group position={[-0.08, 0.07, 0.02]}>
        {/* Base chip package */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.26, 0.03, 0.26]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Aluminum finned heatsink */}
        <mesh castShadow>
          <boxGeometry args={[0.24, 0.09, 0.24]} />
          <meshStandardMaterial
            color="#1e293b" // Dark metallic heatsink
            metalness={0.92}
            roughness={0.22}
            envMapIntensity={1.2}
          />
        </mesh>
        {/* Subtle cooling fins details */}
        {[-0.08, -0.03, 0.03, 0.08].map((offset, i) => (
          <mesh key={i} position={[offset, 0.03, 0]}>
            <boxGeometry args={[0.02, 0.06, 0.22]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 3. DUAL USB 3.0 / USB 2.0 PORT STACKS (Right side edge) */}
      {/* USB 3.0 Stack (Blue inner tabs) */}
      <group position={[0.48, 0.12, 0.16]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.22, 0.22]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Blue USB 3.0 plastic inserts */}
        <mesh position={[0.132, 0.04, 0]}>
          <boxGeometry args={[0.01, 0.04, 0.14]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.132, -0.04, 0]}>
          <boxGeometry args={[0.01, 0.04, 0.14]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* USB 2.0 Stack */}
      <group position={[0.48, 0.12, -0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.22, 0.22]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Black USB 2.0 inserts */}
        <mesh position={[0.132, 0.04, 0]}>
          <boxGeometry args={[0.01, 0.04, 0.14]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.132, -0.04, 0]}>
          <boxGeometry args={[0.01, 0.04, 0.14]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* 4. GIGABIT ETHERNET PORT (RJ45 Jack with metallic shield) */}
      <mesh position={[0.48, 0.11, -0.42]} castShadow>
        <boxGeometry args={[0.28, 0.2, 0.2]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* 5. 40-PIN GPIO HEADER (Optimized dual-row golden pin block) */}
      <group position={[-0.1, 0.05, 0.32]}>
        {/* Plastic base frame */}
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[0.74, 0.03, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Dual Golden Pin Header Rows */}
        <mesh position={[0, 0.025, 0.025]}>
          <boxGeometry args={[0.72, 0.06, 0.015]} />
          <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.025, -0.025]}>
          <boxGeometry args={[0.72, 0.06, 0.015]} />
          <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {/* 6. DUAL MICRO-HDMI & USB-C POWER PORTS (Bottom side edge) */}
      <mesh position={[-0.24, 0.04, -0.38]}>
        <boxGeometry args={[0.12, 0.06, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      <mesh position={[-0.04, 0.04, -0.38]}>
        <boxGeometry args={[0.1, 0.05, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      <mesh position={[0.14, 0.04, -0.38]}>
        <boxGeometry args={[0.1, 0.05, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* 7. STATUS LEDS: Red PWR LED & Green ACT LED */}
      {/* Red Power LED */}
      <mesh position={[-0.48, 0.03, 0.28]}>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* Green Activity LED (Flashes rapidly when packets hit the Pi) */}
      <mesh ref={actLedRef} position={[-0.44, 0.03, 0.28]}>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Dynamic LED activity glow on the Raspberry Pi board */}
      <pointLight
        ref={glowLightRef}
        position={[-0.44, 0.15, 0.28]}
        color={isViolence ? '#22c55e' : '#22c55e'}
        intensity={0.6}
        distance={2.0}
      />

      {/* 8. HTML 3D LABEL FOR RASPBERRY PI */}
      <Html
        position={[0, 0.48, 0]}
        distanceFactor={6.5}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="flex flex-col items-center gap-1 animate-fade-in" dir="rtl">
          <div className="px-3 py-1 rounded-xl bg-slate-950/85 border border-emerald-500/50 backdrop-blur-md shadow-lg shadow-emerald-500/20 text-center whitespace-nowrap">
            <div className="flex items-center gap-1.5 justify-center">
              <span className={`w-2 h-2 rounded-full ${isViolence ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-[11px] font-black font-mono text-emerald-300">Raspberry Pi (Local Server)</span>
            </div>
            <span className="text-[9px] text-slate-400 block font-mono">
              {isViolence ? 'Processing CSI Packets ⚡' : 'Local AI Edge Server'}
            </span>
          </div>
          {/* Pointer line */}
          <div className="w-0.5 h-3 bg-gradient-to-b from-emerald-500 to-transparent" />
        </div>
      </Html>
    </group>
  );
};

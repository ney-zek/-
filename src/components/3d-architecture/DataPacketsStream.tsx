import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AlertTriangle, Send, Server } from 'lucide-react';
import { SimMode } from './StickmanWireframe';

interface DataPacketsStreamProps {
  state: SimMode;
}

const PACKET_COUNT = 10;
const scratchMatrix = new THREE.Matrix4();
const scratchPosition = new THREE.Vector3();
const scratchScale = new THREE.Vector3();
const scratchRotation = new THREE.Euler();
const scratchQuaternion = new THREE.Quaternion();

export const DataPacketsStream: React.FC<DataPacketsStreamProps> = ({ state }) => {
  const isViolence = state === 'violence' || state === 'falling';
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  // Bezier curve points: ESP32 -> Mid-air arch -> Raspberry Pi
  const P0 = useMemo(() => new THREE.Vector3(-2.4, 0.7, 0.1), []);
  const Pctrl = useMemo(() => new THREE.Vector3(-0.1, 1.8, 0.5), []);
  const P1 = useMemo(() => new THREE.Vector3(2.2, -0.65, 0.1), []);

  // Pre-compute 30 trajectory points for lightweight native THREE.Line
  const trajectoryGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 32;
    for (let i = 0; i <= count; i++) {
      const u = i / count;
      const x = (1 - u) * (1 - u) * P0.x + 2 * (1 - u) * u * Pctrl.x + u * u * P1.x;
      const y = (1 - u) * (1 - u) * P0.y + 2 * (1 - u) * u * Pctrl.y + u * u * P1.y;
      const z = (1 - u) * (1 - u) * P0.z + 2 * (1 - u) * u * Pctrl.z + u * u * P1.z;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [P0, Pctrl, P1]);

  // Create lightweight native THREE.Line object
  const trajectoryLine = useMemo(() => {
    const mat = new THREE.LineDashedMaterial({
      color: '#f43f5e',
      dashSize: 0.15,
      gapSize: 0.08,
      scale: 1,
      transparent: true,
      opacity: 0.6,
    });
    const l = new THREE.Line(trajectoryGeometry, mat);
    l.computeLineDistances();
    return l;
  }, [trajectoryGeometry]);

  const packetOffsets = useMemo(() => {
    return Array.from({ length: PACKET_COUNT }, (_, i) => i / PACKET_COUNT);
  }, []);

  // Animate instanced mesh along the Bezier curve (1 single draw call!)
  useFrame((stateCtx) => {
    if (!instancedMeshRef.current) return;

    if (!isViolence) {
      instancedMeshRef.current.visible = false;
      trajectoryLine.visible = false;
      return;
    }

    instancedMeshRef.current.visible = true;
    trajectoryLine.visible = true;

    const t = stateCtx.clock.getElapsedTime();
    const speed = 1.35;

    for (let i = 0; i < PACKET_COUNT; i++) {
      const u = (t * speed + packetOffsets[i]) % 1.0;

      // Quadratic Bezier interpolation
      const x = (1 - u) * (1 - u) * P0.x + 2 * (1 - u) * u * Pctrl.x + u * u * P1.x;
      const y = (1 - u) * (1 - u) * P0.y + 2 * (1 - u) * u * Pctrl.y + u * u * P1.y;
      const z = (1 - u) * (1 - u) * P0.z + 2 * (1 - u) * u * Pctrl.z + u * u * P1.z;

      scratchPosition.set(x, y, z);
      scratchRotation.set(t * 3.5 + i, t * 4.0 + i, 0);
      scratchQuaternion.setFromEuler(scratchRotation);

      const s = Math.sin(u * Math.PI) * 0.08 + 0.035;
      scratchScale.set(s, s, s);

      scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
      instancedMeshRef.current.setMatrixAt(i, scratchMatrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. LIGHTWEIGHT NATIVE 3D TRAJECTORY LINE */}
      <primitive object={trajectoryLine} visible={isViolence} />

      {/* 2. 1-DRAW-CALL INSTANCED MESH FOR ALL DATA PACKETS */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, PACKET_COUNT]}
        visible={isViolence}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.8}
        />
      </instancedMesh>

      {/* 3. HTML 3D WARNING OVERLAY POPUP (When in violence state) */}
      {isViolence && (
        <Html
          position={[0.2, 1.85, 0.3]}
          distanceFactor={7}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="relative animate-bounce-subtle" dir="rtl">
            <div className="absolute -inset-2 bg-rose-600/35 rounded-3xl blur-xl animate-pulse" />

            <div className="relative p-3.5 sm:p-4 min-w-[280px] sm:min-w-[340px] bg-slate-950/95 border-2 border-rose-500 rounded-2xl shadow-[0_0_35px_rgba(244,63,94,0.6)] backdrop-blur-xl text-white">
              <div className="flex items-center justify-between border-b border-rose-500/40 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center animate-ping-slow">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-rose-100">
                      ⚠️ تنبيه: حركة عنيفة - إرسال البيانات إلى Raspberry Pi
                    </h4>
                    <span className="text-[10px] text-rose-300 font-mono">
                      CSI RAW BURST TRANSMISSION &bull; 1000 pkt/sec
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-rose-950/60 p-2 rounded-xl border border-rose-500/30">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Send className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>المصدر: <strong className="text-white">ESP32-S3</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>الهدف: <strong className="text-emerald-300">Raspberry Pi</strong></span>
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

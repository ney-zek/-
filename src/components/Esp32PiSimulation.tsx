import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ArchitectureScene } from './3d-architecture/ArchitectureScene';
import { SimMode } from './3d-architecture/StickmanWireframe';
import {
  Cpu,
  Server,
  Activity,
  Play,
  RotateCcw,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Copy,
  Check,
  HelpCircle,
  Flame,
  Radio,
  Monitor,
} from 'lucide-react';

interface Esp32PiSimulationProps {
  onClose?: () => void;
}

export type OSPlatform = 'windows' | 'mac' | 'linux';

interface SimScenario {
  id: SimMode;
  numberKey: string;
  nameAr: string;
  nameEn: string;
  badge: string;
  description: string;
  colorClass: string;
  activeBorder: string;
  bgGrad: string;
}

const SCENARIOS: SimScenario[] = [
  {
    id: 'walking',
    numberKey: '1',
    nameAr: 'المشي الطبيعي والعبور',
    nameEn: 'Normal Walking',
    badge: 'حالة آمنة 🟢',
    description: 'خطوط زرقاء هادئة، مشي انسيابي منتظم، أمواج WiFi CSI هادئة تعكس الحركة اليومية.',
    colorClass: 'text-sky-300',
    activeBorder: 'border-sky-400 bg-sky-950/70 shadow-sky-500/20',
    bgGrad: 'from-sky-500/20 to-transparent',
  },
  {
    id: 'running',
    numberKey: '2',
    nameAr: 'الركض والاقتراب السريع',
    nameEn: 'Fast Running / Sprint',
    badge: 'سرعة غير معتادة ⚡',
    description: 'خطوط كهرمانية متسارعة، ميل الجسد للأمام، إزاحة دوبلر في تردد إشارة الـ CSI.',
    colorClass: 'text-amber-300',
    activeBorder: 'border-amber-400 bg-amber-950/70 shadow-amber-500/20',
    bgGrad: 'from-amber-500/20 to-transparent',
  },
  {
    id: 'violence',
    numberKey: '3',
    nameAr: 'الاشتباك والعنف الجسدي',
    nameEn: 'Violent Fight & Push',
    badge: 'إنذار عنف 🚨',
    description: 'خطوط حمراء عشوائية عنيفة، إرسال حزم البيانات في الهواء فوراً نحو الـ Raspberry Pi.',
    colorClass: 'text-rose-300',
    activeBorder: 'border-rose-500 bg-rose-950/80 shadow-rose-600/30 animate-pulse-border',
    bgGrad: 'from-rose-500/20 to-transparent',
  },
  {
    id: 'falling',
    numberKey: '4',
    nameAr: 'السقوط والتعثر المفاجئ',
    nameEn: 'Sudden Fall / Knockdown',
    badge: 'رصد ارتطام 💥',
    description: 'انهيار مفاجئ وسقوط على الأرض، مستشعر سِتر يرسل نداء طوارئ فوري لإنقاذ الضحية.',
    colorClass: 'text-orange-300',
    activeBorder: 'border-orange-500 bg-orange-950/80 shadow-orange-600/30',
    bgGrad: 'from-orange-500/20 to-transparent',
  },
];

export const Esp32PiSimulation: React.FC<Esp32PiSimulationProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [simState, setSimState] = useState<SimMode>('walking');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedOS, setSelectedOS] = useState<OSPlatform>('windows');
  const [showArchitectureDetails, setShowArchitectureDetails] = useState<boolean>(false);
  const [showOSClientModal, setShowOSClientModal] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Detect OS on initial mount
  useEffect(() => {
    try {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('mac') || ua.includes('darwin')) {
        setSelectedOS('mac');
      } else if (ua.includes('linux')) {
        setSelectedOS('linux');
      } else {
        setSelectedOS('windows');
      }
    } catch {
      setSelectedOS('windows');
    }
  }, []);

  // Listen to browser native Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeFs = !!document.fullscreenElement;
      setIsFullscreen(activeFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen Toggle (YouTube-style)
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // Fallback CSS fullscreen toggle
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Navigation between scenarios
  const currentIndex = SCENARIOS.findIndex((s) => s.id === simState);

  const handleNextScenario = useCallback(() => {
    const nextIdx = (currentIndex + 1) % SCENARIOS.length;
    setSimState(SCENARIOS[nextIdx].id);
  }, [currentIndex]);

  const handlePrevScenario = useCallback(() => {
    const prevIdx = (currentIndex - 1 + SCENARIOS.length) % SCENARIOS.length;
    setSimState(SCENARIOS[prevIdx].id);
  }, [currentIndex]);

  // Auto-play demo cycle
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      handleNextScenario();
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNextScenario]);

  // Keyboard shortcut listener (YouTube style + OS presets)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // 'F' or 'F11' = Toggle Fullscreen (YouTube Standard)
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      // 'Space' = Toggle Violence
      if (e.key === ' ') {
        e.preventDefault();
        setSimState((prev) => (prev === 'violence' ? 'walking' : 'violence'));
      }
      // Number keys 1 - 4
      if (e.key === '1') setSimState('walking');
      if (e.key === '2') setSimState('running');
      if (e.key === '3') setSimState('violence');
      if (e.key === '4') setSimState('falling');

      // 'R' = Reset
      if (e.key === 'r' || e.key === 'R') {
        setSimState('walking');
        setCameraKey((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  const handleReset = () => {
    setSimState('walking');
    setIsAutoPlaying(false);
    setCameraKey((prev) => prev + 1);
  };

  // OS client code generation
  const getOSClientCode = () => {
    switch (selectedOS) {
      case 'windows':
        return `# PowerShell (Windows 10/11) - Sitr IoT Receiver Client
$port = 8080
$udpClient = New-Object System.Net.Sockets.UdpClient($port)
Write-Host "🟢 [Sitr-Windows] Listening for ESP32 & Raspberry Pi CSI alerts on UDP port $port..." -ForegroundColor Cyan

while ($true) {
    $remoteIpEndPoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)
    $rawBytes = $udpClient.Receive([ref]$remoteIpEndPoint)
    $message = [System.Text.Encoding]::UTF8.GetString($rawBytes)
    
    if ($message -like "*VIOLENCE*") {
        Write-Host "🚨 [ALERT RECEIVED]: Violence detected by Sitr sensor!" -ForegroundColor Red
        [System.Console]::Beep(1200, 400)
    } else {
        Write-Host "📡 [CSI Packet]: $message" -ForegroundColor Green
    }
}`;
      case 'mac':
        return `#!/bin/zsh
# macOS (Apple Silicon / Intel) - Sitr Local Edge Listener
PORT=8080
echo "🍎 [Sitr-macOS] Listening for CSI Packets from Raspberry Pi on UDP :$PORT..."

python3 -c "
import socket, json
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', $PORT))
while True:
    data, addr = sock.recvfrom(2048)
    msg = data.decode('utf-8', errors='ignore')
    if 'VIOLENCE' in msg:
        print('🚨 [macOS ALERT] Violence movement detected:', msg)
        import os; os.system('osascript -e \"display notification \\\"تنبيه: حركة عنيفة مرصودة عبر سِتر!\\\" with title \\\"Sitr Alert\\\"\"')
    else:
        print('📡 [CSI Frame]:', len(data), 'bytes from', addr)
"`;
      case 'linux':
        return `#!/usr/bin/env python3
# Linux / Raspberry Pi OS / Ubuntu Server Daemon
# Save as: sitr_daemon.py  -->  python3 sitr_daemon.py
import socket, sys, time

UDP_IP = "0.0.0.0"
UDP_PORT = 8080

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print("🐧 [Sitr-Linux] Daemon active on UDP port %d. Waiting for ESP32-S3 packets..." % UDP_PORT)

while True:
    data, addr = sock.recvfrom(1024)
    payload = data.decode("utf-8", errors="ignore")
    if "VIOLENCE" in payload:
        print("\x1b[91m[ALERT %s] VIOLENCE DETECTED ON NODE!\x1b[0m" % time.strftime('%H:%M:%S'))
    else:
        print("\x1b[92m[CSI %s]\x1b[0m Normal walking baseline received." % time.strftime('%H:%M:%S'))`;
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(getOSClientCode());
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const currentScenario = SCENARIOS.find((s) => s.id === simState) || SCENARIOS[0];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-[#050914] text-white overflow-hidden shadow-2xl selection:bg-teal-500/30 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none'
          : 'min-h-[640px] lg:min-h-[760px] rounded-3xl border border-slate-800'
      }`}
      dir="rtl"
    >
      {/* 1. TOP HEADER & TELEMETRY BAR */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-[#050914]/98 via-[#050914]/85 to-transparent backdrop-blur-md pointer-events-auto border-b border-slate-800/60">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10 shrink-0">
            <Cpu className="w-5 h-5 text-teal-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white">
                محاكاة سِتر ثلاثية الأبعاد (ESP32-S3 ➔ Raspberry Pi)
              </h2>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/80 text-teal-300 border border-teal-500/40">
                WiFi CSI &bull; Edge Server
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              رصد حركة الإنسان (مشي، ركض، عنف، سقوط) بدون كاميرات ونقل الحزم إلى الخادم المحلي
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* OS Platform Selector Buttons (Windows, Mac, Linux) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
            <span className="text-[10px] text-slate-400 px-1.5">النظام:</span>
            <button
              onClick={() => setSelectedOS('windows')}
              className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                selectedOS === 'windows'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Windows Shortcuts & Listener Client"
            >
              <span>⊞ Windows</span>
            </button>
            <button
              onClick={() => setSelectedOS('mac')}
              className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                selectedOS === 'mac'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="macOS Shortcuts & Listener Client"
            >
              <span> macOS</span>
            </button>
            <button
              onClick={() => setSelectedOS('linux')}
              className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                selectedOS === 'linux'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Linux / Raspberry Pi OS Daemon"
            >
              <span>🐧 Linux</span>
            </button>
          </div>

          {/* OS Client Code Modal Launcher */}
          <button
            onClick={() => setShowOSClientModal(true)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-cyan-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="أمر وكود الاستماع للبيانات لـ Windows / Mac / Linux"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">أمر العميل</span>
          </button>

          {/* Architecture Details Toggle */}
          <button
            onClick={() => setShowArchitectureDetails(!showArchitectureDetails)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-teal-300 transition cursor-pointer"
            title="شرح المعمارية التقنية"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Reset Camera View */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="إعادة ضبط المشهد (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* 🔥 YOUTUBE-STYLE FULLSCREEN BUTTON (ملء الشاشة بالكامل) */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              isFullscreen
                ? 'bg-teal-500/20 text-teal-300 border-teal-400 shadow-lg shadow-teal-500/20'
                : 'bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-md'
            }`}
            title={isFullscreen ? 'تصغير الشاشة (Esc)' : 'ملء الشاشة بالكامل مثل YouTube (F)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">تصغير (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">شاشة كاملة (F)</span>
              </>
            )}
          </button>

          {/* Close button if modal */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/40 text-rose-300 transition cursor-pointer"
              title="إغلاق المحاكاة"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. THE 3D VIEWPORT CANVAS */}
      <div className="relative flex-1 w-full h-full min-h-[460px] sm:min-h-[520px]">
        <Canvas
          key={cameraKey}
          shadows
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          camera={{
            position: [0.3, 0.9, 4.9], // Cinematic angle capturing ESP32, Stickman, and Pi in one frame
            fov: 46,
            near: 0.1,
            far: 40,
          }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ArchitectureScene state={simState} />
        </Canvas>

        {/* 360° Interaction Hint */}
        <div className="absolute top-20 right-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur-md pointer-events-none shadow-md">
          <Eye className="w-3.5 h-3.5 text-teal-400" />
          <span>اسحب بالفأرة أو اللمس لتدوير المنظور 360°</span>
        </div>

        {/* Live Hardware Flow Legend Badge */}
        <div className="absolute top-20 left-4 z-10 flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md shadow-xl text-start pointer-events-none text-xs">
          <div className="flex items-center gap-2 text-sky-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>ESP32-S3: رصد حقل WiFi CSI</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simState === 'violence' || simState === 'falling'
                  ? 'bg-rose-500 animate-ping'
                  : simState === 'running'
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
            />
            <span>
              الحالة الحركية: <strong className={currentScenario.colorClass}>{currentScenario.nameAr}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Raspberry Pi: خادم محلي لمعالجة الحزم</span>
          </div>
        </div>

        {/* Floating Quick Fullscreen & Auto-Play Overlay Controls */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          {/* YouTube-style Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-xl backdrop-blur-md transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="تكبير المشهد لملء الشاشة بالكامل مثل YouTube (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-teal-400" /> : <Maximize2 className="w-4 h-4 text-teal-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'تصغير' : 'تكبير الشاشة'}</span>
          </button>

          {/* Auto-Play Demo Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-2.5 rounded-2xl border shadow-xl backdrop-blur-md transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isAutoPlaying
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
            title="تشغيل تبديل المشاهد تلقائياً كعرض تقديمي"
          >
            <Play className={`w-3.5 h-3.5 ${isAutoPlaying ? 'text-teal-400' : ''}`} />
            <span>{isAutoPlaying ? 'العرض التلقائي نشط' : 'عرض تلقائي'}</span>
          </button>
        </div>
      </div>

      {/* 3. ARABIC CONTROL PANEL (التنقل بين المشاهد وأزرار الأنظمة) */}
      <div className="relative z-20 p-4 sm:p-5 bg-[#080d1a]/98 border-t border-slate-800/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex flex-col gap-3.5">
          {/* Header of control bar with sequential Next/Prev navigation */}
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>أزرار التنقل بين حالات المحاكاة (المشي / الركض / العنف / السقوط):</span>
              </span>
            </div>

            {/* Sequential Previous / Next buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevScenario}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
                title="المشهد السابق"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
              <button
                onClick={handleNextScenario}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
                title="المشهد التالي"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* The 4 Scenario Buttons: المشي الطبيعي | الركض | رصد العنف | السقوط */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SCENARIOS.map((scen) => {
              const isActive = simState === scen.id;
              return (
                <button
                  key={scen.id}
                  onClick={() => {
                    setSimState(scen.id);
                    setIsAutoPlaying(false);
                  }}
                  className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-start flex flex-col justify-between ${
                    isActive
                      ? scen.activeBorder
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-bold">
                        اختصار [{scen.numberKey}]
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isActive
                            ? scen.id === 'violence' || scen.id === 'falling'
                              ? 'bg-rose-500 animate-ping'
                              : 'bg-teal-400 shadow-[0_0_8px_#14b8a6]'
                            : 'bg-slate-700'
                        }`}
                      />
                    </div>
                    <h4 className="font-black text-xs sm:text-sm text-white mb-0.5">
                      {scen.nameAr}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {scen.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-teal-400">{scen.badge}</span>
                    <span className="text-slate-500 font-mono text-[9px]">{scen.nameEn}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* OS Buttons & Platform Shortcuts Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
            {/* OS Selector Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-teal-400" />
                <span>إعدادات النظام:</span>
              </span>
              <div className="inline-flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
                <button
                  onClick={() => setSelectedOS('windows')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    selectedOS === 'windows' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Windows
                </button>
                <button
                  onClick={() => setSelectedOS('mac')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    selectedOS === 'mac' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  macOS
                </button>
                <button
                  onClick={() => setSelectedOS('linux')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    selectedOS === 'linux' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Linux
                </button>
              </div>
            </div>

            {/* Dynamic Shortcuts for Selected OS */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap">
              <span className="font-medium text-slate-400">اختصارات {selectedOS.toUpperCase()}:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono font-bold">
                {selectedOS === 'mac' ? '⌃⌘F أو F' : 'F11 أو F'}
              </span>
              <span>شاشة كاملة</span>

              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono font-bold">
                Space
              </span>
              <span>تبديل العنف</span>

              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono font-bold">
                1 - 4
              </span>
              <span>المشاهد (مشي / ركض / عنف)</span>

              <button
                onClick={() => setShowOSClientModal(true)}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                عرض كود العميل &larr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL FOR OS CLIENT RECEIVER SCRIPT (Windows, Mac, Linux) */}
      {showOSClientModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-start">
          <div className="w-full max-w-2xl bg-[#0c162e] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative text-white space-y-4">
            <button
              onClick={() => setShowOSClientModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  برمجية استقبال البيانات لأنظمة ({selectedOS.toUpperCase()})
                </h3>
                <p className="text-xs text-cyan-300">
                  كود محلي للاستماع لحزم UDP المرسلة من لوحة Raspberry Pi في المدرسة
                </p>
              </div>
            </div>

            {/* OS Selector Tabs in Modal */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                onClick={() => setSelectedOS('windows')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedOS === 'windows' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                ⊞ Windows (PowerShell)
              </button>
              <button
                onClick={() => setSelectedOS('mac')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedOS === 'mac' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                 macOS (Terminal / Python)
              </button>
              <button
                onClick={() => setSelectedOS('linux')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedOS === 'linux' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                🐧 Linux (Daemon / systemd)
              </button>
            </div>

            {/* Code Snippet Box */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-64" dir="ltr">
              <pre>{getOSClientCode()}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                منفذ الاستماع الافتراضي: <strong>UDP 8080</strong> &bull; بروتوكول مشفر محلياً
              </span>
              <button
                onClick={handleCopyCommand}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                {copiedCmd ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCmd ? 'تم نسخ الكود!' : 'نسخ الكود'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TECHNICAL ARCHITECTURE SHEET */}
      {showArchitectureDetails && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-start">
          <div className="w-full max-w-lg bg-[#0c162e] border border-teal-500/40 rounded-3xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowArchitectureDetails(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Zap className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  المعمارية التقنية: تدفق بيانات ESP32 إلى Raspberry Pi
                </h3>
                <p className="text-xs text-teal-300">
                  ESP32-S3 CSI Sensing ➔ Raspberry Pi Local Edge Processing
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                تعتمد المنظومة على لوحة <strong>ESP32-S3</strong> صغيرة الحجم مثبتة على الحائط لإرسال واستقبال حزم WiFi بتردد 5.8 جيجاهرتز واستخراج مصفوفة <strong>CSI (Channel State Information)</strong>.
              </p>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h5 className="font-bold text-white text-xs">خطوات المعالجة والرصد:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li><strong>استشعار الحركة:</strong> حركة الأجسام في الممر تشوه طور وسعة إشارة الـ WiFi (Doppler Shift).</li>
                  <li><strong>نقل الحزم:</strong> عند رصد تشوه حركي حاد (اشتباك)، يقوم الـ ESP32 بإرسال حزم البيانات الخام عبر بروتوكول UDP فوري إلى لوحة <strong>Raspberry Pi</strong>.</li>
                  <li><strong>المعالجة المحلية:</strong> يقوم الـ Raspberry Pi بتشغيل نموذج تعلم عميق خفيف لتصنيف نوع العنف وإشعار إدارة المدرسة دون الحاجة لأي كاميرات.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowArchitectureDetails(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer"
            >
              العودة للمحاكاة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

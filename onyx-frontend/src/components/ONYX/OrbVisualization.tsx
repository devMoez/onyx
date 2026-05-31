import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MessageSquare, 
  Package, 
  Terminal, 
  Monitor, 
  Settings
} from 'lucide-react';
import './OrbVisualization.css';

interface OrbVisualizationProps {
  isListening: boolean;
  isProcessing: boolean;
  onMicToggle: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSettingsToggle?: () => void;
}

const OrbVisualization: React.FC<OrbVisualizationProps> = ({
  isListening,
  isProcessing,
  onMicToggle,
  activeTab = 'hud',
  onTabChange,
  onSettingsToggle
}) => {
  const orbCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('STANDBY');
  const animationRef = useRef<number>();
  const [dockBooted, setDockBooted] = useState(false);

  useEffect(() => {
    const orbCanvas = orbCanvasRef.current;
    const waveCanvas = waveCanvasRef.current;
    if (!orbCanvas || !waveCanvas) return;

    const ctx = orbCanvas.getContext('2d');
    const wctx = waveCanvas.getContext('2d');
    if (!ctx || !wctx) return;

    const W = 520, H = 520;
    const WW = 260, WH = 40;
    const S = 520 / 680;
    const bootDuration = 120;
    
    orbCanvas.width = W;
    orbCanvas.height = H;
    waveCanvas.width = WW;
    waveCanvas.height = WH;

    const cx = W / 2, cy = H / 2;

    let t = 0, boot = 0, scanAngle = 0;
    let voiceAmp = 0, voiceTarget = 0.4;
    let waveAmp = 0, waveTarget = 0.5;
    let waveColorT = 0, waveColorTarget = 0;

    const rings = [
      { r: 148 * S, speed: 0.0018, dash: [14, 7], width: 0.7, alpha: 0.5, dir: 1, tickCount: 60, labelEvery: 10 },
      { r: 130 * S, speed: -0.003, dash: [3, 9], width: 0.5, alpha: 0.25, dir: -1, tickCount: 0, labelEvery: 0 },
      { r: 114 * S, speed: 0.005, dash: [1, 0], width: 1.1, alpha: 0.65, dir: 1, tickCount: 48, labelEvery: 8 },
      { r: 98 * S, speed: -0.007, dash: [5, 5], width: 0.5, alpha: 0.3, dir: -1, tickCount: 0, labelEvery: 0 },
      { r: 80 * S, speed: 0.011, dash: [2, 5], width: 0.5, alpha: 0.22, dir: 1, tickCount: 36, labelEvery: 0 },
      { r: 62 * S, speed: -0.016, dash: [1, 0], width: 0.9, alpha: 0.55, dir: -1, tickCount: 0, labelEvery: 0 },
    ];

    const arcs = [
      { ring: 0, startA: 0.2, span: 1.2, width: 2.2, alpha: 0.85 },
      { ring: 0, startA: 3.0, span: 0.7, width: 2.2, alpha: 0.55 },
      { ring: 2, startA: 0.6, span: 2.0, width: 2.8, alpha: 0.95 },
      { ring: 2, startA: 4.0, span: 0.9, width: 2.8, alpha: 0.65 },
      { ring: 5, startA: 1.2, span: 2.6, width: 2.0, alpha: 0.8 },
    ];

    const dataLines = Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * Math.PI * 2,
      ring: (155 + Math.random() * 35) * S,
      len: 14 + Math.random() * 28,
      alpha: 0.12 + Math.random() * 0.22,
      speed: (Math.random() - 0.5) * 0.004,
      phase: Math.random() * Math.PI * 2
    }));

    const hex = (a: number) => `rgba(0,210,255,${a})`;
    const grn = (a: number) => `rgba(0,255,185,${a})`;

    const drawRing = (ring: any, angle: number, p: number) => {
      const { r, dash, width, alpha } = ring;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
      ctx.beginPath(); ctx.arc(0, 0, r * p, 0, Math.PI * 2);
      ctx.setLineDash(dash[1] === 0 ? [] : dash);
      ctx.strokeStyle = hex(alpha * Math.min(p * 3, 1));
      ctx.lineWidth = width; ctx.stroke(); ctx.restore();
    };

    const drawTicks = (ring: any, angle: number, p: number) => {
      if (!ring.tickCount) return;
      const { r, tickCount, labelEvery, alpha } = ring;
      for (let i = 0; i < tickCount; i++) {
        const a = angle + (i / tickCount) * Math.PI * 2;
        const big = labelEvery && i % labelEvery === 0;
        ctx.save(); ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r - (big ? 9 : 4)), Math.sin(a) * (r - (big ? 9 : 4)));
        ctx.lineTo(Math.cos(a) * (r + 1), Math.sin(a) * (r + 1));
        ctx.strokeStyle = hex(big ? alpha * 0.85 : alpha * 0.35);
        ctx.lineWidth = big ? 1.1 : 0.5; ctx.setLineDash([]); ctx.stroke();
        if (big && labelEvery && p > 0.8) {
          const lx = Math.cos(a) * (r - 16), ly = Math.sin(a) * (r - 16);
          ctx.fillStyle = hex(0.28); ctx.font = '7px Space Mono,Courier New';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(i).padStart(2, '0'), lx, ly);
        }
        ctx.restore();
      }
    };

    const drawArcs = (p: number) => {
      arcs.forEach(arc => {
        const ring = rings[arc.ring];
        const ba = t * ring.speed * ring.dir;
        ctx.save(); ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, ba + arc.startA, ba + arc.startA + arc.span * p);
        ctx.setLineDash([]);
        ctx.strokeStyle = hex(arc.alpha * Math.min(p * 2, 1));
        ctx.lineWidth = arc.width; ctx.stroke();
        const ea = ba + arc.startA + arc.span * p;
        ctx.beginPath();
        ctx.arc(Math.cos(ea) * ring.r, Math.sin(ea) * ring.r, arc.width * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = hex(arc.alpha * 0.9 * Math.min(p * 2, 1)); ctx.fill();
        ctx.restore();
      });
    };

    const drawScan = () => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(scanAngle);
      const or = rings[0].r;
      const sg = ctx.createLinearGradient(0, -or, 0, 0);
      sg.addColorStop(0, 'rgba(0,210,255,0.0)');
      sg.addColorStop(1, 'rgba(0,210,255,0.06)');
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.arc(0, 0, or, -Math.PI / 2 - 0.35, -Math.PI / 2);
      ctx.closePath(); ctx.fillStyle = sg; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -or);
      ctx.strokeStyle = 'rgba(0,210,255,0.35)';
      ctx.lineWidth = 0.8; ctx.setLineDash([]); ctx.stroke();
      ctx.restore();
      scanAngle += 0.013;
    };

    const drawDataLines = () => {
      dataLines.forEach(d => {
        d.angle += d.speed;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + d.phase);
        const r1 = d.ring, r2 = r1 + d.len * pulse;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(d.angle) * r1, cy + Math.sin(d.angle) * r1);
        ctx.lineTo(cx + Math.cos(d.angle) * r2, cy + Math.sin(d.angle) * r2);
        ctx.strokeStyle = hex(d.alpha * pulse);
        ctx.lineWidth = 0.7; ctx.setLineDash([]); ctx.stroke();
      });
    };

    const drawVoiceWave = () => {
      voiceAmp += (voiceTarget - voiceAmp) * 0.04;
      const bars = 28, innerR = rings[5].r - 6, outerMax = 16;
      for (let i = 0; i < bars; i++) {
        const a = (i / bars) * Math.PI * 2;
        const h = (3 + Math.abs(Math.sin(i * 0.65 + t * 0.13)) * outerMax) * voiceAmp;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
        ctx.lineTo(cx + Math.cos(a) * (innerR - h), cy + Math.sin(a) * (innerR - h));
        ctx.strokeStyle = grn(0.45 + voiceAmp * 0.35);
        ctx.lineWidth = 1.3; ctx.setLineDash([]); ctx.stroke();
      }
    };

    const drawCore = () => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 52);
      g.addColorStop(0, 'rgba(0,210,255,0.13)');
      g.addColorStop(0.5, 'rgba(0,180,255,0.04)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - 60, cy - 60, 120, 120);

      [0, 90, 180, 270].forEach(deg => {
        const a = (deg / 180) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
        ctx.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
        ctx.strokeStyle = 'rgba(0,210,255,0.45)';
        ctx.lineWidth = 0.8; ctx.setLineDash([]); ctx.stroke();
      });

      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,210,255,0.7)'; ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(0,225,255,0.97)';
      ctx.font = '700 20px Space Mono,Courier New';
      ctx.letterSpacing = '8px';
      ctx.fillText('ONYX', cx + 4, cy);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(0,210,255,0.22)';
      ctx.lineWidth = 0.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(cx - 28, cy - 13); ctx.lineTo(cx + 28, cy - 13); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 28, cy + 13); ctx.lineTo(cx + 28, cy + 13); ctx.stroke();

      ctx.beginPath(); ctx.arc(cx, cy + 22, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,230,255,0.8)';
      ctx.shadowColor = 'rgba(0,210,255,1)'; ctx.shadowBlur = 8;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.restore();
    };

    const waveColor = (t01: number, alpha: number) => {
      const r = 0;
      const g = Math.round(225 + t01 * 30);
      const b = Math.round(255 - t01 * 70);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const BARS = 38;
    const barW = 2.2;
    const gap = (WW - BARS * barW) / (BARS + 1);

    const drawAudioWave = (p: number) => {
      wctx.clearRect(0, 0, WW, WH);
      waveAmp += (waveTarget - waveAmp) * 0.045;
      waveColorT += (waveColorTarget - waveColorT) * 0.04;

      const centerY = WH / 2;
      const maxH = (WH / 2) - 3;

      for (let i = 0; i < BARS; i++) {
        const pos = i / (BARS - 1);
        const edge = Math.sin(pos * Math.PI);
        const wave1 = Math.abs(Math.sin(i * 0.48 + t * 0.09));
        const wave2 = Math.abs(Math.sin(i * 0.82 + t * 0.06 + 1.3));
        const h = ((wave1 * 0.6 + wave2 * 0.4) * edge * maxH * waveAmp * p) + 1.5;
        const x = gap + i * (barW + gap);
        const alpha = 0.35 + edge * 0.45 * waveAmp;

        const grad = wctx.createLinearGradient(0, centerY - h, 0, centerY + h);
        grad.addColorStop(0, waveColor(waveColorT, alpha * 0.4));
        grad.addColorStop(0.5, waveColor(waveColorT, alpha));
        grad.addColorStop(1, waveColor(waveColorT, alpha * 0.4));

        wctx.beginPath();
        wctx.roundRect(x, centerY - h, barW, h * 2, 1.5);
        wctx.fillStyle = grad;
        wctx.fill();
      }
    };

    const animate = () => {
      boot = Math.min(1, boot + 1 / bootDuration);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = boot;
      drawScan();
      rings.forEach(ring => {
        const a = t * ring.speed * ring.dir;
        drawRing(ring, a, boot);
        drawTicks(ring, a, boot);
      });
      drawArcs(boot);
      drawDataLines();
      drawVoiceWave();
      drawCore();
      ctx.restore();

      const waveP = Math.max(0, Math.min(1, (boot - 0.4) / 0.6));
      wctx.globalAlpha = waveP;
      drawAudioWave(waveP);

      if (boot >= 0.7 && !dockBooted) setDockBooted(true);
      if (t % 54 === 0) voiceTarget = 0.25 + Math.random() * 0.75;
      if (t % 42 === 0) {
        if (isListening) waveTarget = 0.3 + Math.random() * 0.85;
        else waveTarget = 0.08 + Math.random() * 0.06;
      }
      waveColorTarget = isProcessing ? 1 : 0;
      t++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening, isProcessing, dockBooted]);

  // Sync status text
  useEffect(() => {
    if (isProcessing) setStatus('PROCESSING');
    else if (isListening) setStatus('LISTENING');
    else setStatus('STANDBY');
  }, [isListening, isProcessing]);

  const functionalTabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, tip: '[ C ]' },
    { id: 'artifacts', label: 'Artifacts', icon: Package, tip: '[ A ]' },
    { id: 'terminal', label: 'Terminal', icon: Terminal, tip: '[ T ]' },
    { id: 'screen', label: 'Screen', icon: Monitor, tip: '[ S ]' },
  ];

  return (
    <div className="orb-visualization">
      <div className="orb-wrapper">
        <canvas ref={orbCanvasRef} id="orb" />
        <canvas ref={waveCanvasRef} id="wave" />
        
        <div className={`status-line ${isProcessing ? 'processing' : ''}`}>
          <span className="status-text">{status}</span>
          <span className="status-cursor" />
        </div>

        <div className="dock">
          {/* 3D Mic Button */}
          <motion.button
            className={`dock-btn ${isListening ? 'active' : ''}`}
            onClick={onMicToggle}
            title="Listen/Record"
            data-tip="[ V ]"
            initial={{ opacity: 0, scale: 0.7, y: 4 }}
            animate={dockBooted ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {isListening && <span className="live-dot" />}
            <svg viewBox="0 0 24 24" className="lined-icon">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </motion.button>

          {/* 3D Functional Tabs */}
          {functionalTabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              className={`dock-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange?.(tab.id)}
              title={tab.label}
              data-tip={tab.tip}
              initial={{ opacity: 0, scale: 0.7, y: 4 }}
              animate={dockBooted ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 15,
                delay: 0.13 * (i + 1) 
              }}
            >
              <tab.icon size={18} className="lined-icon" />
            </motion.button>
          ))}

          {/* 3D Settings Button */}
          <motion.button
            className="dock-btn"
            title="Settings"
            data-tip="[ L ]"
            onClick={onSettingsToggle}
            initial={{ opacity: 0, scale: 0.7, y: 4 }}
            animate={dockBooted ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.13 * (functionalTabs.length + 1) 
            }}
          >
            <svg viewBox="0 0 24 24" className="lined-icon">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OrbVisualization;

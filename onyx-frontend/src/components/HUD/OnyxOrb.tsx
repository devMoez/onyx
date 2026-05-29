import React, { useEffect, useRef } from 'react';

interface OnyxOrbProps {
  boot: number;
}

const OnyxOrb: React.FC<OnyxOrbProps> = ({ boot }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const tRef = useRef<number>(0);

  const W = 520, H = 520;
  const cx = W / 2, cy = H / 2;
  const S = 520 / 680;

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

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    tRef.current += 1;
    const t = tRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = boot;

    // Scan line
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.013);
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

    // Rings
    rings.forEach(ring => {
      const a = t * ring.speed * ring.dir;
      const { r, dash, width, alpha } = ring;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      ctx.beginPath(); ctx.arc(0, 0, r * boot, 0, Math.PI * 2);
      ctx.setLineDash(dash[1] === 0 ? [] : dash);
      ctx.strokeStyle = hex(alpha * Math.min(boot * 3, 1));
      ctx.lineWidth = width; ctx.stroke(); ctx.restore();

      if (ring.tickCount) {
        for (let i = 0; i < ring.tickCount; i++) {
          const ta = a + (i / ring.tickCount) * Math.PI * 2;
          const big = ring.labelEvery && i % ring.labelEvery === 0;
          ctx.save(); ctx.translate(cx, cy);
          ctx.beginPath();
          ctx.moveTo(Math.cos(ta) * (r - (big ? 9 : 4)), Math.sin(ta) * (r - (big ? 9 : 4)));
          ctx.lineTo(Math.cos(ta) * (r + 1), Math.sin(ta) * (r + 1));
          ctx.strokeStyle = hex(big ? alpha * 0.85 : alpha * 0.35);
          ctx.lineWidth = big ? 1.1 : 0.5; ctx.setLineDash([]); ctx.stroke();
          if (big && ring.labelEvery) {
            const lx = Math.cos(ta) * (r - 16), ly = Math.sin(ta) * (r - 16);
            ctx.fillStyle = hex(0.28); ctx.font = '7px Space Mono,Courier New';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(String(i).padStart(2, '0'), lx, ly);
          }
          ctx.restore();
        }
      }
    });

    // Arcs
    arcs.forEach(arc => {
      const ring = rings[arc.ring];
      const ba = t * ring.speed * ring.dir;
      ctx.save(); ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.arc(0, 0, ring.r, ba + arc.startA, ba + arc.startA + arc.span * boot);
      ctx.setLineDash([]);
      ctx.strokeStyle = hex(arc.alpha * Math.min(boot * 2, 1));
      ctx.lineWidth = arc.width; ctx.stroke();
      const ea = ba + arc.startA + arc.span * boot;
      ctx.beginPath();
      ctx.arc(Math.cos(ea) * ring.r, Math.sin(ea) * ring.r, arc.width * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = hex(arc.alpha * 0.9 * Math.min(boot * 2, 1)); ctx.fill();
      ctx.restore();
    });

    // Data Lines
    dataLines.forEach(d => {
      const angle = d.angle + t * d.speed;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + d.phase);
      const r1 = d.ring, r2 = r1 + d.len * pulse;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.strokeStyle = hex(d.alpha * pulse);
      ctx.lineWidth = 0.7; ctx.setLineDash([]); ctx.stroke();
    });

    // Voice Wave
    const bars = 28, innerR = rings[5].r - 6, outerMax = 16;
    const voiceAmp = 0.4 + 0.2 * Math.sin(t * 0.05);
    for (let i = 0; i < bars; i++) {
      const a = (i / bars) * Math.PI * 2;
      const h = (3 + Math.abs(Math.sin(i * 0.65 + t * 0.13))) * outerMax * voiceAmp;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
      ctx.lineTo(cx + Math.cos(a) * (innerR - h), cy + Math.sin(a) * (innerR - h));
      ctx.strokeStyle = grn(0.45 + voiceAmp * 0.35);
      ctx.lineWidth = 1.3; ctx.setLineDash([]); ctx.stroke();
    }

    // Core
    ctx.save();
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
      ctx.lineWidth = 0.8; ctx.stroke();
    });

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,210,255,0.7)'; ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(0,225,255,0.97)';
    ctx.font = '700 20px Space Mono,Courier New';
    ctx.letterSpacing = '8px';
    ctx.fillText('ONYX', cx + 4, cy);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(0,210,255,0.22)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx - 28, cy - 13); ctx.lineTo(cx + 28, cy - 13); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 28, cy + 13); ctx.lineTo(cx + 28, cy + 13); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy + 22, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,230,255,0.8)';
    ctx.shadowColor = 'rgba(0,210,255,1)'; ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    ctx.restore();
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [boot]);

  return <canvas ref={canvasRef} width={W} height={H} className="block" />;
};

export default OnyxOrb;

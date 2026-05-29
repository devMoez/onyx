import React, { useEffect, useRef } from 'react';

interface AudioWaveProps {
  isListening: boolean;
  isProcessing: boolean;
  alpha: number;
}

const AudioWave: React.FC<AudioWaveProps> = ({ isListening, isProcessing, alpha }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const tRef = useRef<number>(0);
  
  const waveAmpRef = useRef<number>(0);
  const waveTargetRef = useRef<number>(0.5);
  const waveColorTRef = useRef<number>(0);

  const WW = 260, WH = 40;
  const BARS = 38;
  const barW = 2.2;
  const gap = (WW - BARS * barW) / (BARS + 1);

  const IDLE_AMP = 0.08;
  const LISTEN_AMP_MIN = 0.3, LISTEN_AMP_RANGE = 0.85;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening) {
        waveTargetRef.current = LISTEN_AMP_MIN + Math.random() * LISTEN_AMP_RANGE;
      } else {
        waveTargetRef.current = IDLE_AMP + Math.random() * 0.06;
      }
    }, 700);
    return () => clearInterval(interval);
  }, [isListening]);

  const waveColor = (t01: number, alpha: number) => {
    const r = 0;
    const g = Math.round(225 + t01 * 30);
    const b = Math.round(255 - t01 * 70);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    tRef.current += 1;
    const t = tRef.current;

    // Smooth lerps
    waveAmpRef.current += (waveTargetRef.current - waveAmpRef.current) * 0.045;
    waveColorTRef.current += ((isProcessing ? 1 : 0) - waveColorTRef.current) * 0.04;

    const waveAmp = waveAmpRef.current;
    const waveColorT = waveColorTRef.current;

    ctx.clearRect(0, 0, WW, WH);
    ctx.globalAlpha = alpha;

    const centerY = WH / 2;
    const maxH = (WH / 2) - 3;

    for (let i = 0; i < BARS; i++) {
      const pos = i / (BARS - 1);
      const edge = Math.sin(pos * Math.PI);
      const wave1 = Math.abs(Math.sin(i * 0.48 + t * 0.09));
      const wave2 = Math.abs(Math.sin(i * 0.82 + t * 0.06 + 1.3));
      const h = ((wave1 * 0.6 + wave2 * 0.4) * edge * maxH * waveAmp * alpha) + 1.5;

      const x = gap + i * (barW + gap);
      const barAlpha = 0.35 + edge * 0.45 * waveAmp;

      const grad = ctx.createLinearGradient(0, centerY - h, 0, centerY + h);
      grad.addColorStop(0, waveColor(waveColorT, barAlpha * 0.4));
      grad.addColorStop(0.5, waveColor(waveColorT, barAlpha));
      grad.addColorStop(1, waveColor(waveColorT, barAlpha * 0.4));

      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, centerY - h, barW, h * 2, 1.5);
      } else {
        ctx.rect(x, centerY - h, barW, h * 2);
      }
      ctx.fillStyle = grad;
      ctx.fill();
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isListening, isProcessing, alpha]);

  return <canvas ref={canvasRef} width={WW} height={WH} className="block -mt-[6px]" />;
};

export default AudioWave;

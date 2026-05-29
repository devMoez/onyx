import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import ChatInterface from '@/components/Chat/ChatInterface';
import ArtifactViewer from '@/components/Artifacts/ArtifactViewer';
import AuthOverlay from '@/components/HUD/AuthOverlay';

export default function App() {
  const orbRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [status, setStatus] = useState('STANDBY');

  // Refs for animation loop to avoid dependency issues
  const stateRef = useRef({ isListening: false, isProcessing: false });
  const messages = useChatStore(state => state.messages);

  useEffect(() => {
    stateRef.current = { isListening, isProcessing };
  }, [isListening, isProcessing]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setIsProcessing(!!lastMessage.isStreaming);
    }
  }, [messages]);

  useEffect(() => {
    if(isProcessing) setStatus('PROCESSING');
    else setStatus(isListening ? 'LISTENING' : 'STANDBY');
  }, [isListening, isProcessing]);

  useEffect(() => {
    const orb = orbRef.current!;
    const ctx = orb.getContext('2d')!;
    const W = 520, H = 520;
    orb.width = W; orb.height = H;
    const cx = W/2, cy = H/2;
    const S = 520/680;

    let t = 0, boot = 0;
    const bootDuration = 120;
    let dockBooted = false;
    let speedMult = 1.0;

    const rings = [
      {r:148*S,speed:0.0018, dash:[14,7],width:0.7,alpha:0.5, dir:1, tickCount:60,labelEvery:10},
      {r:130*S,speed:-0.003, dash:[3,9], width:0.5,alpha:0.25,dir:-1,tickCount:0, labelEvery:0 },
      {r:114*S,speed:0.005,  dash:[1,0], width:1.1,alpha:0.65,dir:1, tickCount:48,labelEvery:8 },
      {r:98*S, speed:-0.007, dash:[5,5], width:0.5,alpha:0.3, dir:-1,tickCount:0, labelEvery:0 },
      {r:80*S, speed:0.011,  dash:[2,5], width:0.5,alpha:0.22,dir:1, tickCount:36,labelEvery:0 },
      {r:62*S, speed:-0.016, dash:[1,0], width:0.9,alpha:0.55,dir:-1,tickCount:0, labelEvery:0 },
    ];

    const arcs = [
      {ring:0,startA:0.2, span:1.2,width:2.2,alpha:0.85},
      {ring:0,startA:3.0, span:0.7,width:2.2,alpha:0.55},
      {ring:2,startA:0.6, span:2.0,width:2.8,alpha:0.95},
      {ring:2,startA:4.0, span:0.9,width:2.8,alpha:0.65},
      {ring:5,startA:1.2, span:2.6,width:2.0,alpha:0.8 },
    ];

    const dataLines = Array.from({length:10},(_,i)=>({
      angle:(i/10)*Math.PI*2,
      ring:(155+Math.random()*35)*S,
      len:14+Math.random()*28,
      alpha:0.12+Math.random()*0.22,
      speed:(Math.random()-0.5)*0.004,
      phase:Math.random()*Math.PI*2
    }));

    const hex = (a: any) => `rgba(0,210,255,${a})`;
    const grn = (a: any) => `rgba(0,255,185,${a})`;

    const waveC = waveRef.current!;
    const wctx  = waveC.getContext('2d')!;
    const WW = 260, WH = 40;
    waveC.width  = WW; waveC.height = WH;

    let waveAmp = 0, waveTarget = 0.5, waveColorT = 0;
    const IDLE_AMP = 0.08, LISTEN_AMP_MIN = 0.3, LISTEN_AMP_RANGE = 0.85;

    const waveInt = setInterval(() => {
      const { isListening } = stateRef.current;
      if(isListening) {
        waveTarget = LISTEN_AMP_MIN + Math.random() * LISTEN_AMP_RANGE;
      } else {
        waveTarget = IDLE_AMP + Math.random() * 0.06;
      }
    }, 700);

    function drawRing(ring: any, angle: any, p: any){
      const{r,dash,width,alpha}=ring;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
      ctx.beginPath();ctx.arc(0,0,r*p,0,Math.PI*2);
      ctx.setLineDash(dash[1]===0?[]:dash);
      ctx.strokeStyle=hex(alpha*Math.min(p*3,1));
      ctx.lineWidth=width;ctx.stroke();ctx.restore();
    }

    function drawTicks(ring: any, angle: any){
      if(!ring.tickCount)return;
      const{r,tickCount,labelEvery,alpha}=ring;
      for(let i=0;i<tickCount;i++){
        const a=angle+(i/tickCount)*Math.PI*2;
        const big=labelEvery&&i%labelEvery===0;
        ctx.save();ctx.translate(cx,cy);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*(r-(big?9:4)),Math.sin(a)*(r-(big?9:4)));
        ctx.lineTo(Math.cos(a)*(r+1),Math.sin(a)*(r+1));
        ctx.strokeStyle=hex(big?alpha*0.85:alpha*0.35);
        ctx.lineWidth=big?1.1:0.5;ctx.setLineDash([]);ctx.stroke();
        if(big&&labelEvery){
          const lx=Math.cos(a)*(r-16),ly=Math.sin(a)*(r-16);
          ctx.fillStyle=hex(0.28);ctx.font='7px Space Mono,Courier New';
          ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(String(i).padStart(2,'0'),lx,ly);
        }
        ctx.restore();
      }
    }

    function drawAudioWave(p: any){
      wctx.clearRect(0,0,WW,WH);
      const { isProcessing } = stateRef.current;
      
      waveAmp += (waveTarget - waveAmp) * 0.045;
      waveColorT += ((isProcessing ? 1 : 0) - waveColorT) * 0.04;

      const centerY = WH / 2;
      const maxH = (WH / 2) - 3;
      const BARS = 38, barW = 2.2, gap = (WW - BARS * barW) / (BARS + 1);

      for(let i = 0; i < BARS; i++){
        const pos = i / (BARS - 1);
        const edge = Math.sin(pos * Math.PI);
        const h = ((Math.abs(Math.sin(i*0.48+t*0.09))*0.6 + Math.abs(Math.sin(i*0.82+t*0.06+1.3))*0.4) * edge * maxH * waveAmp * p) + 1.5;
        const x = gap + i * (barW + gap);
        const alpha = 0.35 + edge * 0.45 * waveAmp;

        const grad = wctx.createLinearGradient(0, centerY-h, 0, centerY+h);
        const color = (t01: any, a: any) => `rgba(0, ${Math.round(225+t01*30)}, ${Math.round(255-t01*70)}, ${a})`;
        grad.addColorStop(0, color(waveColorT, alpha*0.4));
        grad.addColorStop(0.5, color(waveColorT, alpha));
        grad.addColorStop(1, color(waveColorT, alpha*0.4));

        wctx.beginPath();
        if((wctx as any).roundRect) (wctx as any).roundRect(x, centerY-h, barW, h*2, 1.5);
        else wctx.rect(x, centerY-h, barW, h*2);
        wctx.fillStyle = grad; wctx.fill();
      }
    }

    function bootDock() {
      if(dockBooted) return;
      dockBooted = true;
      const btns = document.querySelectorAll('.dock-btn') as NodeListOf<HTMLElement>;
      btns.forEach((btn, i) => {
        setTimeout(() => {
          btn.style.transition = 'opacity 320ms cubic-bezier(0.34,1.56,0.64,1), transform 320ms cubic-bezier(0.34,1.56,0.64,1), background 180ms ease, border-color 180ms ease, box-shadow 300ms ease';
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1) translateY(0)';
          btn.classList.add('boot-glow');
          setTimeout(() => btn.classList.remove('boot-glow'), 600);
        }, i * 130);
      });
    }

    let animationFrame: number;
    const frame = () => {
      boot = Math.min(1, boot + 1/bootDuration);
      ctx.clearRect(0,0,W,H);
      ctx.save(); ctx.globalAlpha = boot;
      
      // Scan
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*0.013);
      const or = rings[0].r;
      const sg = ctx.createLinearGradient(0,-or,0,0);
      sg.addColorStop(0,'rgba(0,210,255,0.0)'); sg.addColorStop(1,'rgba(0,210,255,0.06)');
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,or,-Math.PI/2-0.35,-Math.PI/2); ctx.closePath();
      ctx.fillStyle=sg; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-or); ctx.strokeStyle='rgba(0,210,255,0.35)';
      ctx.lineWidth=0.8; ctx.stroke(); ctx.restore();

      rings.forEach(ring => {
        const a = t * ring.speed * ring.dir;
        drawRing(ring, a, boot);
        drawTicks(ring, a);
      });

      arcs.forEach(arc => {
        const ring = rings[arc.ring];
        const ba = t * ring.speed * ring.dir;
        ctx.save(); ctx.translate(cx,cy); ctx.beginPath();
        ctx.arc(0,0,ring.r,ba+arc.startA,ba+arc.startA+arc.span*boot);
        ctx.strokeStyle=hex(arc.alpha*Math.min(boot*2,1)); ctx.lineWidth=arc.width; ctx.stroke();
        const ea = ba+arc.startA+arc.span*boot;
        ctx.beginPath(); ctx.arc(Math.cos(ea)*ring.r,Math.sin(ea)*ring.r,arc.width*1.6,0,Math.PI*2);
        ctx.fillStyle=hex(arc.alpha*0.9*Math.min(boot*2,1)); ctx.fill(); ctx.restore();
      });

      dataLines.forEach(d => {
        d.angle += d.speed;
        const pulse = 0.5 + 0.5 * Math.sin(t*0.04+d.phase);
        const r1=d.ring, r2=r1+d.len*pulse;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(d.angle)*r1,cy+Math.sin(d.angle)*r1);
        ctx.lineTo(cx+Math.cos(d.angle)*r2,cy+Math.sin(d.angle)*r2);
        ctx.strokeStyle=hex(d.alpha*pulse); ctx.lineWidth=0.7; ctx.stroke();
      });

      const bars=28, innerR=rings[5].r-6, outerMax=16, voiceAmp=0.4+0.2*Math.sin(t*0.05);
      for(let i=0;i<bars;i++){
        const a=(i/bars)*Math.PI*2;
        const h=(3+Math.abs(Math.sin(i*0.65+t*0.13)))*outerMax*voiceAmp;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*innerR,cy+Math.sin(a)*innerR);
        ctx.lineTo(cx+Math.cos(a)*(innerR-h),cy+Math.sin(a)*(innerR-h));
        ctx.strokeStyle=grn(0.45+voiceAmp*0.35); ctx.lineWidth=1.3; ctx.stroke();
      }

      ctx.save();
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,52);
      g.addColorStop(0,'rgba(0,210,255,0.13)'); g.addColorStop(0.5,'rgba(0,180,255,0.04)'); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(cx-60,cy-60,120,120);
      [0,90,180,270].forEach(deg=>{
        const a=(deg/180)*Math.PI;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*7,cy+Math.sin(a)*7);
        ctx.lineTo(cx+Math.cos(a)*18,cy+Math.sin(a)*18);
        ctx.strokeStyle='rgba(0,210,255,0.45)'; ctx.lineWidth=0.8; ctx.stroke();
      });
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.shadowColor='rgba(0,210,255,0.7)';ctx.shadowBlur=20;
      ctx.fillStyle='rgba(0,225,255,0.97)'; ctx.font='700 20px Space Mono,Courier New';
      if(ctx.hasOwnProperty('letterSpacing')) (ctx as any).letterSpacing = '8px';
      ctx.fillText('ONYX',cx+4,cy); ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(0,210,255,0.22)'; ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(cx-28,cy-13);ctx.lineTo(cx+28,cy-13);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-28,cy+13);ctx.lineTo(cx+28,cy+13);ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy+22,2,0,Math.PI*2); ctx.fillStyle='rgba(0,230,255,0.8)';
      ctx.shadowColor='rgba(0,210,255,1)';ctx.shadowBlur=8; ctx.fill(); ctx.restore();

      ctx.restore();

      const waveP = Math.max(0, Math.min(1, (boot - 0.4) / 0.6));
      drawAudioWave(waveP);

      if(boot >= 0.70) bootDock();

      const targetSpeed = stateRef.current.isProcessing ? 2.5 : 1.0;
      speedMult += (targetSpeed - speedMult) * 0.03;
      t += speedMult;
      
      animationFrame = requestAnimationFrame(frame);
    };
    
    animationFrame = requestAnimationFrame(frame);

    return () => {
      clearInterval(waveInt);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleMicToggle = () => {
    setIsListening(prev => {
      const next = !prev;
      if(next) setShowChat(true);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if(key === 'v') handleMicToggle();
      else if(key === 'a') setShowArtifacts(p => !p);
      else if(key === 's') setShowChat(p => !p);
      else if(key === 'l') setShowAuth(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="wrapper">
      <canvas ref={orbRef} id="orb"></canvas>
      <canvas ref={waveRef} id="wave" style={{ marginTop: '-6px' }}></canvas>

      <div className={`status-line ${isProcessing ? 'processing' : ''}`} id="statusLine">
        <span id="statusText">{status}</span>
        <span className="status-cursor"></span>
      </div>

      <div className="dock">
        <button className={`dock-btn ${isListening ? 'active' : ''}`} onClick={handleMicToggle} title="Live Camera" data-tip="[ V ]">
          {isListening && <span className="live-dot"></span>}
          <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        </button>
        <button className={`dock-btn ${showArtifacts ? 'active' : ''}`} onClick={() => setShowArtifacts(!showArtifacts)} title="Artifact" data-tip="[ A ]">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        </button>
        <button className={`dock-btn ${showChat ? 'active' : ''}`} onClick={() => setShowChat(!showChat)} title="Screen Share" data-tip="[ S ]">
          <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        </button>
        <button className={`dock-btn ${showAuth ? 'active' : ''}`} onClick={() => setShowAuth(!showAuth)} title="Setup LLM" data-tip="[ L ]">
          <svg viewBox="0 0 24 24" className="fill-none stroke-current">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </button>
      </div>

      {/* OVERLAYS */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-10">
          <div className="relative w-full max-w-md bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-[110] text-xl">✕</button>
            <div className="p-8"><AuthOverlay /></div>
          </div>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-10">
          <div className="relative w-full max-w-2xl h-[80vh] bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <button onClick={() => setShowChat(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-[110] text-xl">✕</button>
            <div className="flex-1 p-6 overflow-hidden"><ChatInterface /></div>
          </div>
        </div>
      )}

      {showArtifacts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-10">
          <div className="relative w-full max-w-5xl h-[85vh] bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <button onClick={() => setShowArtifacts(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-[110] text-xl">✕</button>
            <div className="flex-1 p-6 overflow-hidden"><ArtifactViewer /></div>
          </div>
        </div>
      )}
    </div>
  );
}

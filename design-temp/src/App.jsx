import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#0c0c0e",
  surface: "#111115",
  panel:   "#16161c",
  border:  "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.13)",
  accent:  "#7c6fff",
  accent2: "#a78bfa",
  green:   "#34d399",
  amber:   "#fbbf24",
  red:     "#f87171",
  text1:   "#ededf0",
  text2:   "#8888a0",
  text3:   "#44445a",
};

// ─── Spring configs (from Framer Motion skill) ────────────────────────────────
const spring = { type: "spring", stiffness: 320, damping: 28 };
const springFast = { type: "spring", stiffness: 400, damping: 30 };
const springSlug = { type: "spring", stiffness: 180, damping: 22 };

// ─── Panel definitions ────────────────────────────────────────────────────────
const PANELS = [
  {
    id: "terminal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
    label: "Terminal",
    color: T.green,
    defaultSize: { w: 520, h: 320 },
    defaultPos: { x: 200, y: 120 },
  },
  {
    id: "camera",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    label: "Camera",
    color: T.accent,
    defaultSize: { w: 420, h: 280 },
    defaultPos: { x: 320, y: 180 },
  },
  {
    id: "screen",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    label: "Screen",
    color: T.amber,
    defaultSize: { w: 560, h: 360 },
    defaultPos: { x: 150, y: 100 },
  },
  {
    id: "logs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    label: "Logs",
    color: T.text2,
    defaultSize: { w: 400, h: 280 },
    defaultPos: { x: 740, y: 140 },
  },
  {
    id: "appview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    label: "App View",
    color: T.accent2,
    defaultSize: { w: 500, h: 360 },
    defaultPos: { x: 260, y: 100 },
  },
];

// ─── Panel content components ─────────────────────────────────────────────────
function TerminalContent() {
  const lines = [
    { t: 200,  txt: "$ onyx --init",           col: T.text1 },
    { t: 600,  txt: "> Booting neural core…",   col: T.text2 },
    { t: 1000, txt: "> Memory loaded: 1,284 ctx", col: T.text2 },
    { t: 1400, txt: "> All systems nominal ✓",  col: T.green },
    { t: 1800, txt: "$ _",                       col: T.accent, blink: true },
  ];
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    lines.forEach((l, i) => {
      setTimeout(() => setVisible(i + 1), l.t);
    });
  }, []);
  return (
    <div style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.8, height: "100%" }}>
      {lines.slice(0, visible).map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}
          style={{ color: l.col, display: "flex", alignItems: "center", gap: 0 }}>
          {l.txt}
          {l.blink && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ display: "inline-block", width: 7, height: 14, background: T.accent, marginLeft: 2, borderRadius: 1 }} />}
        </motion.div>
      ))}
    </div>
  );
}

function CameraContent() {
  const [beat, setBeat] = useState(false);
  useEffect(() => { const id = setInterval(() => setBeat(b => !b), 1200); return () => clearInterval(id); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a10", gap: 12, position: "relative" }}>
      <div style={{ position: "absolute", top: 10, right: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <motion.div animate={{ opacity: beat ? 1 : 0.3 }} transition={{ duration: 0.3 }} style={{ width: 7, height: 7, borderRadius: "50%", background: T.red }} />
        <span style={{ fontFamily: "monospace", fontSize: 10, color: T.text2 }}>LIVE</span>
      </div>
      <div style={{ width: 80, height: 80, borderRadius: "50%", border: `1.5px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ scale: beat ? 1.08 : 1 }} transition={spring}
          style={{ width: 48, height: 48, borderRadius: "50%", background: `${T.accent}22`, border: `1px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5"><circle cx="12" cy="10" r="4"/><path d="M6 21v-1a6 6 0 0112 0v1"/></svg>
        </motion.div>
      </div>
      <span style={{ fontSize: 11, color: T.text2, fontFamily: "monospace" }}>Waiting for feed…</span>
    </div>
  );
}

function ScreenContent() {
  return (
    <div style={{ height: "100%", background: "#0e0e14", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 28, background: "#1a1a22", borderBottom: `0.5px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 10px", gap: 8 }}>
        {["#f87171","#fbbf24","#34d399"].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
        <div style={{ flex: 1, background: "#111118", borderRadius: 4, height: 16, margin: "0 8px", display: "flex", alignItems: "center", padding: "0 8px" }}>
          <span style={{ fontSize: 10, color: T.text3, fontFamily: "monospace" }}>onyx://controlled-view</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        <span style={{ fontSize: 11, color: T.text3, fontFamily: "monospace" }}>No app selected</span>
      </div>
    </div>
  );
}

function LogsContent() {
  const entries = [
    { t: "09:41:22", msg: "Session started", level: "info" },
    { t: "09:41:23", msg: "Memory context loaded (1,284 entries)", level: "info" },
    { t: "09:41:25", msg: "Web search tool: active", level: "ok" },
    { t: "09:41:28", msg: "Code runner: sandboxed", level: "ok" },
    { t: "09:41:30", msg: "Voice input: listening…", level: "warn" },
  ];
  const col = { info: T.text2, ok: T.green, warn: T.amber, err: T.red };
  return (
    <div style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.9, height: "100%", overflowY: "auto" }}>
      {entries.map((e, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
          style={{ display: "flex", gap: 12, color: col[e.level] }}>
          <span style={{ color: T.text3, minWidth: 60 }}>{e.t}</span>
          <span>{e.msg}</span>
        </motion.div>
      ))}
    </div>
  );
}

function AppViewContent() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, border: `1px dashed ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
      </div>
      <span style={{ fontSize: 12, color: T.text3, fontFamily: "monospace" }}>ONYX controls an app here</span>
    </div>
  );
}

const PANEL_CONTENT = { terminal: TerminalContent, camera: CameraContent, screen: ScreenContent, logs: LogsContent, appview: AppViewContent };

// ─── Floating Panel ───────────────────────────────────────────────────────────
function FloatingPanel({ panel, onClose, zIndex, onFocus }) {
  const shouldReduce = useReducedMotion();
  const [pos, setPos] = useState(panel.defaultPos);
  const [size] = useState(panel.defaultSize);
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const Content = PANEL_CONTENT[panel.id];

  const onMouseDown = useCallback((e) => {
    if (e.target.closest("[data-no-drag]")) return;
    onFocus();
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  }, [pos, onFocus]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        x: dragStart.current.px + e.clientX - dragStart.current.mx,
        y: dragStart.current.py + e.clientY - dragStart.current.my,
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <motion.div
      key={panel.id}
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 10 }}
      transition={spring}
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: size.w, height: size.h,
        zIndex,
        background: T.panel,
        border: `0.5px solid ${T.border2}`,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        willChange: "transform, opacity",
        boxShadow: `0 24px 64px rgba(0,0,0,0.5)`,
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          height: 38,
          background: T.surface,
          borderBottom: `0.5px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 8,
          cursor: "grab",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        <div style={{ color: panel.color, display: "flex", opacity: 0.85 }}>{panel.icon}</div>
        <span style={{ fontSize: 12, fontWeight: 500, color: T.text1, fontFamily: "'Geist', sans-serif", letterSpacing: "0.01em" }}>{panel.label}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }} data-no-drag>
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            transition={springFast}
            onClick={onClose}
            aria-label={`Close ${panel.label} panel`}
            style={{ width: 18, height: 18, borderRadius: "50%", background: "#f8717133", border: `0.5px solid #f8717155`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke={T.red} strokeWidth="1.5"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
          </motion.button>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Content />
      </div>
    </motion.div>
  );
}

// ─── Animated greeting text ───────────────────────────────────────────────────
function TypewriterText({ text, delay = 0, color = T.text1, size = 14 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setTimeout(() => {
      const tick = setInterval(() => {
        i++;
        setShown(i);
        if (i >= text.length) clearInterval(tick);
      }, 28);
      return () => clearInterval(tick);
    }, delay);
    return () => clearTimeout(id);
  }, [text, delay]);
  return <span style={{ color, fontSize: size, fontFamily: "monospace" }}>{text.slice(0, shown)}</span>;
}

// ─── Voice orb ────────────────────────────────────────────────────────────────
function VoiceOrb({ active }) {
  return (
    <div style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {active && (
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ position: "absolute", width: 36, height: 36, borderRadius: "50%", background: T.accent, willChange: "transform, opacity" }}
        />
      )}
      <motion.div
        animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ repeat: active ? Infinity : 0, duration: 1.2 }}
        style={{ width: 28, height: 28, borderRadius: "50%", background: active ? T.accent : T.surface, border: `0.5px solid ${active ? T.accent : T.border2}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : T.text2} strokeWidth="2" strokeLinecap="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </motion.div>
    </div>
  );
}

// ─── Dock icon ────────────────────────────────────────────────────────────────
function DockIcon({ panel, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", bottom: "100%", marginBottom: 8,
              background: T.surface, border: `0.5px solid ${T.border2}`,
              borderRadius: 6, padding: "4px 10px",
              fontSize: 11, color: T.text1, whiteSpace: "nowrap",
              fontFamily: "'Geist', sans-serif", pointerEvents: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {panel.label}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.18, y: -3 }}
        whileTap={{ scale: 0.92 }}
        transition={springFast}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`${active ? "Close" : "Open"} ${panel.label}`}
        style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: active ? `${panel.color}18` : T.surface,
          border: `0.5px solid ${active ? panel.color + "55" : T.border}`,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: active ? panel.color : T.text2,
          position: "relative",
          willChange: "transform",
        }}
      >
        {panel.icon}
        {active && (
          <motion.div
            layoutId={`dot-${panel.id}`}
            style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%", background: panel.color }}
          />
        )}
      </motion.button>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springSlug}
      style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 14px", background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: 10 }}
    >
      <span style={{ fontSize: 10, color: T.text3, fontFamily: "monospace", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: color || T.text1, fontFamily: "monospace", letterSpacing: "0.04em" }}>{value}</span>
    </motion.div>
  );
}

// ─── Quick action chip ────────────────────────────────────────────────────────
function QuickChip({ icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, borderColor: T.border2 }}
      whileTap={{ scale: 0.97 }}
      transition={springFast}
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 16px",
        background: T.surface, border: `0.5px solid ${T.border}`,
        borderRadius: 10, cursor: "pointer",
        fontSize: 13, color: T.text2,
        fontFamily: "'Geist', sans-serif",
        whiteSpace: "nowrap",
        willChange: "transform",
      }}
    >
      <span style={{ color: T.accent, display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </motion.button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function OnyxApp() {
  const shouldReduce = useReducedMotion();
  const [openPanels, setOpenPanels] = useState([]);
  const [zOrders, setZOrders] = useState({});
  const [zTop, setZTop] = useState(10);
  const [voiceActive, setVoiceActive] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "ai", text: "Good morning, Vanu. All systems nominal. Memory loaded. What shall we do today?" },
  ]);
  const [typing, setTyping] = useState(false);
  const chatEnd = useRef(null);

  const togglePanel = useCallback((panelId) => {
    setOpenPanels(prev => {
      if (prev.includes(panelId)) return prev.filter(id => id !== panelId);
      const newZ = zTop + 1;
      setZTop(newZ);
      setZOrders(o => ({ ...o, [panelId]: newZ }));
      return [...prev, panelId];
    });
  }, [zTop]);

  const focusPanel = useCallback((panelId) => {
    setZTop(z => {
      const newZ = z + 1;
      setZOrders(o => ({ ...o, [panelId]: newZ }));
      return newZ;
    });
  }, []);

  const sendMessage = useCallback(() => {
    const txt = inputVal.trim();
    if (!txt) return;
    const userMsg = { id: Date.now(), role: "user", text: txt };
    setMessages(m => [...m, userMsg]);
    setInputVal("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, {
        id: Date.now() + 1, role: "ai",
        text: "Understood. Let me work on that for you.",
      }]);
    }, 1400);
  }, [inputVal]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: spring },
  };

  return (
    <div style={{
      width: "100%", height: "100vh", minHeight: 600,
      background: T.bg, color: T.text1,
      fontFamily: "'Geist', 'Inter', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
      userSelect: "none",
    }}>

      {/* ── Ambient grid bg ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        opacity: 0.5,
      }} />

      {/* ── Topbar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring}
        style={{
          height: 48, background: T.surface,
          borderBottom: `0.5px solid ${T.border}`,
          display: "flex", alignItems: "center",
          padding: "0 20px", gap: 14, zIndex: 100, flexShrink: 0,
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 22 22" width="22" height="22">
              <polygon points="11,1 20,6 20,16 11,21 2,16 2,6" fill="none" stroke={T.accent} strokeWidth="0.8" />
              <polygon points="11,5 17,8.5 17,13.5 11,17 5,13.5 5,8.5" fill={`${T.accent}18`} stroke={`${T.accent}44`} strokeWidth="0.6" />
              <circle cx="11" cy="11" r="3" fill={T.accent} opacity="0.85" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: T.text1 }}>ONYX</span>
        </div>

        <div style={{ width: 1, height: 18, background: T.border2 }} />

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: T.green }} />
          <span style={{ fontSize: 11, color: T.text2, fontFamily: "monospace" }}>online</span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: T.text3, fontFamily: "monospace" }}>⌘+Space</span>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} transition={springFast}
            onClick={() => setVoiceActive(v => !v)}
            aria-label="Toggle voice input"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <VoiceOrb active={voiceActive} />
          </motion.button>
        </div>
      </motion.div>

      {/* ── Main canvas ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* ── Left: Chat area ── */}
        <div style={{ width: 420, display: "flex", flexDirection: "column", borderRight: `0.5px solid ${T.border}`, flexShrink: 0 }}>

          {/* Greeting / stats */}
          <motion.div
            variants={containerVariants} initial="hidden" animate="visible"
            style={{ padding: "28px 24px 20px", borderBottom: `0.5px solid ${T.border}` }}
          >
            <motion.div variants={itemVariants} style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T.text3, fontFamily: "monospace", letterSpacing: "0.12em" }}>
                <TypewriterText text="// GOOD MORNING, VANU" delay={200} color={T.text3} size={11} />
              </span>
            </motion.div>
            <motion.h1 variants={itemVariants} style={{ fontSize: 26, fontWeight: 600, color: T.text1, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              How can I help?
            </motion.h1>
            <motion.p variants={itemVariants} style={{ fontSize: 13, color: T.text2, margin: "0 0 20px", lineHeight: 1.5 }}>
              Memory loaded · All modules ready
            </motion.p>
            <motion.div variants={itemVariants} style={{ display: "flex", gap: 8 }}>
              <StatChip label="UPTIME" value="99.8%" color={T.green} />
              <StatChip label="LATENCY" value="2.4ms" color={T.accent} />
              <StatChip label="MEMORY" value="1,284" color={T.text1} />
            </motion.div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ padding: "14px 16px", borderBottom: `0.5px solid ${T.border}`, display: "flex", gap: 7, flexWrap: "wrap" }}
          >
            {[
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                label: "Run command",
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
                label: "Search web",
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                label: "Analyze file",
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                label: "Remember this",
              },
            ].map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.06, ...spring }}>
                <QuickChip icon={a.icon} label={a.label} onClick={() => setInputVal(a.label + ": ")} />
              </motion.div>
            ))}
          </motion.div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: msg.role === "ai" ? `${T.accent}22` : `${T.text2}22`,
                    border: `0.5px solid ${msg.role === "ai" ? T.accent + "44" : T.border2}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontFamily: "monospace", color: msg.role === "ai" ? T.accent : T.text2,
                    marginTop: 2,
                  }}>
                    {msg.role === "ai" ? "◈" : "V"}
                  </div>
                  <div style={{
                    maxWidth: "78%", padding: "9px 13px",
                    background: msg.role === "ai" ? T.panel : `${T.accent}14`,
                    border: `0.5px solid ${msg.role === "ai" ? T.border : T.accent + "30"}`,
                    borderRadius: msg.role === "ai" ? "2px 10px 10px 10px" : "10px 2px 10px 10px",
                    fontSize: 13, color: T.text1, lineHeight: 1.6,
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}
                  style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${T.accent}22`, border: `0.5px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.accent }}>◈</div>
                  <div style={{ padding: "10px 14px", background: T.panel, border: `0.5px solid ${T.border}`, borderRadius: "2px 10px 10px 10px", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px 14px", borderTop: `0.5px solid ${T.border}`, background: T.surface }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: T.panel, border: `0.5px solid ${T.border2}`, borderRadius: 10, padding: "8px 10px 8px 14px" }}>
              <textarea
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder="Command ONYX…"
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: T.text1, fontSize: 13, fontFamily: "'Geist', sans-serif",
                  resize: "none", lineHeight: 1.5,
                }}
              />
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={springFast}
                onClick={sendMessage}
                aria-label="Send message"
                style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </motion.button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 2px 0", fontSize: 10, color: T.text3, fontFamily: "monospace" }}>
              <span>end-to-end encrypted</span>
              <span>{inputVal.length} / 8192</span>
            </div>
          </div>
        </div>

        {/* ── Right: Floating panel workspace ── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Empty state */}
          <AnimatePresence>
            {openPanels.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="0.8">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
                <span style={{ fontSize: 12, color: T.text3, fontFamily: "monospace", letterSpacing: "0.06em" }}>Open a panel from the dock below</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating panels */}
          <AnimatePresence>
            {openPanels.map(panelId => {
              const panel = PANELS.find(p => p.id === panelId);
              return (
                <FloatingPanel
                  key={panelId}
                  panel={panel}
                  zIndex={zOrders[panelId] || 10}
                  onClose={() => togglePanel(panelId)}
                  onFocus={() => focusPanel(panelId)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom dock ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...spring }}
        style={{
          height: 64, background: T.surface,
          borderTop: `0.5px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, padding: "0 24px", zIndex: 100, flexShrink: 0,
        }}
      >
        {PANELS.map((panel, i) => (
          <motion.div key={panel.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05, ...spring }}>
            <DockIcon
              panel={panel}
              active={openPanels.includes(panel.id)}
              onClick={() => togglePanel(panel.id)}
            />
          </motion.div>
        ))}

        <div style={{ width: 1, height: 24, background: T.border2, margin: "0 4px" }} />

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} transition={springFast}
          aria-label="Settings"
          style={{ width: 44, height: 44, borderRadius: 12, background: T.surface, border: `0.5px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.text3 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </motion.button>
      </motion.div>

      {/* Load Geist font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        textarea::placeholder { color: #44445a; }
        textarea { scrollbar-width: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}

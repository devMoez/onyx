import React from 'react';

interface DockProps {
  isListening: boolean;
  onMicToggle: () => void;
  onArtifactToggle: () => void;
  onScreenToggle: () => void;
  booted: boolean;
}

const Dock: React.FC<DockProps> = ({ isListening, onMicToggle, onArtifactToggle, onScreenToggle, booted }) => {
  const buttons = [
    { id: 'btnMic', title: 'Live Camera', tip: '[ V ]', icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[rgba(165,178,192,0.7)] fill-none stroke-[1.5] stroke-round linejoin-round transition-stroke duration-180 ease">
        <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ), action: onMicToggle, active: isListening, showLive: isListening },
    { id: 'btnArtifact', title: 'Artifact', tip: '[ A ]', icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[rgba(165,178,192,0.7)] fill-none stroke-[1.5] stroke-round linejoin-round transition-stroke duration-180 ease">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ), action: onArtifactToggle },
    { id: 'btnScreen', title: 'Screen Share', tip: '[ S ]', icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[rgba(165,178,192,0.7)] fill-none stroke-[1.5] stroke-round linejoin-round transition-stroke duration-180 ease">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
    ), action: onScreenToggle },
  ];

  return (
    <div className="mt-3 flex items-center gap-[10px] px-3 py-2 bg-transparent border-none">
      {buttons.map((btn, i) => (
        <button
          key={btn.id}
          onClick={btn.action}
          title={btn.title}
          data-tip={btn.tip}
          className={`
            relative w-11 h-11 rounded-xl border border-[rgba(160,175,190,0.13)] bg-[rgba(160,175,190,0.04)]
            flex items-center justify-center cursor-pointer transition-all duration-180 ease
            hover:bg-[rgba(160,175,190,0.09)] hover:border-[rgba(160,175,190,0.28)] hover:-translate-y-0.5 hover:scale-100
            active:translate-y-0 active:scale-95
            group
            ${btn.active ? 'bg-[rgba(160,175,190,0.11)] border-[rgba(165,178,192,0.32)]' : ''}
            ${booted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.7] translate-y-1'}
          `}
          style={{
            transitionDelay: booted ? `${i * 130}ms` : '0ms',
            transitionProperty: 'opacity, transform, background, border-color, box-shadow',
            transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)'
          }}
        >
          {btn.icon}
          {btn.showLive && <span className="absolute top-[7px] right-[7px] w-[5px] h-[5px] rounded-full bg-[#e03] shadow-[0_0_5px_rgba(238,0,51,0.7)] animate-blink" />}
          {btn.active && <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[rgba(195,210,225,0.85)]" />}
          
          {/* Tooltip */}
          <span className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-1 font-mono text-[8px] tracking-[0.12em] text-[rgba(160,175,190,0.75)] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-160 ease">
            {btn.tip}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Dock;

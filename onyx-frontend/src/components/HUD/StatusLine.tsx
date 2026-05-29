import React from 'react';

interface StatusLineProps {
  status: 'standby' | 'listening' | 'processing';
}

const StatusLine: React.FC<StatusLineProps> = ({ status }) => {
  const labels = {
    standby: 'STANDBY',
    listening: 'LISTENING',
    processing: 'PROCESSING',
  };

  return (
    <div className={`mt-[10px] h-4 flex items-center gap-1.5 text-[9px] tracking-[0.18em] uppercase select-none transition-colors duration-600 ease ${status === 'processing' ? 'text-[rgba(0,255,185,0.65)]' : 'text-[rgba(0,210,255,0.5)]'}`}>
      <span>{labels[status]}</span>
      <span className={`inline-block w-[5px] h-2.5 transition-colors duration-600 ease animate-cursorBlink align-middle ${status === 'processing' ? 'bg-[rgba(0,255,185,0.65)]' : 'bg-[rgba(0,210,255,0.5)]'}`} />
    </div>
  );
};

export default StatusLine;

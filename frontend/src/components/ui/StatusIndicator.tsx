import React from 'react';

export interface StatusIndicatorProps {
  status: 'online' | 'tracking' | 'idle' | 'warning' | 'offline' | 'error';
  label: string;
  sublabel?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  className = '',
}) => {
  const dotColor = {
    online: 'bg-[#62F5AD]',
    tracking: 'bg-[#62F5AD]',
    idle: 'bg-[#BDA5FF]',
    warning: 'bg-[#D9FF55]',
    offline: 'bg-[#737373]',
    error: 'bg-[#FF5555]',
  }[status];

  const pulse = status === 'tracking' || status === 'online';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border-[2px] border-[#111111] rounded-full shadow-neo-sm ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border-[1px] border-[#111111] ${dotColor}`} />
      </span>
      <span className="font-display font-bold text-xs uppercase text-[#111111] tracking-wider">
        {label}
      </span>
      {sublabel && (
        <span className="text-[11px] font-mono text-[#737373] border-l-[1.5px] border-[#111111]/30 pl-2">
          {sublabel}
        </span>
      )}
    </div>
  );
};

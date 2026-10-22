import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'mint' | 'lime' | 'lavender' | 'ink' | 'white' | 'danger';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'mint',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    mint: 'bg-[#62F5AD] text-[#111111]',
    lime: 'bg-[#D9FF55] text-[#111111]',
    lavender: 'bg-[#BDA5FF] text-[#111111]',
    ink: 'bg-[#111111] text-[#FFFFFF]',
    white: 'bg-[#FFFFFF] text-[#111111]',
    danger: 'bg-[#FF5555] text-[#FFFFFF]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 font-display font-extrabold text-xs uppercase tracking-wider border-[2px] border-[#111111] rounded-full shadow-neo-sm ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

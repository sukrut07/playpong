import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'cream' | 'mint' | 'lime' | 'lavender';
  interactive?: boolean;
  borderWidth?: 2 | 3;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'white',
  interactive = false,
  borderWidth = 2,
  className = '',
  children,
  ...props
}) => {
  const bgStyles = {
    white: 'bg-[#FFFFFF]',
    cream: 'bg-[#FFFDF6]',
    mint: 'bg-[#62F5AD]',
    lime: 'bg-[#D9FF55]',
    lavender: 'bg-[#BDA5FF]',
  }[variant];

  const borderClass = borderWidth === 3 ? 'border-[3px]' : 'border-[2px]';
  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg transition-all duration-150'
    : '';

  return (
    <div
      className={`rounded-2xl border-[#111111] shadow-neo p-6 ${bgStyles} ${borderClass} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

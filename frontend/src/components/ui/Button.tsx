import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'mint' | 'lime' | 'lavender' | 'white' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'mint',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    mint: 'bg-[#62F5AD] hover:bg-[#4ee69e] text-[#111111]',
    lime: 'bg-[#D9FF55] hover:bg-[#c9f53d] text-[#111111]',
    lavender: 'bg-[#BDA5FF] hover:bg-[#ad91ff] text-[#111111]',
    white: 'bg-[#FFFFFF] hover:bg-[#F5F5F5] text-[#111111]',
    ink: 'bg-[#111111] hover:bg-[#242424] text-[#FFFFFF]',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 border-[2px]',
    md: 'text-sm px-4 py-2.5 border-[2px]',
    lg: 'text-base px-6 py-3.5 border-[3px]',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide border-[#111111] rounded-xl shadow-neo transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

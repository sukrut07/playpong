import React from 'react';

export interface PageHeaderProps {
  badge?: string;
  badgeVariant?: 'mint' | 'lime' | 'lavender';
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeVariant = 'mint',
  title,
  description,
  children,
}) => {
  const badgeColor = {
    mint: 'bg-[#62F5AD]',
    lime: 'bg-[#D9FF55]',
    lavender: 'bg-[#BDA5FF]',
  }[badgeVariant];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b-[3px] border-[#111111]">
      <div className="space-y-2">
        {badge && (
          <span className={`inline-block px-3 py-0.5 font-display font-extrabold text-xs uppercase tracking-wider border-[2px] border-[#111111] rounded-full shadow-neo-sm ${badgeColor}`}>
            {badge}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-[#111111]">
          {title}
        </h1>
        {description && (
          <p className="text-base text-[#404040] max-w-2xl font-medium">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
};

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => (
  <div className="flex items-start justify-between mb-8 gap-4">
    <div className="min-w-0">
      <h1 className="text-[28px] font-semibold leading-tight" style={{ color: 'var(--cs-text-primary)' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm mt-1" style={{ color: 'var(--cs-text-secondary)' }}>{subtitle}</p>
      )}
    </div>
    {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
  </div>
);

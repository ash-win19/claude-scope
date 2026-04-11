import React from 'react';

interface CSMonoLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const CSMonoLabel: React.FC<CSMonoLabelProps> = ({ children, className = '' }) => (
  <span
    className={`font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${className}`}
    style={{ color: 'var(--cs-text-muted)' }}
  >
    {children}
  </span>
);

import React from 'react';

interface CSBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<string, { bg: string; color: string }> = {
  default: { bg: 'var(--cs-bg-overlay)', color: 'var(--cs-text-secondary)' },
  success: { bg: 'var(--cs-success-muted)', color: 'var(--cs-success)' },
  warning: { bg: 'var(--cs-warning-muted)', color: 'var(--cs-warning)' },
  danger: { bg: 'var(--cs-danger-muted)', color: 'var(--cs-danger)' },
  info: { bg: 'var(--cs-info-muted)', color: 'var(--cs-info)' },
  accent: { bg: 'var(--cs-accent-muted)', color: 'var(--cs-accent)' },
};

export const CSBadge: React.FC<CSBadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const v = variantMap[variant];
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] font-medium uppercase tracking-[0.08em] rounded-full px-2 py-0.5 ${className}`}
      style={{ backgroundColor: v.bg, color: v.color }}
    >
      {children}
    </span>
  );
};

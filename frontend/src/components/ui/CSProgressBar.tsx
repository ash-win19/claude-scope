import React from 'react';

interface CSProgressBarProps {
  value?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

export const CSProgressBar: React.FC<CSProgressBarProps> = ({
  value,
  color = 'var(--cs-accent)',
  animated = false,
  className = '',
}) => (
  <div
    className={`relative h-[3px] w-full rounded-full overflow-hidden ${className}`}
    style={{ backgroundColor: 'var(--cs-bg-overlay)' }}
  >
    {animated ? (
      <div
        className="absolute inset-0 h-full w-1/4 rounded-full"
        style={{
          backgroundColor: color,
          animation: 'cs-progress-indeterminate 1.5s ease-in-out infinite',
        }}
      />
    ) : (
      <div
        className="h-full rounded-full transition-all duration-400 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value ?? 0))}%`,
          backgroundColor: color,
        }}
      />
    )}
  </div>
);

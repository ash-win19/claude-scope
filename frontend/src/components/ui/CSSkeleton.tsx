import React from 'react';

interface CSSkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}

export const CSSkeleton: React.FC<CSSkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = 8,
  className = '',
}) => (
  <div
    className={`animate-cs-shimmer ${className}`}
    style={{
      width,
      height,
      borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
      backgroundColor: 'var(--cs-bg-overlay)',
    }}
  />
);

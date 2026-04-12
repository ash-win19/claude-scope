import React from 'react';
import { CSSkeleton } from './CSSkeleton';

interface CSCardSkeletonProps {
  lines?: number;
  className?: string;
}

export const CSCardSkeleton: React.FC<CSCardSkeletonProps> = ({ lines = 3, className = '' }) => (
  <div
    className={`rounded-xl border p-4 ${className}`}
    style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-surface)' }}
  >
    <CSSkeleton width={120} height={12} className="mb-3" />
    {Array.from({ length: lines }, (_, i) => (
      <CSSkeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={14} className="mb-2" />
    ))}
  </div>
);

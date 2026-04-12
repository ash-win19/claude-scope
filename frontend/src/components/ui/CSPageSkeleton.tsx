import React from 'react';
import { CSSkeleton } from './CSSkeleton';

interface CSPageSkeletonProps {
  rows?: number;
  showStats?: boolean;
}

export const CSPageSkeleton: React.FC<CSPageSkeletonProps> = ({ rows = 3, showStats = false }) => (
  <div className="animate-cs-fade-in">
    <div className="flex items-center justify-between mb-8">
      <CSSkeleton width={200} height={32} />
      <CSSkeleton width={120} height={36} radius={8} />
    </div>
    {showStats && (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border p-4" style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-surface)' }}>
            <CSSkeleton width={80} height={12} className="mb-2" />
            <CSSkeleton width={50} height={28} />
          </div>
        ))}
      </div>
    )}
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <CSSkeleton key={i} height={64} radius={12} />
      ))}
    </div>
  </div>
);

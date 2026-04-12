import React from 'react';
import { CSSkeleton } from './CSSkeleton';

interface CSListSkeletonProps {
  rows?: number;
  rowHeight?: number;
}

export const CSListSkeleton: React.FC<CSListSkeletonProps> = ({ rows = 5, rowHeight = 64 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: rows }, (_, i) => (
      <CSSkeleton key={i} height={rowHeight} radius={12} />
    ))}
  </div>
);

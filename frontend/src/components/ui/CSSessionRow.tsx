import React from 'react';
import { CSBadge } from './CSBadge';
import { ArrowRight } from 'lucide-react';

interface CSSessionRowProps {
  title: string;
  duration: string;
  frameCount: number;
  timestamp: string;
  status: 'processing' | 'complete' | 'error';
  thumbnailUrl?: string;
  onClick?: () => void;
}

const statusVariant: Record<string, 'warning' | 'success' | 'danger'> = {
  processing: 'warning',
  complete: 'success',
  error: 'danger',
};

export const CSSessionRow: React.FC<CSSessionRowProps> = ({
  title,
  duration,
  frameCount,
  timestamp,
  status,
  thumbnailUrl,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="group flex items-center gap-4 w-full rounded-xl border p-3 cursor-pointer transition-colors duration-150"
    style={{
      backgroundColor: 'var(--cs-bg-surface)',
      borderColor: 'var(--cs-border-subtle)',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--cs-bg-overlay)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--cs-bg-surface)'; }}
  >
    {thumbnailUrl && (
      <div
        className="w-14 h-10 rounded shrink-0 bg-cover bg-center hidden sm:block"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundColor: 'var(--cs-bg-overlay)',
        }}
      />
    )}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium truncate" style={{ color: 'var(--cs-text-primary)' }}>
        {title}
      </div>
      <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--cs-text-secondary)' }}>
        {duration} · {frameCount} frames · {timestamp}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <CSBadge variant={statusVariant[status]}>{status}</CSBadge>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-medium flex items-center gap-1"
        style={{ color: 'var(--cs-text-secondary)' }}
      >
        View <ArrowRight size={12} />
      </button>
    </div>
  </div>
);

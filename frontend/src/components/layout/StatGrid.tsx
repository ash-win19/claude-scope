import React from 'react';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSkeleton } from '@/components/ui/CSSkeleton';

interface Stat {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}

interface StatGridProps {
  stats: Stat[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

export const StatGrid: React.FC<StatGridProps> = ({ stats, loading, columns = 4 }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-${columns} gap-3 mb-10`}>
    {stats.map((stat) => (
      <CSCard key={stat.label} padding="compact">
        {stat.icon && (
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: 'var(--cs-text-muted)' }}>{stat.icon}</span>
            <CSMonoLabel>{stat.label}</CSMonoLabel>
          </div>
        )}
        {!stat.icon && <CSMonoLabel>{stat.label}</CSMonoLabel>}
        <div className="text-2xl font-semibold mt-1" style={{ color: 'var(--cs-text-primary)' }}>
          {loading ? <CSSkeleton width={50} height={28} /> : stat.value}
        </div>
      </CSCard>
    ))}
  </div>
);

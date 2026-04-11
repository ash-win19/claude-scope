import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSessionRow } from '@/components/ui/CSSessionRow';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { Film, Plus } from 'lucide-react';
import { MOCK_SESSIONS, formatDuration, formatTimestamp } from '@/lib/mockData';

const stats = [
  { label: 'TOTAL SESSIONS', value: String(MOCK_SESSIONS.length), trend: '+2 this week' },
  { label: 'PROMPTS GENERATED', value: String(MOCK_SESSIONS.filter(s => s.status === 'complete').length), trend: '3 this month' },
  { label: 'AVG. FRAMES / SESSION', value: String(Math.round(MOCK_SESSIONS.reduce((a, s) => a + s.frameCount, 0) / MOCK_SESSIONS.length)), trend: '~7 per session' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Dashboard</h1>
        <CSButton variant="primary" size="md" iconLeft={<Plus size={16} />} onClick={() => navigate('/app/record/new')}>
          New Recording
        </CSButton>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {stats.map((stat) => (
          <CSCard key={stat.label} padding="compact">
            <CSMonoLabel>{stat.label}</CSMonoLabel>
            <div className="text-[32px] font-semibold mt-1" style={{ color: 'var(--cs-text-primary)' }}>
              {stat.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--cs-text-secondary)' }}>{stat.trend}</div>
          </CSCard>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Recent sessions</h2>
        <CSButton variant="ghost" size="sm" onClick={() => navigate('/app/sessions')}>
          View all →
        </CSButton>
      </div>

      {MOCK_SESSIONS.length === 0 ? (
        <CSEmptyState
          icon={Film}
          title="No recordings yet"
          description="Record a browser tab to get started with your first session."
          ctaLabel="New Recording"
          ctaAction={() => navigate('/app/record/new')}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {MOCK_SESSIONS.slice(0, 5).map((session) => (
            <CSSessionRow
              key={session.id}
              title={session.title}
              duration={formatDuration(session.duration)}
              frameCount={session.frameCount}
              timestamp={formatTimestamp(session.createdAt)}
              status={session.status}
              thumbnailUrl={session.frames[0]?.thumbnailUrl}
              onClick={() => navigate(`/app/sessions/${session.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Dashboard;

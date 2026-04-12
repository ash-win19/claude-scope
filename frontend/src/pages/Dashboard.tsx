import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSessionRow } from '@/components/ui/CSSessionRow';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { Film, Plus } from 'lucide-react';
import { sessions as sessionsApi } from '@/lib/api';
import type { Session, SessionStats } from '@/lib/api';
import { formatDuration, formatTimestamp } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

function getFirstName(fullName: string | undefined): string | null {
  if (!fullName) return null;
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstName = getFirstName(user?.name);

  useEffect(() => {
    async function load() {
      try {
        const [list, statsData] = await Promise.all([
          sessionsApi.list(),
          sessionsApi.stats(),
        ]);
        setSessionList(list);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <WorkspaceShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
          {firstName ? `Hey ${firstName}` : 'Dashboard'}
        </h1>
        <CSButton variant="primary" size="md" iconLeft={<Plus size={16} />} onClick={() => navigate('/workspace/record/new')}>
          New Recording
        </CSButton>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <CSCard padding="compact">
          <CSMonoLabel>TOTAL SESSIONS</CSMonoLabel>
          <div className="text-[32px] font-semibold mt-1" style={{ color: 'var(--cs-text-primary)' }}>
            {loading ? <CSSkeleton width={60} height={32} /> : stats?.totalSessions ?? 0}
          </div>
        </CSCard>
        <CSCard padding="compact">
          <CSMonoLabel>PROMPTS GENERATED</CSMonoLabel>
          <div className="text-[32px] font-semibold mt-1" style={{ color: 'var(--cs-text-primary)' }}>
            {loading ? <CSSkeleton width={60} height={32} /> : stats?.completedSessions ?? 0}
          </div>
        </CSCard>
        <CSCard padding="compact">
          <CSMonoLabel>AVG PROCESSING</CSMonoLabel>
          <div className="text-[32px] font-semibold mt-1" style={{ color: 'var(--cs-text-primary)' }}>
            {loading ? <CSSkeleton width={60} height={32} /> : `${((stats?.avgProcessingTime ?? 0) / 1000).toFixed(1)}s`}
          </div>
        </CSCard>
      </div>

      {/* Recent sessions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Recent sessions</h2>
        <CSButton variant="ghost" size="sm" onClick={() => navigate('/workspace/sessions')}>
          View all →
        </CSButton>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <CSSkeleton key={i} height={64} radius={12} />)}
        </div>
      ) : error ? (
        <CSCard padding="default">
          <p className="text-sm" style={{ color: 'var(--cs-danger)' }}>{error}</p>
          <CSButton variant="secondary" size="sm" className="mt-2" onClick={() => window.location.reload()}>Retry</CSButton>
        </CSCard>
      ) : sessionList.length === 0 ? (
        <CSEmptyState
          icon={Film}
          title="No recordings yet"
          description="Record a browser tab to get started with your first session."
          ctaLabel="New Recording"
          ctaAction={() => navigate('/workspace/record/new')}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {sessionList.slice(0, 5).map((session) => (
            <CSSessionRow
              key={session.id}
              title={session.title}
              duration={formatDuration(session.duration)}
              frameCount={session.frameCount}
              timestamp={formatTimestamp(session.createdAt)}
              status={session.status}
              onClick={() => navigate(`/workspace/sessions/${session.id}`)}
            />
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
};

export default Dashboard;

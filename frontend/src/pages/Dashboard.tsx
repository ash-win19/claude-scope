import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSessionRow } from '@/components/ui/CSSessionRow';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { Film, Plus, FolderOpen, Settings, Clock, CheckCircle2, Zap, Timer } from 'lucide-react';
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
      {/* Header + Quick actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
            {firstName ? `Hey ${firstName}` : 'Dashboard'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cs-text-secondary)' }}>
            Your workspace overview
          </p>
        </div>
        <div className="flex gap-2">
          <CSButton variant="primary" size="md" iconLeft={<Plus size={16} />} onClick={() => navigate('/workspace/record/new')}>
            New Recording
          </CSButton>
        </div>
      </div>

      {/* Stats grid — 4 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { icon: <FolderOpen size={16} />, label: 'TOTAL SESSIONS', value: stats?.totalSessions ?? 0 },
          { icon: <CheckCircle2 size={16} />, label: 'COMPLETED', value: stats?.completedSessions ?? 0 },
          { icon: <Zap size={16} />, label: 'AVG PROCESSING', value: `${((stats?.avgProcessingTime ?? 0) / 1000).toFixed(1)}s` },
          { icon: <Timer size={16} />, label: 'TOTAL DURATION', value: formatDuration(stats?.totalDuration ?? 0) },
        ].map((stat) => (
          <CSCard key={stat.label} padding="compact">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: 'var(--cs-text-muted)' }}>{stat.icon}</span>
              <CSMonoLabel>{stat.label}</CSMonoLabel>
            </div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
              {loading ? <CSSkeleton width={50} height={28} /> : stat.value}
            </div>
          </CSCard>
        ))}
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Record', desc: 'Capture a new session', icon: <Film size={20} />, onClick: () => navigate('/workspace/record/new') },
          { label: 'Sessions', desc: 'Browse all recordings', icon: <FolderOpen size={20} />, onClick: () => navigate('/workspace/sessions') },
          { label: 'Settings', desc: 'Configure workspace', icon: <Settings size={20} />, onClick: () => navigate('/workspace/settings') },
        ].map((action) => (
          <CSCard key={action.label} padding="compact" className="cursor-pointer" style={{ transition: 'background-color 150ms' }}
            onClick={action.onClick}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--cs-bg-overlay)'; }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = ''; }}
          >
            <div style={{ color: 'var(--cs-accent)' }}>{action.icon}</div>
            <div className="text-sm font-medium mt-2" style={{ color: 'var(--cs-text-primary)' }}>{action.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--cs-text-muted)' }}>{action.desc}</div>
          </CSCard>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Recent sessions</h2>
        {sessionList.length > 0 && (
          <CSButton variant="ghost" size="sm" onClick={() => navigate('/workspace/sessions')}>
            View all →
          </CSButton>
        )}
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
          description="Record a browser tab to get started. Claude Scope will extract frames, inspect components, and generate your prompt."
          ctaLabel="Start your first recording"
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

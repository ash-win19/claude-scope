import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSInput } from '@/components/ui/CSInput';
import { CSCard } from '@/components/ui/CSCard';
import { CSSessionRow } from '@/components/ui/CSSessionRow';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { Film, SlidersHorizontal, Search } from 'lucide-react';
import { sessions as sessionsApi } from '@/lib/api';
import type { Session } from '@/lib/api';
import { formatDuration, formatTimestamp } from '@/lib/utils';

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('any');

  useEffect(() => {
    async function load() {
      try {
        const list = await sessionsApi.list();
        setSessionList(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = sessionList.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (dateFilter !== 'any') {
      const created = new Date(s.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (dateFilter === '7' && diffDays > 7) return false;
      if (dateFilter === '30' && diffDays > 30) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Sessions</h1>
        <div className="flex items-center gap-2">
          <CSInput
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search size={14} />}
            className="w-60"
          />
          <CSButton variant="secondary" size="sm" iconLeft={<SlidersHorizontal size={14} />} onClick={() => setShowFilters(!showFilters)}>
            Filter
          </CSButton>
        </div>
      </div>

      {showFilters && (
        <CSCard padding="compact" className="mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border px-2 text-xs"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
            >
              <option value="all">All statuses</option>
              <option value="complete">Complete</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 rounded-lg border px-2 text-xs"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
            >
              <option value="any">Any date</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <CSButton variant="ghost" size="sm" onClick={() => {
              setStatusFilter('all');
              setDateFilter('any');
              setSearch('');
              setShowFilters(false);
            }}>Clear filters</CSButton>
          </div>
        </CSCard>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <CSSkeleton key={i} height={64} radius={12} />)}
        </div>
      ) : error ? (
        <CSCard padding="default">
          <p className="text-sm" style={{ color: 'var(--cs-danger)' }}>{error}</p>
          <CSButton variant="secondary" size="sm" className="mt-2" onClick={() => window.location.reload()}>Retry</CSButton>
        </CSCard>
      ) : filtered.length === 0 ? (
        <CSEmptyState
          icon={Film}
          title="No sessions"
          description="Record a tab to get started."
          ctaLabel="New Recording"
          ctaAction={() => navigate('/app/record/new')}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((session) => (
            <CSSessionRow
              key={session.id}
              title={session.title}
              duration={formatDuration(session.duration)}
              frameCount={session.frameCount}
              timestamp={formatTimestamp(session.createdAt)}
              status={session.status}
              onClick={() => navigate(`/app/sessions/${session.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Sessions;

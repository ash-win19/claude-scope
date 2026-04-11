import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSInput } from '@/components/ui/CSInput';
import { CSSessionRow } from '@/components/ui/CSSessionRow';
import { CSEmptyState } from '@/components/ui/CSEmptyState';
import { CSCard } from '@/components/ui/CSCard';
import { Film, SlidersHorizontal, Search } from 'lucide-react';
import { MOCK_SESSIONS, formatDuration, formatTimestamp } from '@/lib/mockData';

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_SESSIONS.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

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
              className="h-8 rounded-lg border px-2 text-xs"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
            >
              <option>All statuses</option>
              <option>Complete</option>
              <option>Processing</option>
              <option>Error</option>
            </select>
            <select
              className="h-8 rounded-lg border px-2 text-xs"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
            >
              <option>Any date</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <CSButton variant="ghost" size="sm" onClick={() => setShowFilters(false)}>Clear filters</CSButton>
          </div>
        </CSCard>
      )}

      {filtered.length === 0 ? (
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
              thumbnailUrl={session.frames[0]?.thumbnailUrl}
              onClick={() => navigate(`/app/sessions/${session.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Sessions;

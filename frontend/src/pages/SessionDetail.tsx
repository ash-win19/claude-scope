import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSCodeBlock } from '@/components/ui/CSCodeBlock';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSToggle } from '@/components/ui/CSToggle';
import { useCSToast } from '@/components/ui/CSToast';
import { getMockSession, formatDuration, formatTimestamp } from '@/lib/mockData';
import { Trash2, RefreshCw } from 'lucide-react';

const AGENTS = ['Claude Code', 'Codex', 'Cursor', 'Raw'] as const;

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useCSToast();
  const session = getMockSession(id || '');
  const [activeAgent, setActiveAgent] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(session?.title || '');

  if (!session) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="font-mono text-7xl" style={{ color: 'var(--cs-text-muted)' }}>404</span>
          <p className="mt-4 text-sm" style={{ color: 'var(--cs-text-secondary)' }}>Session not found</p>
          <CSButton variant="primary" className="mt-6" onClick={() => navigate('/app')}>← Go to Dashboard</CSButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="font-mono text-xs mb-4" style={{ color: 'var(--cs-text-muted)' }}>
        <button onClick={() => navigate('/app/sessions')} className="hover:underline">Sessions</button>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            className="text-[28px] font-semibold bg-transparent border-b-2 outline-none"
            style={{ color: 'var(--cs-text-primary)', borderColor: 'var(--cs-accent)' }}
          />
        ) : (
          <h1
            className="text-[28px] font-semibold cursor-pointer"
            style={{ color: 'var(--cs-text-primary)' }}
            onClick={() => setEditingTitle(true)}
          >
            {title}
          </h1>
        )}
        <CSButton variant="ghost" size="sm" iconLeft={<Trash2 size={14} />} style={{ color: 'var(--cs-danger)' }}>
          Delete session
        </CSButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — prompt */}
        <div className="lg:col-span-3">
          {/* Agent tabs */}
          <div className="flex border-b mb-4" style={{ borderColor: 'var(--cs-border-subtle)' }}>
            {AGENTS.map((agent, i) => (
              <button
                key={agent}
                onClick={() => setActiveAgent(i)}
                className="px-4 py-2 text-sm transition-colors duration-150"
                style={{
                  color: activeAgent === i ? 'var(--cs-text-primary)' : 'var(--cs-text-muted)',
                  borderBottom: activeAgent === i ? '2px solid var(--cs-accent)' : '2px solid transparent',
                }}
              >
                {agent}
              </button>
            ))}
          </div>

          <CSCodeBlock content={session.prompt} showLineNumbers copyable />

          <CSButton variant="ghost" size="sm" className="mt-3" iconLeft={<RefreshCw size={14} />}>
            Regenerate prompt
          </CSButton>
        </div>

        {/* Right — metadata */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Filmstrip */}
          <CSCard padding="compact">
            <CSMonoLabel>FRAMES ({session.frameCount})</CSMonoLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {session.frames.map((frame) => (
                <div
                  key={frame.id}
                  className="w-20 h-14 rounded bg-cover bg-center border cursor-pointer transition-transform duration-150 hover:scale-105"
                  style={{
                    backgroundImage: `url(${frame.thumbnailUrl})`,
                    borderColor: 'var(--cs-border-subtle)',
                    backgroundColor: 'var(--cs-bg-overlay)',
                  }}
                />
              ))}
            </div>
          </CSCard>

          {/* Session metadata */}
          <CSCard padding="compact">
            <CSMonoLabel>SESSION INFO</CSMonoLabel>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>Duration</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{formatDuration(session.duration)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>Frames</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{session.frameCount}</div>
              </div>
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>URLs</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{session.urls.length}</div>
              </div>
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>Date</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{formatTimestamp(session.createdAt)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>Processing</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{session.processingTime}s</div>
              </div>
            </div>
          </CSCard>

          {/* Component summary */}
          <CSCard padding="compact">
            <CSMonoLabel>COMPONENTS</CSMonoLabel>
            <p className="text-sm mt-2" style={{ color: 'var(--cs-text-primary)' }}>
              {session.frames.reduce((a, f) => a + f.diffSummary.added + f.diffSummary.changed + f.diffSummary.removed, 0)} components across {session.frameCount} states
            </p>
            <div className="flex gap-3 mt-2 text-xs font-mono">
              <span style={{ color: 'var(--cs-diff-added)' }}>+{session.frames.reduce((a, f) => a + f.diffSummary.added, 0)} added</span>
              <span style={{ color: 'var(--cs-diff-changed)' }}>~{session.frames.reduce((a, f) => a + f.diffSummary.changed, 0)} changed</span>
              <span style={{ color: 'var(--cs-diff-removed)' }}>-{session.frames.reduce((a, f) => a + f.diffSummary.removed, 0)} removed</span>
            </div>
          </CSCard>
        </div>
      </div>
    </AppShell>
  );
};

export default SessionDetail;

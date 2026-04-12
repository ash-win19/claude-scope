import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSCodeBlock } from '@/components/ui/CSCodeBlock';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { useCSToast } from '@/components/ui/CSToast';
import { sessions as sessionsApi } from '@/lib/api';
import type { SessionWithFrames } from '@/lib/api';
import { formatDuration, formatTimestamp } from '@/lib/utils';
import { Trash2, RefreshCw } from 'lucide-react';

const AGENTS = ['Claude Code', 'Codex', 'Cursor', 'Raw'] as const;

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useCSToast();
  const [session, setSession] = useState<SessionWithFrames | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await sessionsApi.get(id!);
        setSession(data);
        setTitle(data.title);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <WorkspaceShell>
        <div className="flex flex-col gap-4 py-12">
          <CSSkeleton width={200} height={28} />
          <CSSkeleton height={400} radius={12} />
        </div>
      </WorkspaceShell>
    );
  }

  if (!session) {
    return (
      <WorkspaceShell>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="font-mono text-7xl" style={{ color: 'var(--cs-text-muted)' }}>404</span>
          <p className="mt-4 text-sm" style={{ color: 'var(--cs-text-secondary)' }}>Session not found</p>
          <CSButton variant="primary" className="mt-6" onClick={() => navigate('/workspace')}>← Go to Dashboard</CSButton>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      {/* Breadcrumb */}
      <div className="font-mono text-xs mb-4" style={{ color: 'var(--cs-text-muted)' }}>
        <button onClick={() => navigate('/workspace/sessions')} className="hover:underline">Sessions</button>
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
            onBlur={async () => {
              setEditingTitle(false);
              if (title.trim() && title !== session.title) {
                try {
                  await sessionsApi.update(id!, { title: title.trim() });
                } catch {
                  setTitle(session.title);
                  showToast('Failed to update title', 'error');
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') { setTitle(session.title); setEditingTitle(false); }
            }}
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
        <CSButton
          variant="ghost"
          size="sm"
          iconLeft={<Trash2 size={14} />}
          style={{ color: 'var(--cs-danger)' }}
          loading={deleting}
          onClick={async () => {
            if (!confirm('Delete this session? This cannot be undone.')) return;
            setDeleting(true);
            try {
              await sessionsApi.delete(id!);
              showToast('Session deleted', 'success');
              navigate('/workspace/sessions');
            } catch {
              showToast('Failed to delete session', 'error');
              setDeleting(false);
            }
          }}
        >
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
            {session.frames.length > 0 ? (
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
            ) : (
              <p className="text-xs mt-3" style={{ color: 'var(--cs-text-muted)' }}>No frames available.</p>
            )}
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
                <div style={{ color: 'var(--cs-text-primary)' }}>{(session.processingTime / 1000).toFixed(1)}s</div>
              </div>
            </div>
          </CSCard>

          {/* Component summary */}
          <CSCard padding="compact">
            <CSMonoLabel>COMPONENTS</CSMonoLabel>
            {session.frames.length > 0 && session.frames.some(
              (f) => f.diffSummary.added > 0 || f.diffSummary.changed > 0 || f.diffSummary.removed > 0
            ) ? (
              <>
                <p className="text-sm mt-2" style={{ color: 'var(--cs-text-primary)' }}>
                  {session.frames.reduce((a, f) => a + f.diffSummary.added + f.diffSummary.changed + f.diffSummary.removed, 0)} components across {session.frameCount} states
                </p>
                <div className="flex gap-3 mt-2 text-xs font-mono">
                  <span style={{ color: 'var(--cs-diff-added)' }}>+{session.frames.reduce((a, f) => a + f.diffSummary.added, 0)} added</span>
                  <span style={{ color: 'var(--cs-diff-changed)' }}>~{session.frames.reduce((a, f) => a + f.diffSummary.changed, 0)} changed</span>
                  <span style={{ color: 'var(--cs-diff-removed)' }}>-{session.frames.reduce((a, f) => a + f.diffSummary.removed, 0)} removed</span>
                </div>
              </>
            ) : (
              <p className="text-xs mt-2" style={{ color: 'var(--cs-text-muted)' }}>No component diff data available.</p>
            )}
          </CSCard>
        </div>
      </div>
    </WorkspaceShell>
  );
};

export default SessionDetail;

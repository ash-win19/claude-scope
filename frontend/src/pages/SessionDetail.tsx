import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSCodeBlock } from '@/components/ui/CSCodeBlock';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { CSCardSkeleton } from '@/components/ui/CSCardSkeleton';
import { CSBadge } from '@/components/ui/CSBadge';
import { useCSToast } from '@/components/ui/CSToast';
import { sessions as sessionsApi } from '@/lib/api';
import type { Session, SessionWithFrames } from '@/lib/api';
import { formatDuration, formatTimestamp } from '@/lib/utils';
import { Trash2, RefreshCw, Clock, Layers, Link2, Cpu, Calendar, Target } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

function formatAgentTarget(agent: Session['agentTarget']): string {
  const labels: Record<Session['agentTarget'], string> = {
    CLAUDE_CODE: 'Claude Code',
    CODEX: 'Codex',
    CURSOR: 'Cursor',
    RAW: 'Raw',
  };
  return labels[agent] ?? agent;
}

function sessionSummaryLine(session: SessionWithFrames): string {
  const { duration, frameCount, urlCount, processingTime, agentTarget } = session;
  const dur = formatDuration(duration);
  const frames = frameCount === 1 ? '1 frame' : `${frameCount} frames`;
  const urls = urlCount === 1 ? '1 unique URL' : `${urlCount} unique URLs`;
  const proc = (processingTime / 1000).toFixed(1);
  return `Recorded over ${dur}, this capture includes ${frames} and ${urls}. Pipeline processing took ${proc}s using ${formatAgentTarget(agentTarget)}.`;
}

const statusBadgeVariant: Record<Session['status'], 'warning' | 'success' | 'danger'> = {
  processing: 'warning',
  complete: 'success',
  error: 'danger',
};

const statusLabel: Record<Session['status'], string> = {
  processing: 'Processing',
  complete: 'Complete',
  error: 'Error',
};

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useCSToast();
  const [session, setSession] = useState<SessionWithFrames | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [deleting, setDeleting] = useState(false);
  useDocumentTitle(session?.title ?? 'Session');

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
        <div className="animate-cs-fade-in max-w-5xl">
          <CSSkeleton width={100} height={12} className="mb-4" />
          <CSSkeleton width={300} height={32} className="mb-8" />
          <div className="space-y-8">
            <div>
              <CSSkeleton width={180} height={14} className="mb-3" />
              <CSSkeleton width="100%" height={520} radius={12} />
            </div>
            <CSCardSkeleton lines={5} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CSCardSkeleton lines={3} />
              <CSCardSkeleton lines={3} />
            </div>
          </div>
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

      <div className="max-w-5xl space-y-10">
        {/* Primary: system prompt */}
        <section aria-labelledby="session-prompt-heading">
          <div className="mb-5">
            <p
              className="text-[11px] font-mono uppercase tracking-[0.12em] mb-2"
              style={{ color: 'var(--cs-text-muted)' }}
            >
              Primary content
            </p>
            <h2
              id="session-prompt-heading"
              className="text-xl sm:text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--cs-text-primary)' }}
            >
              System prompt
            </h2>
            <p
              className="mt-2 text-sm leading-relaxed max-w-2xl"
              style={{ color: 'var(--cs-text-secondary)' }}
            >
              Instructions synthesized for this session—the main artifact to review, copy, or compare across runs.
            </p>
          </div>

          <CSCodeBlock
            content={session.prompt}
            language="markdown"
            filename="system-prompt.md"
            showLineNumbers
            copyable
            maxHeight={560}
            className="shadow-lg shadow-black/20"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>
              Markdown · line numbers · copy supported
            </p>
            <CSButton variant="ghost" size="sm" iconLeft={<RefreshCw size={14} aria-hidden />}>
              Regenerate prompt
            </CSButton>
          </div>
        </section>

        {/* Metadata narrative + facts */}
        <section aria-labelledby="session-meta-heading">
          <h2
            id="session-meta-heading"
            className="text-[11px] font-mono uppercase tracking-[0.12em] mb-3"
            style={{ color: 'var(--cs-text-muted)' }}
          >
            Session details
          </h2>
          <CSCard padding="default">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <p className="text-sm leading-relaxed flex-1 min-w-[min(100%,280px)]" style={{ color: 'var(--cs-text-primary)' }}>
                {sessionSummaryLine(session)}
              </p>
              <CSBadge variant={statusBadgeVariant[session.status]}>{statusLabel[session.status]}</CSBadge>
            </div>

            {session.seedUrl ? (
              <p className="text-xs mb-4 break-all" style={{ color: 'var(--cs-text-secondary)' }}>
                <span style={{ color: 'var(--cs-text-muted)' }}>Seed URL: </span>
                <a
                  href={session.seedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-90 transition-opacity"
                  style={{ color: 'var(--cs-accent)' }}
                >
                  {session.seedUrl}
                </a>
              </p>
            ) : null}

            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
                <Clock size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cs-text-muted)' }} aria-hidden />
                <div>
                  <dt style={{ color: 'var(--cs-text-muted)' }}>Duration</dt>
                  <dd className="font-medium mt-0.5" style={{ color: 'var(--cs-text-primary)' }}>{formatDuration(session.duration)}</dd>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
                <Layers size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cs-text-muted)' }} aria-hidden />
                <div>
                  <dt style={{ color: 'var(--cs-text-muted)' }}>Frames</dt>
                  <dd className="font-medium mt-0.5" style={{ color: 'var(--cs-text-primary)' }}>{session.frameCount}</dd>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
                <Link2 size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cs-text-muted)' }} aria-hidden />
                <div>
                  <dt style={{ color: 'var(--cs-text-muted)' }}>Unique URLs</dt>
                  <dd className="font-medium mt-0.5" style={{ color: 'var(--cs-text-primary)' }}>{session.urlCount}</dd>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
                <Calendar size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cs-text-muted)' }} aria-hidden />
                <div>
                  <dt style={{ color: 'var(--cs-text-muted)' }}>Recorded</dt>
                  <dd className="font-medium mt-0.5" style={{ color: 'var(--cs-text-primary)' }}>{formatTimestamp(session.createdAt)}</dd>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
                <Cpu size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cs-text-muted)' }} aria-hidden />
                <div>
                  <dt style={{ color: 'var(--cs-text-muted)' }}>Processing</dt>
                  <dd className="font-medium mt-0.5" style={{ color: 'var(--cs-text-primary)' }}>{(session.processingTime / 1000).toFixed(1)}s</dd>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
                <Target size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--cs-text-muted)' }} aria-hidden />
                <div>
                  <dt style={{ color: 'var(--cs-text-muted)' }}>Agent target</dt>
                  <dd className="font-medium mt-0.5" style={{ color: 'var(--cs-text-primary)' }}>{formatAgentTarget(session.agentTarget)}</dd>
                </div>
              </div>
            </dl>
          </CSCard>
        </section>

        {/* Secondary: capture & diff analytics */}
        <section aria-labelledby="session-analytics-heading" className="pb-4">
          <h2
            id="session-analytics-heading"
            className="text-[11px] font-mono uppercase tracking-[0.12em] mb-3"
            style={{ color: 'var(--cs-text-muted)' }}
          >
            Capture &amp; analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CSCard padding="compact">
              <CSMonoLabel>FRAMES ({session.frameCount})</CSMonoLabel>
              <p className="text-xs mt-1 mb-3 leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>
                Thumbnails from the recording timeline. Use them to scan UI states before diving into diffs.
              </p>
              {session.frames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {session.frames.map((frame, index) => (
                    <div
                      key={frame.id}
                      role="img"
                      aria-label={`Frame ${index + 1} thumbnail`}
                      className="w-20 h-14 rounded bg-cover bg-center border cursor-pointer transition-transform duration-150 hover:scale-105 motion-reduce:transform-none"
                      style={{
                        backgroundImage: `url(${frame.thumbnailUrl})`,
                        borderColor: 'var(--cs-border-subtle)',
                        backgroundColor: 'var(--cs-bg-overlay)',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs mt-2" style={{ color: 'var(--cs-text-muted)' }}>No frames available.</p>
              )}
            </CSCard>

            <CSCard padding="compact">
              <CSMonoLabel>COMPONENT DIFFS</CSMonoLabel>
              <p className="text-xs mt-1 mb-3 leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>
                Aggregate component changes detected across captured states.
              </p>
              {session.frames.length > 0 && session.frames.some(
                (f) => f.diffSummary.added > 0 || f.diffSummary.changed > 0 || f.diffSummary.removed > 0
              ) ? (
                <>
                  <p className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>
                    {session.frames.reduce((a, f) => a + f.diffSummary.added + f.diffSummary.changed + f.diffSummary.removed, 0)} components across {session.frameCount} states
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs font-mono">
                    <span style={{ color: 'var(--cs-diff-added)' }}>+{session.frames.reduce((a, f) => a + f.diffSummary.added, 0)} added</span>
                    <span style={{ color: 'var(--cs-diff-changed)' }}>~{session.frames.reduce((a, f) => a + f.diffSummary.changed, 0)} changed</span>
                    <span style={{ color: 'var(--cs-diff-removed)' }}>-{session.frames.reduce((a, f) => a + f.diffSummary.removed, 0)} removed</span>
                  </div>
                </>
              ) : (
                <p className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>No component diff data available.</p>
              )}
            </CSCard>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
};

export default SessionDetail;

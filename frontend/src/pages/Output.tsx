import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSCodeBlock } from '@/components/ui/CSCodeBlock';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { useCSToast } from '@/components/ui/CSToast';
import { useSessionStore } from '@/store/sessionStore';
import { sessions as sessionsApi } from '@/lib/api';
import type { SessionWithFrames } from '@/lib/api';
import { formatDuration, formatTimestamp } from '@/lib/utils';
import { ArrowLeft, Plus, ChevronDown } from 'lucide-react';

const AGENTS = ['Claude Code', 'Codex', 'Cursor', 'Raw'] as const;

const Output: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useCSToast();
  const processingResult = useSessionStore((s) => s.processingResult);
  const [session, setSession] = useState<SessionWithFrames | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (processingResult && processingResult.sessionId === id) {
        setSession({
          id: processingResult.sessionId,
          userId: '',
          title: processingResult.title,
          status: processingResult.status as 'complete',
          duration: 0,
          frameCount: processingResult.frameCount,
          urls: processingResult.urlsInspected,
          urlCount: processingResult.urlsInspected.length,
          agentTarget: processingResult.agentTarget as 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW',
          processingTime: processingResult.processingMs,
          prompt: processingResult.prompt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          frames: processingResult.frames,
        });
        setLoading(false);
        return;
      }
      try {
        const data = await sessionsApi.get(id!);
        setSession(data);
      } catch {
        navigate('/app');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  const [activeAgent, setActiveAgent] = useState(0);
  const [includeScreenshots, setIncludeScreenshots] = useState(true);
  const [inlineAria, setInlineAria] = useState(true);
  const [includeRawDiff, setIncludeRawDiff] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const handleSave = () => {
    showToast('Session saved ✓', 'success');
    navigate(`/app/sessions/${id}`);
  };

  if (loading) {
    return (
      <PipelineShell currentStep={3} maxWidth={900}>
        <p className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>Loading session data...</p>
      </PipelineShell>
    );
  }

  return (
    <PipelineShell
      currentStep={3}
      maxWidth={900}
      rightAction={
        <CSButton variant="secondary" size="md" onClick={handleSave}>
          Save session
        </CSButton>
      }
    >
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--cs-text-primary)' }}>
        Your prompt is ready
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--cs-text-secondary)' }}>
        Copy directly into Claude Code, Codex, or any AI coding agent.
      </p>

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

      <CSCodeBlock content={session?.prompt || '# No prompt generated'} showLineNumbers copyable />

      {/* Output options */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {[
          { label: 'Include screenshot bundle', checked: includeScreenshots, onChange: setIncludeScreenshots },
          { label: 'Inline ARIA tree', checked: inlineAria, onChange: setInlineAria },
          { label: 'Include raw DOM diff', checked: includeRawDiff, onChange: setIncludeRawDiff },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--cs-text-primary)' }}>
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.onChange(e.target.checked)}
              className="rounded"
              style={{ accentColor: 'var(--cs-accent)' }}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between mt-8">
        <CSButton variant="ghost" size="sm" iconLeft={<ArrowLeft size={14} />} onClick={() => navigate(`/app/record/${id}/review`)}>
          Back to Review
        </CSButton>
        <div className="flex gap-2">
          <CSButton variant="secondary" size="sm" iconLeft={<Plus size={14} />} onClick={() => navigate('/app/record/new')}>
            New Recording
          </CSButton>
          <CSButton variant="primary" size="md" onClick={handleSave}>
            Save session
          </CSButton>
        </div>
      </div>

      {/* Session metadata collapsible */}
      <div className="mt-8">
        <button onClick={() => setShowMeta(!showMeta)} className="flex items-center gap-1">
          <CSMonoLabel>SESSION INFO</CSMonoLabel>
          <ChevronDown
            size={12}
            style={{
              color: 'var(--cs-text-muted)',
              transform: showMeta ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 150ms',
            }}
          />
        </button>
        {showMeta && session && (
          <CSCard padding="compact" className="mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
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
                <div style={{ color: 'var(--cs-text-primary)' }}>{session.urls.join(', ')}</div>
              </div>
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>Processing time</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{session.processingTime}s</div>
              </div>
              <div>
                <span style={{ color: 'var(--cs-text-muted)' }}>Created</span>
                <div style={{ color: 'var(--cs-text-primary)' }}>{formatTimestamp(session.createdAt)}</div>
              </div>
            </div>
          </CSCard>
        )}
      </div>
    </PipelineShell>
  );
};

export default Output;

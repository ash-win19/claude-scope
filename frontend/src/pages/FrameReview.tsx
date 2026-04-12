import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSToggle } from '@/components/ui/CSToggle';
import { useSessionStore } from '@/store/sessionStore';
import { sessions as sessionsApi } from '@/lib/api';
import type { Frame } from '@/lib/api';
import { ARIATree } from '@/components/pipeline/ARIATree';
import { X } from 'lucide-react';
import type { ARIANode } from '@/store/sessionStore';

const FrameReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const processingResult = useSessionStore((s) => s.processingResult);
  const [loading, setLoading] = useState(true);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [diffView, setDiffView] = useState(false);

  useEffect(() => {
    async function loadSession() {
      // Try in-memory processing result first (just came from Processing page)
      if (processingResult && processingResult.sessionId === id) {
        setFrames(processingResult.frames ?? []);
        setLoading(false);
        return;
      }

      // Fallback: fetch from API (page refresh scenario)
      try {
        const data = await sessionsApi.get(id!);
        setFrames(data.frames);
      } catch {
        navigate('/app');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  const selectedFrame = frames[selectedFrameIndex];

  const removeFrame = (frameId: string) => {
    const next = frames.filter((f) => f.id !== frameId);
    setFrames(next);
    if (selectedFrameIndex >= next.length) {
      setSelectedFrameIndex(Math.max(0, next.length - 1));
    }
  };

  if (loading) {
    return (
      <PipelineShell currentStep={2} maxWidth={1100}>
        <p className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>Loading session data...</p>
      </PipelineShell>
    );
  }

  return (
    <PipelineShell
      currentStep={2}
      maxWidth={1100}
      rightAction={
        <CSButton
          variant="primary"
          size="md"
          disabled={frames.length === 0}
          onClick={() => navigate(`/app/record/${id}/output`)}
        >
          Generate Prompt →
        </CSButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel — 60% */}
        <div className="lg:col-span-3">
          {/* Filmstrip */}
          <div className="mb-4">
            <CSMonoLabel>FRAMES CAPTURED ({frames.length})</CSMonoLabel>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {frames.map((frame, i) => (
                <div
                  key={frame.id}
                  className="relative shrink-0 w-20 h-14 rounded cursor-pointer bg-cover bg-center transition-all duration-150"
                  style={{
                    backgroundImage: `url(${frame.thumbnailUrl})`,
                    backgroundColor: 'var(--cs-bg-overlay)',
                    border: i === selectedFrameIndex
                      ? '2px solid var(--cs-accent-border)'
                      : '1px solid var(--cs-border-subtle)',
                    transform: i === selectedFrameIndex ? 'scale(1.04)' : 'scale(1)',
                  }}
                  onClick={() => setSelectedFrameIndex(i)}
                >
                  {/* Diff badge */}
                  {(frame.diffSummary.added > 0 || frame.diffSummary.removed > 0) && (
                    <span
                      className="absolute bottom-0.5 right-0.5 font-mono text-[10px] px-1 rounded-full"
                      style={{
                        backgroundColor: frame.diffSummary.added > 0 ? 'var(--cs-diff-added)' : 'var(--cs-diff-removed)',
                        color: 'var(--cs-bg-base)',
                      }}
                    >
                      {frame.diffSummary.added > 0 ? `+${frame.diffSummary.added}` : `-${frame.diffSummary.removed}`}
                    </span>
                  )}
                  {/* Remove button on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFrame(frame.id); }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--cs-bg-raised)', color: 'var(--cs-danger)' }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected frame */}
          {selectedFrame && (
            <div>
              <div
                className="w-full rounded-lg border overflow-hidden"
                style={{ borderColor: 'var(--cs-border-subtle)' }}
              >
                <img
                  src={selectedFrame.thumbnailUrl}
                  alt={`Frame at ${selectedFrame.timestamp}s`}
                  className="w-full object-contain"
                  style={{ backgroundColor: 'var(--cs-bg-overlay)', maxHeight: 400 }}
                />
              </div>
              <div className="flex gap-4 mt-2 font-mono text-[11px]" style={{ color: 'var(--cs-text-muted)' }}>
                <span>Timestamp: {Math.floor(selectedFrame.timestamp / 60)}:{String(Math.floor(selectedFrame.timestamp % 60)).padStart(2, '0')}</span>
                <span>URL: {selectedFrame.url}</span>
              </div>
              <CSButton variant="ghost" size="sm" className="mt-2" style={{ color: 'var(--cs-danger)' }} onClick={() => removeFrame(selectedFrame.id)}>
                Remove this frame
              </CSButton>
            </div>
          )}
        </div>

        {/* Right panel — 40% */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <CSMonoLabel>COMPONENTS AT {selectedFrame ? `${Math.floor(selectedFrame.timestamp / 60)}:${String(Math.floor(selectedFrame.timestamp % 60)).padStart(2, '0')}` : '--'}</CSMonoLabel>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--cs-text-secondary)' }}>Diff view</span>
              <CSToggle checked={diffView} onCheckedChange={setDiffView} />
            </div>
          </div>
          <div className="h-px mb-3" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />

          {selectedFrame && (
            <ARIATree nodes={selectedFrame.ariaTree} diffOnly={diffView} />
          )}

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'var(--cs-border-subtle)' }}>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-diff-added)' }} />
              <span style={{ color: 'var(--cs-text-secondary)' }}>Added</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-diff-changed)' }} />
              <span style={{ color: 'var(--cs-text-secondary)' }}>Changed</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-diff-removed)' }} />
              <span style={{ color: 'var(--cs-text-secondary)' }}>Removed</span>
            </div>
          </div>
        </div>
      </div>
    </PipelineShell>
  );
};

export default FrameReview;

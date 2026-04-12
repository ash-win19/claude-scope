import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSSkeleton } from '@/components/ui/CSSkeleton';
import { useSessionStore } from '@/store/sessionStore';
import { formatMs } from '@/lib/utils';
import { sessions as sessionsApi, resolveAssetUrl } from '@/lib/api';
import type { Frame, InspectionSummary } from '@/lib/api';
import { ARIATree } from '@/components/pipeline/ARIATree';
import { X } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const AriaSnapshotViewer: React.FC<{ yaml: string }> = ({ yaml }) => {
  const [expanded, setExpanded] = useState(false);
  const preview = yaml.slice(0, 200);
  const isTruncated = yaml.length > 200;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-mono flex items-center gap-1"
        style={{ color: 'var(--cs-text-secondary)' }}
      >
        {expanded ? '\u25BE' : '\u25B8'} ARIA Snapshot ({yaml.length} chars)
      </button>
      {expanded && (
        <pre
          className="mt-1 rounded-lg border p-3 overflow-auto text-[11px] font-mono"
          style={{
            backgroundColor: 'var(--cs-bg-raised)',
            borderColor: 'var(--cs-border-subtle)',
            color: 'var(--cs-text-secondary)',
            maxHeight: 300,
          }}
        >
          {yaml}
        </pre>
      )}
      {!expanded && isTruncated && (
        <pre
          className="mt-1 rounded-lg border p-2 overflow-hidden text-[11px] font-mono"
          style={{
            backgroundColor: 'var(--cs-bg-raised)',
            borderColor: 'var(--cs-border-subtle)',
            color: 'var(--cs-text-muted)',
            maxHeight: 48,
          }}
        >
          {preview}...
        </pre>
      )}
    </div>
  );
};

interface InspectionPanelProps {
  inspection: InspectionSummary | null | undefined;
  loading: boolean;
}

const InspectionPanel: React.FC<InspectionPanelProps> = ({ inspection, loading }) => {
  if (loading) {
    return (
      <div className="mt-6">
        <CSMonoLabel>STRUCTURAL INSPECTION</CSMonoLabel>
        <div className="animate-pulse mt-3 h-[120px] rounded-lg" style={{ backgroundColor: 'var(--cs-bg-raised)' }} />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="mt-6">
        <CSMonoLabel>STRUCTURAL INSPECTION</CSMonoLabel>
        <p className="text-xs py-4" style={{ color: 'var(--cs-text-muted)' }}>
          No inspection data available for this session.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <CSMonoLabel>STRUCTURAL INSPECTION</CSMonoLabel>
      <CSCard padding="compact" className="mt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: 'var(--cs-text-primary)' }}>
            {inspection.urlsInspected.length} URL(s) inspected
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--cs-text-muted)' }}>
            {inspection.durationMs}ms
          </span>
        </div>

        {inspection.snapshots.map((snap, i) => (
          <div key={i} className="mb-4">
            <div className="text-xs font-mono mb-1" style={{ color: 'var(--cs-accent)' }}>
              {snap.url}
            </div>

            {!snap.success ? (
              <p className="text-xs" style={{ color: 'var(--cs-danger)' }}>
                Inspection failed: {snap.error}
              </p>
            ) : (
              <>
                <div className="flex gap-3 flex-wrap text-xs font-mono" style={{ color: 'var(--cs-text-secondary)' }}>
                  <span>Buttons: {snap.counts?.buttons ?? 0}</span>
                  <span>Inputs: {snap.counts?.inputs ?? 0}</span>
                  <span>Links: {snap.counts?.links ?? 0}</span>
                  <span>Headings: {snap.counts?.headings ?? 0}</span>
                  <span>Total: {snap.counts?.total ?? 0}</span>
                </div>

                {snap.ariaTree && <AriaSnapshotViewer yaml={snap.ariaTree} />}
              </>
            )}
          </div>
        ))}
      </CSCard>
    </div>
  );
};

const FrameReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const processingResult = useSessionStore((s) => s.processingResult);
  const [loading, setLoading] = useState(true);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [inspection, setInspection] = useState<InspectionSummary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  useDocumentTitle('Frame Review');

  useEffect(() => {
    async function loadSession() {
      // Try in-memory processing result first (just came from Processing page)
      if (processingResult && processingResult.sessionId === id) {
        setFrames(processingResult.frames ?? []);
        setInspection(processingResult.inspection ?? null);
        setLoading(false);
        return;
      }

      // Fallback: fetch from API (page refresh scenario)
      try {
        const data = await sessionsApi.get(id!);
        setFrames(data.frames);
        setInspection(data.analysis?.inspectionJson ?? data.inspectionJson ?? null);
      } catch {
        navigate('/workspace');
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CSSkeleton width={150} height={14} className="mb-3" />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => <CSSkeleton key={i} width={96} height={64} radius={8} />)}
            </div>
            <CSSkeleton height={300} radius={12} />
          </div>
          <div className="lg:col-span-2">
            <CSSkeleton width={120} height={14} className="mb-3" />
            <CSSkeleton height={200} radius={8} />
          </div>
        </div>
      </PipelineShell>
    );
  }

  return (
    <PipelineShell
      currentStep={2}
      maxWidth={1100}
      rightAction={undefined}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel — 60% */}
        <div className="lg:col-span-3">
          {/* Filmstrip */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <CSMonoLabel>FRAMES ({frames.length})</CSMonoLabel>
              <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>
                Select frames to include in your prompt
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {frames.map((frame, i) => (
                <div
                  key={frame.id}
                  className="relative shrink-0 w-24 h-16 rounded cursor-pointer bg-cover bg-center transition-all duration-150"
                  style={{
                    backgroundImage: `url(${resolveAssetUrl(frame.thumbnailUrl)})`,
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
                  src={resolveAssetUrl(selectedFrame.thumbnailUrl)}
                  alt={`Frame at ${formatMs(selectedFrame.timestamp)}`}
                  className="w-full object-contain"
                  style={{ backgroundColor: 'var(--cs-bg-overlay)', maxHeight: 400 }}
                />
              </div>
              <div className="flex gap-4 mt-2 font-mono text-[11px]" style={{ color: 'var(--cs-text-muted)' }}>
                <span>Timestamp: {formatMs(selectedFrame.timestamp)}</span>
                <span>URL: {selectedFrame.url}</span>
              </div>
              <CSButton variant="ghost" size="sm" className="mt-2" style={{ color: 'var(--cs-danger)' }} onClick={() => removeFrame(selectedFrame.id)}>
                Remove this frame
              </CSButton>
            </div>
          )}

          <InspectionPanel inspection={inspection} loading={loading} />
        </div>

        {/* Right panel — 40% */}
        <div className="lg:col-span-2">
          <CSMonoLabel>COMPONENTS AT {selectedFrame ? formatMs(selectedFrame.timestamp) : '--'}</CSMonoLabel>
          <div className="h-px my-3" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />

          {selectedFrame && (
            selectedFrame.ariaTree.length > 0 ? (
              <ARIATree nodes={selectedFrame.ariaTree} />
            ) : (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--cs-text-muted)' }}>
                No component data available for this frame.
              </p>
            )
          )}

        </div>
      </div>

      {/* Sticky CTA */}
      <div
        className="sticky bottom-0 left-0 right-0 flex items-center justify-between py-4 px-6 -mx-6 mt-8 border-t"
        style={{ backgroundColor: 'var(--cs-bg-base)', borderColor: 'var(--cs-border-subtle)' }}
      >
        <span className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>
          {frames.length} frame{frames.length !== 1 ? 's' : ''} selected
        </span>
        <CSButton
          variant="primary"
          size="lg"
          disabled={frames.length === 0 || generating}
          loading={generating}
          onClick={async () => {
            setGenerating(true);
            setGenerateError(null);
            try {
              const result = await sessionsApi.generatePrompt(id!);
              if (result.promptStatus === 'complete') {
                navigate(`/workspace/record/${id}/prompt`);
              } else if (result.promptStatus === 'error') {
                setGenerateError(result.error ?? 'Prompt generation failed');
              } else {
                navigate(`/workspace/record/${id}/prompt`);
              }
            } catch (err) {
              setGenerateError(err instanceof Error ? err.message : 'Failed to generate prompt');
            } finally {
              setGenerating(false);
            }
          }}
        >
          {generating ? 'Generating...' : 'Generate Prompt →'}
        </CSButton>
        {generateError && (
          <p className="text-xs mt-1" style={{ color: 'var(--cs-danger)' }}>{generateError}</p>
        )}
      </div>
    </PipelineShell>
  );
};

export default FrameReview;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSButton } from '@/components/ui/CSButton';
import { CSProgressBar } from '@/components/ui/CSProgressBar';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { Film, Search, Zap, Check, ChevronDown } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { loadRecordingBlob, deleteRecordingBlob } from '@/lib/recordingStorage';
import { recordings } from '@/lib/api';

interface Stage {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const stages: Stage[] = [
  { icon: <Film size={20} />, title: 'Extracting key frames', description: 'Detecting UI state changes via SSIM frame differencing', color: 'var(--cs-step-process)' },
  { icon: <Search size={20} />, title: 'Inspecting components', description: 'Running Playwright CLI on each captured URL', color: 'var(--cs-step-review)' },
  { icon: <Zap size={20} />, title: 'Building component map', description: 'Diffing ARIA trees across captured states', color: 'var(--cs-accent)' },
];

const Processing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordingArtifact, cleanupRecording } = useSessionStore();
  const recordingContext = useSessionStore((s) => s.recordingContext);
  const setPipelineStatus = useSessionStore((s) => s.setPipelineStatus);
  const setProcessingResult = useSessionStore((s) => s.setProcessingResult);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const uploadAttempted = useRef(false);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const handleUpload = async () => {
    const artifact = recordingArtifact || (activeSessionId ? await loadRecordingBlob(activeSessionId) : null);
    if (!artifact || !recordingContext) {
      navigate('/app/record/new');
      return;
    }

    setError(null);
    setActiveStage(0);
    setProgress(0);

    const fileSizeMB = (artifact.blob.size / (1024 * 1024)).toFixed(2);
    addLog(`Uploading recording (${fileSizeMB} MB)...`);
    setPipelineStatus('uploading');

    try {
      setActiveStage(0);
      setProgress(30);

      const response = await recordings.upload(artifact.blob, {
        title: recordingContext.title,
        seedUrl: recordingContext.seedUrl,
        notes: recordingContext.notes || undefined,
        agentTarget: recordingContext.agentTarget,
      });

      addLog('Upload complete. Processing...');
      setPipelineStatus('processing');
      setActiveStage(1);
      setProgress(60);

      // Store result
      setProcessingResult(response);

      addLog(`Processing complete in ${response.processingMs}ms`);
      setPipelineStatus('complete');
      setActiveStage(2);
      setProgress(100);

      // Delete IndexedDB artifact (data is now on server)
      if (activeSessionId) {
        await deleteRecordingBlob(activeSessionId);
      }

      // Navigate to review with real session ID
      setTimeout(() => {
        navigate(`/app/record/${response.sessionId}/review`, { replace: true });
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      addLog(`Error: ${message}`);
      setError(message);
      setPipelineStatus('error');
    }
  };

  useEffect(() => {
    if (!uploadAttempted.current) {
      uploadAttempted.current = true;
      handleUpload();
    }
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <PipelineShell currentStep={1} maxWidth={580}>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--cs-text-primary)' }}>
        Analyzing your recording
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
        Usually takes 15–30 seconds.
      </p>

      <div className="flex flex-col gap-4">
        {stages.map((stage, i) => {
          const isComplete = i < activeStage;
          const isActive = i === activeStage;
          const isPending = i > activeStage;

          return (
            <div
              key={i}
              className="flex gap-3 transition-opacity duration-150"
              style={{ opacity: isPending ? 0.4 : 1 }}
            >
              <div className="shrink-0 mt-0.5" style={{ color: isComplete ? 'var(--cs-success)' : stage.color }}>
                {isComplete ? <Check size={20} /> : stage.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>
                    {stage.title}
                  </span>
                  <CSBadge variant={isComplete ? 'success' : isActive ? 'warning' : 'default'}>
                    {isComplete ? 'Complete' : isActive ? 'Processing' : 'Pending'}
                  </CSBadge>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--cs-text-secondary)' }}>
                  {stage.description}
                </p>
                {isActive && (
                  <CSProgressBar value={Math.min(progress, 100)} color={stage.color} className="mt-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live log */}
      <div className="mt-8">
        <button
          onClick={() => setShowLog(!showLog)}
          className="flex items-center gap-1"
        >
          <CSMonoLabel>SHOW LIVE LOG</CSMonoLabel>
          <ChevronDown
            size={12}
            style={{
              color: 'var(--cs-text-muted)',
              transform: showLog ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 150ms',
            }}
          />
        </button>
        {showLog && (
          <div
            ref={logRef}
            className="mt-2 rounded-lg border p-3 overflow-y-auto font-mono text-[11px]"
            style={{
              backgroundColor: 'var(--cs-bg-raised)',
              borderColor: 'var(--cs-border-subtle)',
              maxHeight: 160,
              color: 'var(--cs-text-secondary)',
            }}
          >
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <CSButton variant="ghost" size="sm" style={{ color: 'var(--cs-danger)' }} onClick={() => {
          cleanupRecording();
          navigate('/app');
        }}>
          Cancel and discard →
        </CSButton>
      </div>

      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--cs-danger)' }}>{error}</p>
          <CSButton variant="primary" size="md" onClick={handleUpload}>
            Retry Upload
          </CSButton>
        </div>
      )}
    </PipelineShell>
  );
};

export default Processing;

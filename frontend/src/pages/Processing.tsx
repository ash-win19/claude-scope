import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSButton } from '@/components/ui/CSButton';
import { CSProgressBar } from '@/components/ui/CSProgressBar';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { Film, Zap, Check, ChevronDown, Eye, Globe } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { loadRecordingBlob, deleteRecordingBlob } from '@/lib/recordingStorage';
import { recordings, sessions as sessionsApi } from '@/lib/api';
import type { ProcessingStatus, LaneStatus } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const laneVariant = (s: LaneStatus['status']): 'success' | 'warning' | 'danger' | 'default' => {
  if (s === 'complete') return 'success';
  if (s === 'running') return 'warning';
  if (s === 'error') return 'danger';
  return 'default';
};

const laneLabel = (s: LaneStatus['status']): string => {
  if (s === 'complete') return 'Complete';
  if (s === 'running') return 'Running';
  if (s === 'error') return 'Failed';
  return 'Pending';
};

const Processing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordingArtifact, cleanupRecording } = useSessionStore();
  const recordingContext = useSessionStore((s) => s.recordingContext);
  const setPipelineStatus = useSessionStore((s) => s.setPipelineStatus);
  const setProcessingResult = useSessionStore((s) => s.setProcessingResult);

  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'processing' | 'complete' | 'error'>('processing');
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const uploadAttempted = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useDocumentTitle('Processing');

  const addLog = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Polling
  const startPolling = useCallback((sid: string) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await sessionsApi.status(sid);
        if (res.processingStatus) setStatus(res.processingStatus);
        setSessionStatus(res.sessionStatus);

        if (res.sessionStatus === 'complete') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          addLog(`Processing complete in ${res.processingTime}ms`);
          setPipelineStatus('complete');

          const full = await sessionsApi.get(sid);
          setProcessingResult({
            sessionId: sid,
            status: 'complete',
            title: full.title,
            seedUrl: full.seedUrl ?? '',
            agentTarget: full.agentTarget,
            fileSize: 0,
            mimeType: '',
            prompt: full.prompt,
            frames: full.frames,
            frameCount: full.frameCount,
            urlsInspected: full.urls,
            processingMs: full.processingTime,
            inspection: full.inspectionJson ?? undefined,
          });

          useSessionStore.getState().replaceSessionId(sid);
          if (id) await deleteRecordingBlob(id);

          setTimeout(() => navigate(`/workspace/record/${sid}/review`, { replace: true }), 600);
        }

        if (res.sessionStatus === 'error') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setError(res.lastError ?? 'Processing failed');
          setPipelineStatus('error');
          addLog(`Error: ${res.lastError}`);
        }
      } catch {
        // Polling failure is non-fatal; retry on next interval
      }
    }, 2000);
  }, [id, navigate, setPipelineStatus, setProcessingResult]);

  // Upload
  const handleUpload = async () => {
    const artifact = recordingArtifact || await loadRecordingBlob(id ?? '');
    if (!artifact || !recordingContext) {
      addLog('No recording data found. Redirecting...');
      navigate('/workspace/record/new');
      return;
    }

    setError(null);
    setStatus(null);
    const fileSizeMB = (artifact.blob.size / (1024 * 1024)).toFixed(2);
    addLog(`Uploading recording (${fileSizeMB} MB)...`);
    setPipelineStatus('uploading');

    try {
      const response = await recordings.upload(artifact.blob, {
        title: recordingContext.title,
        seedUrl: recordingContext.seedUrl,
        notes: recordingContext.notes || undefined,
        agentTarget: recordingContext.agentTarget,
      });

      if (response.status !== 'complete') {
        throw new Error(`Server returned status "${response.status}"`);
      }

      setProcessingResult(response);
      useSessionStore.getState().replaceSessionId(response.sessionId);
      setPipelineStatus('complete');
      addLog(`Complete in ${response.processingMs}ms`);
      if (id) await deleteRecordingBlob(id);
      setTimeout(() => navigate(`/workspace/record/${response.sessionId}/review`, { replace: true }), 600);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';

      const body = (err as { body?: { sessionId?: string } })?.body;
      if (body?.sessionId) {
        addLog(`Upload accepted (${body.sessionId}). Monitoring...`);
        startPolling(body.sessionId);
      } else {
        addLog(`Error: ${message}`);
        setError(message);
        setPipelineStatus('error');
      }
    }
  };

  useEffect(() => {
    if (!uploadAttempted.current) {
      uploadAttempted.current = true;
      handleUpload();
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    window.focus();
  }, []);

  const lanes = [
    { key: 'frameExtraction', icon: <Film size={18} />, label: 'Frame Extraction', lane: status?.frameExtraction },
    { key: 'visionLane', icon: <Eye size={18} />, label: 'Vision Analysis', lane: status?.visionLane },
    { key: 'playwrightLane', icon: <Globe size={18} />, label: 'Playwright Inspection', lane: status?.playwrightLane },
    { key: 'synthesis', icon: <Zap size={18} />, label: 'Prompt Synthesis', lane: status?.synthesis },
  ];

  return (
    <PipelineShell currentStep={1} maxWidth={580}>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--cs-text-primary)' }}>
        Analyzing your recording
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
        {status ? `Stage: ${status.overallStage}` : 'Uploading...'}
      </p>

      <div className="flex flex-col gap-3">
        {lanes.map(({ key, icon, label, lane }) => {
          const s = lane?.status ?? 'pending';
          return (
            <div key={key} className="flex gap-3 items-start" style={{ opacity: s === 'pending' ? 0.4 : 1 }}>
              <div className="shrink-0 mt-0.5" style={{ color: s === 'complete' ? 'var(--cs-success)' : s === 'error' ? 'var(--cs-danger)' : 'var(--cs-text-secondary)' }}>
                {s === 'complete' ? <Check size={18} /> : icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>{label}</span>
                  <CSBadge variant={laneVariant(s)}>{laneLabel(s)}</CSBadge>
                </div>
                {lane?.detail && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cs-text-muted)' }}>{lane.detail}</p>
                )}
                {lane?.error && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cs-danger)' }}>{lane.error}</p>
                )}
                {s === 'running' && <CSProgressBar value={50} animated color="var(--cs-accent)" className="mt-1.5" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log viewer */}
      <div className="mt-8">
        <button onClick={() => setShowLog(!showLog)} className="flex items-center gap-1">
          <CSMonoLabel>LIVE LOG</CSMonoLabel>
          <ChevronDown size={12} style={{ color: 'var(--cs-text-muted)', transform: showLog ? 'rotate(180deg)' : '', transition: 'transform 150ms' }} />
        </button>
        {showLog && (
          <div ref={logRef} className="mt-2 rounded-lg border p-3 overflow-y-auto font-mono text-[11px]" style={{ backgroundColor: 'var(--cs-bg-raised)', borderColor: 'var(--cs-border-subtle)', maxHeight: 160, color: 'var(--cs-text-secondary)' }}>
            {logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <CSButton variant="ghost" size="sm" style={{ color: 'var(--cs-danger)' }} onClick={() => { cleanupRecording(); navigate('/workspace'); }}>
          Cancel and discard →
        </CSButton>
      </div>

      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--cs-danger)' }}>{error}</p>
          <CSButton variant="primary" size="md" onClick={() => { uploadAttempted.current = false; handleUpload(); }}>Retry</CSButton>
        </div>
      )}
    </PipelineShell>
  );
};

export default Processing;

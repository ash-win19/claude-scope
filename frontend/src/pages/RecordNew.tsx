import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Globe, FileText, Monitor, Info, Circle } from 'lucide-react';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSToggle } from '@/components/ui/CSToggle';
import { CSProgressBar } from '@/components/ui/CSProgressBar';
import { CSInput } from '@/components/ui/CSInput';
import { CSCard } from '@/components/ui/CSCard';
import { useSessionStore } from '@/store/sessionStore';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const RecordNew: React.FC = () => {
  const navigate = useNavigate();
  const setRecordingContext = useSessionStore((s) => s.setRecordingContext);
  const setRecordingArtifact = useSessionStore((s) => s.setRecordingArtifact);
  const cleanupRecording = useSessionStore((s) => s.cleanupRecording);
  useDocumentTitle('New Recording');
  const [captureId] = useState(() => `capture_${crypto.randomUUID().slice(0, 8)}`);

  const [title, setTitle] = useState('');
  const [seedUrl, setSeedUrl] = useState('');
  const [seedUrlError, setSeedUrlError] = useState('');
  const [notes, setNotes] = useState('');
  const [autoStop, setAutoStop] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);

  const maxSeconds = 30;

  const canStart = title.trim().length > 0 && seedUrl.trim().length > 0 && !seedUrlError;

  const handleSeedUrlBlur = () => {
    const trimmed = seedUrl.trim();
    if (trimmed.length === 0) {
      setSeedUrlError('');
      return;
    }
    if (!isValidUrl(trimmed)) {
      setSeedUrlError('Enter a valid URL starting with http:// or https://');
    } else {
      setSeedUrlError('');
    }
  };

  const startRecording = async () => {
    setError('');

    // Validate
    if (!title.trim()) {
      setError('Recording title is required.');
      return;
    }
    if (!isValidUrl(seedUrl.trim())) {
      setSeedUrlError('Enter a valid URL starting with http:// or https://');
      return;
    }

    // Store context
    setRecordingContext({
      title: title.trim(),
      seedUrl: seedUrl.trim(),
      notes: notes.trim(),
      agentTarget: 'CLAUDE_CODE',
    });

    // Set captureId as active session for IndexedDB
    useSessionStore.getState().startRecording(captureId);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setRecordingArtifact({
          blob,
          mimeType: mediaRecorder.mimeType,
          durationMs: elapsedRef.current * 1000,
        });

        // Stop all tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];

        // Best-effort: try to bring this tab back to focus
        window.focus();
        navigate(`/workspace/record/${captureId}/processing`);
      };

      // Handle user stopping share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch {
      setError('Screen recording permission was denied. Please allow access and try again.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop(); // triggers onstop which navigates
    }
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          elapsedRef.current = next;
          if (autoStop && next >= maxSeconds) {
            stopRecording();
            return prev;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Cleanup on unmount: stop tracks and recorder if still active
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      recorderRef.current = null;
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // ── Recording Active State ──
  if (isRecording) {
    return (
      <PipelineShell currentStep={0} maxWidth={640}>
        <div className="animate-cs-fade-in">
          <CSCard padding="spacious" className="cs-recording-active-card">
            <div className="flex flex-col items-center justify-center py-6">
              {/* Pulsing record indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div
                    className="w-3.5 h-3.5 rounded-full animate-cs-pulse"
                    style={{ backgroundColor: 'var(--cs-step-record)' }}
                  />
                  <div
                    className="absolute inset-0 w-3.5 h-3.5 rounded-full animate-cs-pulse"
                    style={{
                      backgroundColor: 'var(--cs-step-record)',
                      animation: 'cs-pulse 800ms infinite',
                      opacity: 0.4,
                      transform: 'scale(1.8)',
                    }}
                  />
                </div>
                <span
                  className="text-sm font-mono font-semibold tracking-widest"
                  style={{ color: 'var(--cs-step-record)' }}
                >
                  RECORDING
                </span>
              </div>

              {/* Large timer */}
              <span
                className="font-mono text-[56px] sm:text-[64px] font-semibold leading-none tracking-tight"
                style={{ color: 'var(--cs-text-primary)' }}
              >
                {formatTime(elapsed)}
              </span>

              {/* Session title */}
              <p
                className="text-sm mt-3 font-medium truncate max-w-full px-4"
                style={{ color: 'var(--cs-text-secondary)' }}
              >
                {title}
              </p>

              {/* Progress bar */}
              <CSProgressBar value={(elapsed / maxSeconds) * 100} color="var(--cs-step-record)" className="mt-6 w-full" />

              <p className="text-xs mt-3" style={{ color: 'var(--cs-text-muted)' }}>
                Auto-stop at {maxSeconds}s  &middot;  {maxSeconds - elapsed}s remaining
              </p>

              {/* Stop button */}
              <CSButton variant="danger" size="lg" className="mt-8 px-8" onClick={stopRecording}>
                <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: 'currentColor' }} />
                Stop Recording
              </CSButton>
            </div>
          </CSCard>
        </div>
      </PipelineShell>
    );
  }

  // ── Recording Setup Form ──
  return (
    <PipelineShell currentStep={0} maxWidth={640}>
      <div className="animate-cs-fade-in">
        {/* Page header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ backgroundColor: 'var(--cs-accent-muted)' }}
          >
            <Monitor size={22} style={{ color: 'var(--cs-step-record)' }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
            Set up your recording
          </h2>
          <p className="text-sm mt-1.5" style={{ color: 'var(--cs-text-secondary)' }}>
            Capture your screen to generate an AI-ready test prompt.
          </p>
        </div>

        <CSCard padding="spacious">
          {/* Title */}
          <div className="mb-5">
            <CSInput
              label="Recording title"
              placeholder="e.g. Checkout flow bug"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              iconLeft={<Film size={14} />}
              required
            />
          </div>

          {/* Seed URL */}
          <div className="mb-5">
            <CSInput
              label="App URL to inspect"
              placeholder="https://your-app.com/page"
              type="url"
              value={seedUrl}
              onChange={(e) => {
                setSeedUrl(e.target.value);
                if (seedUrlError) setSeedUrlError('');
              }}
              onBlur={handleSeedUrlBlur}
              error={seedUrlError}
              iconLeft={<Globe size={14} />}
              required
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label
              htmlFor="recording-notes"
              className="text-xs font-medium flex items-center gap-1.5 mb-1.5"
              style={{ color: 'var(--cs-text-secondary)' }}
            >
              <FileText size={12} style={{ color: 'var(--cs-text-muted)' }} />
              Notes (optional)
            </label>
            <textarea
              id="recording-notes"
              placeholder="Describe what you want the agent to focus on..."
              value={notes}
              onChange={(e) => {
                if (e.target.value.length <= 500) setNotes(e.target.value);
              }}
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors duration-150 resize-none"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cs-accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cs-border-default)'; }}
            />
            <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>
              {notes.length}/500
            </span>
          </div>

          {/* Divider */}
          <div className="h-px mb-5" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />

          {/* Options */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle size={12} style={{ color: 'var(--cs-text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>
                  Auto-stop at {maxSeconds} seconds
                </span>
              </div>
              <CSToggle checked={autoStop} onCheckedChange={setAutoStop} />
            </div>
          </div>

          {/* Record button */}
          <CSButton
            variant="primary"
            size="lg"
            className="w-full h-12 text-[15px] font-semibold cs-record-btn"
            onClick={startRecording}
            disabled={!canStart}
            style={{
              backgroundColor: canStart ? 'var(--cs-step-record)' : undefined,
              boxShadow: canStart ? '0 4px 14px rgba(224, 48, 48, 0.3)' : undefined,
            }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
              style={{
                backgroundColor: 'currentColor',
                boxShadow: canStart ? '0 0 6px currentColor' : undefined,
              }}
            />
            Start Recording
          </CSButton>

          {error && (
            <p className="text-xs mt-3 text-center" style={{ color: 'var(--cs-danger)' }}>{error}</p>
          )}
        </CSCard>

        {/* Helper text */}
        <div
          className="mt-5 rounded-lg px-4 py-3 flex items-start gap-2.5"
          style={{ backgroundColor: 'var(--cs-accent-muted)' }}
        >
          <Info size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--cs-text-secondary)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>
            Clicking "Start Recording" will prompt you to share your screen. Navigate your app
            while recording and we will capture frames for AI analysis. The recording stays local
            in your browser.
          </p>
        </div>

        {/* Cancel link */}
        <div className="flex justify-center mt-5">
          <button
            className="text-xs transition-colors duration-150 hover:underline"
            style={{ color: 'var(--cs-text-muted)' }}
            onClick={() => {
              cleanupRecording();
              navigate('/workspace');
            }}
          >
            Cancel and discard
          </button>
        </div>
      </div>
    </PipelineShell>
  );
};

export default RecordNew;

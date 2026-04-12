import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSToggle } from '@/components/ui/CSToggle';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSProgressBar } from '@/components/ui/CSProgressBar';
import { CSInput } from '@/components/ui/CSInput';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';

const AGENT_OPTIONS = ['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'] as const;
type AgentTarget = (typeof AGENT_OPTIONS)[number];

const AGENT_LABELS: Record<AgentTarget, string> = {
  CLAUDE_CODE: 'Claude Code',
  CODEX: 'Codex',
  CURSOR: 'Cursor',
  RAW: 'Raw',
};

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
  const { defaultAgent, maxRecordingLength } = useSettingsStore();
  const setRecordingContext = useSessionStore((s) => s.setRecordingContext);
  const setRecordingArtifact = useSessionStore((s) => s.setRecordingArtifact);

  const [title, setTitle] = useState('');
  const [seedUrl, setSeedUrl] = useState('');
  const [seedUrlError, setSeedUrlError] = useState('');
  const [agentTarget, setAgentTarget] = useState<AgentTarget>(defaultAgent);
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
      agentTarget,
    });

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

        navigate('/app/record/sess_01HX8Y/processing');
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

  if (isRecording) {
    return (
      <PipelineShell currentStep={0} maxWidth={640}>
        <CSCard padding="default" style={{ borderColor: 'var(--cs-step-record)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full animate-cs-pulse" style={{ backgroundColor: 'var(--cs-step-record)' }} />
              <span className="text-xs font-mono font-medium" style={{ color: 'var(--cs-text-secondary)' }}>REC</span>
            </div>
            <span className="font-mono text-[28px] font-medium" style={{ color: 'var(--cs-text-primary)' }}>
              {formatTime(elapsed)}
            </span>
            <CSButton variant="danger" size="md" onClick={stopRecording}>
              ■ Stop Recording
            </CSButton>
          </div>
        </CSCard>
        <CSProgressBar value={(elapsed / maxSeconds) * 100} color="var(--cs-step-record)" className="mt-4" />
        <p className="text-xs mt-4 text-center" style={{ color: 'var(--cs-text-muted)' }}>
          Keep recording until you've captured the behavior to describe.
        </p>
      </PipelineShell>
    );
  }

  return (
    <PipelineShell currentStep={0} maxWidth={640}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--cs-text-primary)' }}>
        Set up your recording
      </h2>

      {/* Title */}
      <div className="mb-4">
        <CSInput
          label="Recording title"
          placeholder="e.g. Checkout flow bug"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Seed URL */}
      <div className="mb-4">
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
          required
        />
      </div>

      {/* Agent Target */}
      <div className="mb-4">
        <CSMonoLabel>AGENT TARGET</CSMonoLabel>
        <div className="flex gap-2 mt-2">
          {AGENT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAgentTarget(opt)}
              className="flex-1 h-9 rounded-lg border text-xs font-medium transition-colors duration-150"
              style={{
                backgroundColor: agentTarget === opt ? 'var(--cs-accent)' : 'var(--cs-bg-raised)',
                borderColor: agentTarget === opt ? 'var(--cs-accent)' : 'var(--cs-border-default)',
                color: agentTarget === opt ? '#fff' : 'var(--cs-text-primary)',
              }}
            >
              {AGENT_LABELS[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label
          htmlFor="recording-notes"
          className="text-xs font-medium block mb-1.5"
          style={{ color: 'var(--cs-text-secondary)' }}
        >
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

      {/* Options */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>
            Auto-stop at {maxSeconds} seconds
          </span>
          <CSToggle checked={autoStop} onCheckedChange={setAutoStop} />
        </div>
      </div>

      {/* Record button */}
      <CSButton
        variant="primary"
        size="lg"
        className="w-full"
        onClick={startRecording}
        disabled={!canStart}
        style={{ backgroundColor: canStart ? 'var(--cs-step-record)' : undefined }}
      >
        ● Start Recording
      </CSButton>

      {error && (
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--cs-danger)' }}>{error}</p>
      )}
    </PipelineShell>
  );
};

export default RecordNew;

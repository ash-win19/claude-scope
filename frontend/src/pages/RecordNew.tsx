import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSToggle } from '@/components/ui/CSToggle';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSProgressBar } from '@/components/ui/CSProgressBar';
import { Globe } from 'lucide-react';

const RecordNew: React.FC = () => {
  const navigate = useNavigate();
  const [tabSelected, setTabSelected] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [autoStop, setAutoStop] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxSeconds = 30 * 60;

  const startRecording = async () => {
    setError('');
    try {
      // Mock — in real app would call getDisplayMedia
      setIsRecording(true);
    } catch {
      setError('Screen recording permission was denied. Please allow access and try again.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    navigate('/app/record/sess_01HX8Y/processing');
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (autoStop && prev >= maxSeconds) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

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

      {/* Tab selector */}
      <CSCard
        padding="default"
        className="mb-6"
        style={tabSelected ? { borderColor: 'var(--cs-accent-border)' } : {}}
      >
        <CSMonoLabel>BROWSER TAB</CSMonoLabel>
        <div className="flex items-center gap-3 mt-3">
          <Globe size={16} style={{ color: 'var(--cs-text-muted)' }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>Current Tab</div>
            <div className="text-xs font-mono truncate" style={{ color: 'var(--cs-text-muted)' }}>
              https://your-app.example.com/dashboard
            </div>
          </div>
          <CSButton variant="ghost" size="sm">Change tab ↓</CSButton>
        </div>
      </CSCard>

      {/* Options */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>Record microphone narration</span>
          <CSToggle checked={micEnabled} onCheckedChange={setMicEnabled} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>Auto-stop at 30 minutes</span>
          <CSToggle checked={autoStop} onCheckedChange={setAutoStop} />
        </div>
      </div>

      {/* Record button */}
      <CSButton
        variant="primary"
        size="lg"
        className="w-full"
        onClick={startRecording}
        style={{ backgroundColor: 'var(--cs-step-record)' }}
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

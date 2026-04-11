import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PipelineShell } from '@/components/layout/PipelineShell';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSButton } from '@/components/ui/CSButton';
import { CSProgressBar } from '@/components/ui/CSProgressBar';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { Film, Search, Zap, Check, ChevronDown } from 'lucide-react';

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
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStage < 2) {
            setActiveStage((s) => s + 1);
            return 0;
          } else {
            clearInterval(interval);
            setTimeout(() => navigate(`/app/record/${id}/review`), 500);
            return 100;
          }
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [activeStage]);

  useEffect(() => {
    const logMessages = [
      '[00:00] Starting frame extraction...',
      '[00:01] Captured 12 unique states',
      '[00:02] SSIM threshold: 0.92',
      '[00:03] Frame deduplication complete',
      '[00:05] Launching headless browser...',
      '[00:06] Navigating to /dashboard',
      '[00:08] ARIA snapshot captured',
      '[00:09] Processing /dashboard/settings',
      '[00:11] Building diff tree...',
      '[00:12] 47 components mapped',
      '[00:14] Analysis complete',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logMessages.length) {
        setLogs((prev) => [...prev, logMessages[i]]);
        i++;
      }
    }, 800);
    return () => clearInterval(interval);
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
        <CSButton variant="ghost" size="sm" style={{ color: 'var(--cs-danger)' }} onClick={() => navigate('/app')}>
          Cancel and discard →
        </CSButton>
      </div>
    </PipelineShell>
  );
};

export default Processing;

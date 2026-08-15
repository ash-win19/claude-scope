import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Eye, Film, Globe, Pause, Play, RotateCcw } from 'lucide-react';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { useInView } from '@/lib/useInView';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

type Scene = 'record' | 'extract' | 'analyze' | 'prompt';

const SCENES: { id: Scene; label: string; caption: string; duration: number; color: string }[] = [
  { id: 'record', label: 'Record', caption: 'Capture the bug in the tab — no screenshots', duration: 4500, color: 'var(--cs-step-record)' },
  { id: 'extract', label: 'Extract', caption: 'SSIM keeps the frames that actually changed', duration: 3500, color: 'var(--cs-step-process)' },
  { id: 'analyze', label: 'Analyze', caption: 'Vision and Playwright run in parallel', duration: 5000, color: 'var(--cs-step-review)' },
  { id: 'prompt', label: 'Prompt', caption: 'A structured prompt, ready for your agent', duration: 5500, color: 'var(--cs-step-output)' },
];

const PROMPT_LINES = [
  '# UI Bug: checkout total + CTA overlap',
  '',
  '## Visual observations',
  '- Frame 2 (t=1.8s): Pay now overlaps the tax row at 375px',
  '- Frame 3 (t=3.1s): Total still reads $0.00 with 2 items',
  '',
  '## Accessibility snapshot',
  '- [status] "Total $0.00" — value does not match cart',
  '- [button] "Pay now" — clipped, still focusable',
  '',
  '## Task',
  'Fix CheckoutSummary hydration and stack the CTA on mobile.',
];

export const LiveDemo: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [copied, setCopied] = useState(false);

  const scene = SCENES[sceneIndex];

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = window.setTimeout(() => {
      setSceneIndex((i) => (i + 1) % SCENES.length);
      setCopied(false);
    }, scene.duration);
    return () => window.clearTimeout(timer);
  }, [playing, inView, scene.duration, sceneIndex]);

  const goTo = (i: number) => {
    setSceneIndex(i);
    setCopied(false);
  };

  const markCopied = useCallback(() => setCopied(true), []);

  return (
    <div ref={ref}>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--cs-bg-surface)',
          borderColor: 'var(--cs-border-subtle)',
          boxShadow: '0 32px 90px color-mix(in srgb, var(--cs-bg-base) 60%, transparent)',
        }}
      >
        <div
          className="flex flex-wrap items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-raised)' }}
        >
          <span className="flex gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-danger)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-warning)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-success)' }} />
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
            Claude Scope
          </span>
          <span className="hidden sm:inline text-[11px] font-mono" style={{ color: 'var(--cs-text-muted)' }}>
            checkout-overflow-bug
          </span>
          <div className="ml-auto">
            <MiniStepper current={sceneIndex} />
          </div>
        </div>

        <div className="h-0.5" style={{ backgroundColor: 'var(--cs-border-subtle)' }} aria-hidden>
          <div
            key={scene.id}
            className={`cs-demo-progress ${!playing || !inView ? 'is-paused' : ''}`}
            style={{
              backgroundColor: scene.color,
              animationDuration: `${scene.duration}ms`,
            }}
          />
        </div>

        <div className="relative h-[420px] sm:h-[460px] overflow-hidden" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
          <div key={scene.id} className="h-full">
            {scene.id === 'record' && <RecordScene />}
            {scene.id === 'extract' && <ExtractScene />}
            {scene.id === 'analyze' && <AnalyzeScene />}
            {scene.id === 'prompt' && <PromptScene copied={copied} onCopied={markCopied} />}
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-t"
          style={{ borderColor: 'var(--cs-border-subtle)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: scene.color }}
            />
            <p className="text-sm truncate whitespace-nowrap min-w-0" style={{ color: 'var(--cs-text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--cs-text-primary)' }}>{scene.label}.</span>{' '}
              {scene.caption}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:ml-auto">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${s.label} step`}
                aria-current={i === sceneIndex}
                className="h-11 w-11 sm:h-8 sm:w-8 flex items-center justify-center cursor-pointer rounded-full"
              >
                <span
                  className="block rounded-full transition-transform duration-200"
                  style={{
                    width: i === sceneIndex ? 10 : 7,
                    height: i === sceneIndex ? 10 : 7,
                    backgroundColor: i === sceneIndex ? s.color : 'var(--cs-text-muted)',
                  }}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="ml-1 h-11 px-3 sm:h-8 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{ color: 'var(--cs-text-primary)', backgroundColor: 'var(--cs-bg-overlay)' }}
              aria-pressed={playing}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => { setSceneIndex(0); setCopied(false); setPlaying(!reduced); }}
              className="h-11 w-11 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-lg cursor-pointer"
              style={{ color: 'var(--cs-text-secondary)' }}
              aria-label="Replay demo from the start"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniStepper: React.FC<{ current: number }> = ({ current }) => (
  <div className="hidden md:flex items-center gap-1.5" aria-hidden>
    {['Record', 'Process', 'Review', 'Output'].map((label, i) => {
      const active = i === current;
      const done = i < current;
      return (
        <React.Fragment key={label}>
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: active ? 'var(--cs-text-primary)' : done ? 'var(--cs-success)' : 'var(--cs-text-muted)' }}
          >
            {label}
          </span>
          {i < 3 && (
            <span className="w-4 h-px" style={{ backgroundColor: done ? 'var(--cs-success)' : 'var(--cs-border-default)' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const RecordScene: React.FC = () => (
  <div className="p-5 sm:p-6 h-full">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full cs-rec-pulse" style={{ backgroundColor: 'var(--cs-accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--cs-accent)' }}>REC</span>
        <span className="font-mono text-xs" style={{ color: 'var(--cs-text-muted)' }}>00:07</span>
      </div>
      <CSBadge variant="accent">Tab capture</CSBadge>
    </div>

    <div
      className="relative rounded-xl border overflow-hidden h-[300px] sm:h-[340px]"
      style={{ borderColor: 'var(--cs-border-default)', backgroundColor: 'var(--cs-bg-surface)' }}
    >
      <div className="px-3 py-2 border-b font-mono text-[10px]" style={{ borderColor: 'var(--cs-border-subtle)', color: 'var(--cs-text-muted)' }}>
        checkout.acme.dev/pay
      </div>
      <div className="p-5 grid grid-cols-[1fr_140px] gap-4">
        <div>
          <div className="h-20 rounded-lg mb-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }} />
          <div className="h-3 w-40 rounded mb-2" style={{ backgroundColor: 'var(--cs-bg-overlay)' }} />
          <div className="h-2 w-24 rounded" style={{ backgroundColor: 'var(--cs-bg-raised)' }} />
        </div>
        <div className="relative pt-6">
          <div className="h-2 w-full rounded mb-2" style={{ backgroundColor: 'var(--cs-bg-overlay)' }} />
          <div className="h-2 w-3/4 rounded mb-3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }} />
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--cs-danger)' }}>$0.00</div>
          <div
            className="absolute right-0 top-[72px] rounded-md px-3 py-2 text-[11px] font-semibold"
            style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-on-accent)' }}
          >
            Pay now
          </div>
        </div>
      </div>

      <DemoCursor />
    </div>
  </div>
);

const DemoCursor: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (reduced) {
      setClicked(true);
      return;
    }
    const move = window.setTimeout(() => setClicked(true), 1600);
    return () => window.clearTimeout(move);
  }, [reduced]);

  return (
    <div
      className={`absolute z-10 ${clicked ? 'cs-cursor-click' : ''}`}
      style={{
        top: clicked ? '58%' : '28%',
        left: clicked ? '78%' : '24%',
        transition: reduced ? 'none' : 'top 1.1s cubic-bezier(0.16, 1, 0.3, 1), left 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-hidden
    >
      <svg width="18" height="22" viewBox="0 0 18 22" fill="var(--cs-text-primary)">
        <path d="M1 1 L1 18 L6 13 L10 21 L13 20 L9 12 L16 12 Z" stroke="var(--cs-bg-base)" strokeWidth="1" />
      </svg>
      {clicked && (
        <span
          className="absolute -top-6 left-3 rounded px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap"
          style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-on-accent)' }}
        >
          frame captured
        </span>
      )}
    </div>
  );
};

const FRAMES = [
  { t: '0.4s', ssim: '0.62', label: 'Cart idle' },
  { t: '1.8s', ssim: '0.41', label: 'Items added' },
  { t: '3.1s', ssim: '0.38', label: 'CTA overlap' },
];

const ExtractScene: React.FC = () => (
  <div className="p-5 sm:p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Film size={16} style={{ color: 'var(--cs-step-process)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Keyframe extraction</span>
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--cs-text-muted)' }}>3 kept · 12 discarded</span>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {FRAMES.map((frame, i) => (
        <div
          key={frame.t}
          className="cs-frame-in rounded-xl border overflow-hidden"
          style={{
            borderColor: i === 2 ? 'var(--cs-accent-border)' : 'var(--cs-border-subtle)',
            animationDelay: `${i * 140}ms`,
            backgroundColor: 'var(--cs-bg-surface)',
          }}
        >
          <div className="h-28 sm:h-36 p-3" style={{ backgroundColor: 'var(--cs-bg-raised)' }}>
            <div className="h-8 rounded mb-2" style={{ backgroundColor: 'var(--cs-bg-overlay)', width: `${70 - i * 8}%` }} />
            <div className="h-2 rounded mb-2 w-2/3" style={{ backgroundColor: 'var(--cs-bg-overlay)' }} />
            {i === 2 && (
              <div className="mt-4 ml-auto w-16 h-7 rounded" style={{ backgroundColor: 'var(--cs-accent)' }} />
            )}
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium" style={{ color: 'var(--cs-text-primary)' }}>{frame.label}</p>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--cs-text-muted)' }}>
              t={frame.t} · SSIM {frame.ssim}
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-5">
      <CSMonoLabel>Differencing</CSMonoLabel>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
        <div className="cs-progress-fill h-full rounded-full" style={{ backgroundColor: 'var(--cs-step-process)' }} />
      </div>
    </div>
  </div>
);

const AnalyzeScene: React.FC = () => (
  <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-4 h-full">
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-surface)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" style={{ color: 'var(--cs-teal)' }}>
          <Eye size={14} />
          <CSMonoLabel>Vision lane</CSMonoLabel>
        </div>
        <CSBadge variant="success">Complete</CSBadge>
      </div>
      <div className="relative h-48 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--cs-bg-raised)' }}>
        <div className="absolute left-[8%] top-[18%] w-[42%] h-[28%] rounded border-2" style={{ borderColor: 'var(--cs-teal)' }} />
        <div className="absolute right-[10%] bottom-[22%] w-[32%] h-[18%] rounded border-2" style={{ borderColor: 'var(--cs-accent)' }} />
        <span
          className="absolute left-[8%] top-[10%] font-mono text-[9px] px-1 rounded"
          style={{ backgroundColor: 'var(--cs-teal)', color: 'var(--cs-bg-base)' }}
        >
          product 97%
        </span>
        <span
          className="absolute right-[10%] bottom-[42%] font-mono text-[9px] px-1 rounded"
          style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-on-accent)' }}
        >
          button overlap 94%
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
        <div className="cs-progress-fill h-full rounded-full" style={{ backgroundColor: 'var(--cs-teal)' }} />
      </div>
    </div>

    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-surface)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" style={{ color: 'var(--cs-secondary)' }}>
          <Globe size={14} />
          <CSMonoLabel>Playwright lane</CSMonoLabel>
        </div>
        <CSBadge variant="success">Complete</CSBadge>
      </div>
      <pre
        className="h-48 overflow-hidden rounded-lg p-3 font-mono text-[11px] leading-relaxed"
        style={{ backgroundColor: 'var(--cs-bg-raised)', color: 'var(--cs-text-secondary)' }}
      >
{`- [document] "Checkout"
  - [navigation] "Bag"
  - [status] "In stock"
  - [status] "Total $0.00"  ~
  - [textbox] "Card number"
  - [button] "Pay now"      +`}
      </pre>
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cs-bg-overlay)' }}>
        <div className="cs-progress-fill h-full rounded-full" style={{ backgroundColor: 'var(--cs-secondary)', animationDelay: '200ms' }} />
      </div>
    </div>
  </div>
);

const PromptScene: React.FC<{ copied: boolean; onCopied: () => void }> = ({ copied, onCopied }) => {
  const reduced = usePrefersReducedMotion();
  const full = PROMPT_LINES.join('\n');
  const [chars, setChars] = useState(reduced ? full.length : 0);
  const copiedOnce = React.useRef(false);

  useEffect(() => {
    if (reduced) {
      if (!copiedOnce.current) {
        copiedOnce.current = true;
        const done = window.setTimeout(onCopied, 400);
        return () => window.clearTimeout(done);
      }
      return;
    }
    if (chars >= full.length) {
      if (copiedOnce.current) return;
      copiedOnce.current = true;
      const done = window.setTimeout(onCopied, 700);
      return () => window.clearTimeout(done);
    }
    const step = window.setTimeout(() => setChars((c) => Math.min(full.length, c + 4)), 18);
    return () => window.clearTimeout(step);
  }, [chars, full.length, onCopied, reduced]);

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5">
          {['Claude Code', 'Cursor', 'Codex'].map((agent, i) => (
            <span
              key={agent}
              className="rounded-md px-2 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: i === 0 ? 'var(--cs-accent-muted)' : 'transparent',
                color: i === 0 ? 'var(--cs-accent)' : 'var(--cs-text-muted)',
                border: i === 0 ? '1px solid var(--cs-accent-border)' : '1px solid transparent',
              }}
            >
              {agent}
            </span>
          ))}
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: copied ? 'var(--cs-success)' : 'var(--cs-text-muted)' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy prompt'}
        </span>
      </div>
      <pre
        className="rounded-xl border p-4 font-mono text-[11px] sm:text-xs leading-relaxed overflow-hidden min-h-[300px]"
        style={{
          borderColor: 'var(--cs-border-subtle)',
          backgroundColor: 'var(--cs-bg-raised)',
          color: 'var(--cs-text-secondary)',
        }}
      >
        {full.slice(0, chars)}
        <span className="cs-type-caret" style={{ color: 'var(--cs-accent)' }}>▍</span>
      </pre>
    </div>
  );
};

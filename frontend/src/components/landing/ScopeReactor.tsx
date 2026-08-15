import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Crosshair, Eye, Globe } from 'lucide-react';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

interface InspectTarget {
  id: string;
  role: string;
  name: string;
  issue: string;
  aria: string;
  vision: string;
  prompt: string;
  blip: { angle: number; r: number };
}

const TARGETS: InspectTarget[] = [
  {
    id: 'badge',
    role: 'status',
    name: 'In stock',
    issue: 'Badge says in stock while inventory is 0',
    aria: '[status] "In stock" — live region never updates after cart hydrate',
    vision: 'green pill "In stock" · 97% · top-left of product card',
    prompt: 'The product badge renders "In stock" even when `inventoryCount` is 0. StockBadge reads a stale default instead of the loaded catalog payload.',
    blip: { angle: 312, r: 68 },
  },
  {
    id: 'total',
    role: 'status',
    name: 'Total $0.00',
    issue: 'Cart total stays $0.00 with 2 items',
    aria: '[status] "Total $0.00" — accessible value does not match cart',
    vision: 'text "Total $0.00" · 96% · right column, above CTA',
    prompt: 'CheckoutSummary displays $0.00 after two items are added. It reads `cart.subtotal` before the cart query resolves and never re-renders.',
    blip: { angle: 28, r: 58 },
  },
  {
    id: 'card',
    role: 'textbox',
    name: 'Card number',
    issue: 'Expired card submits with no error',
    aria: '[textbox] "Card number" — aria-invalid="false" after failed Luhn check',
    vision: 'input "•••• 4242" · 91% · no error text in frame',
    prompt: 'PaymentForm allows submit on an expired test card. The Zod schema skips `expYear` and no `role="alert"` is announced.',
    blip: { angle: 214, r: 72 },
  },
  {
    id: 'pay',
    role: 'button',
    name: 'Pay now',
    issue: 'Primary CTA overlaps the tax row at 375px',
    aria: '[button] "Pay now" — focusable but clipped by overflow:hidden',
    vision: 'button overlapping tax label · 94% · bbox collides with "Tax $3.92"',
    prompt: 'On 375px, the Pay now button overlaps the tax row. CheckoutFooter uses a fixed 72px height and does not stack under the summary.',
    blip: { angle: 128, r: 80 },
  },
];

const polar = (angle: number, r: number, cx = 100, cy = 100) => {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export const ScopeReactor: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const labelId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [autoId, setAutoId] = useState('pay');
  const [interacted, setInteracted] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const activeId = locked ?? hovered ?? autoId;
  const active = TARGETS.find((t) => t.id === activeId) ?? TARGETS[3];
  const firing = Boolean(hovered || locked || !reduced);

  const measure = useCallback((id: string) => {
    const el = targetRefs.current[id];
    const stage = stageRef.current;
    if (!el || !stage) return;
    const parent = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBox({
      top: r.top - parent.top,
      left: r.left - parent.left,
      width: r.width,
      height: r.height,
    });
  }, []);

  useEffect(() => {
    measure(activeId);
  }, [activeId, measure]);

  useEffect(() => {
    const onResize = () => measure(activeId);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeId, measure]);

  useEffect(() => {
    if (interacted || reduced) return;
    const timer = window.setInterval(() => {
      setAutoId((current) => {
        const i = TARGETS.findIndex((t) => t.id === current);
        return TARGETS[(i + 1) % TARGETS.length].id;
      });
    }, 2800);
    return () => window.clearInterval(timer);
  }, [interacted, reduced]);

  const takeOver = (id: string, lock = false) => {
    setInteracted(true);
    if (lock) {
      setLocked((prev) => (prev === id ? null : id));
      setHovered(id);
    } else {
      setHovered(id);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Enter' && e.key !== 'Escape') return;
    e.preventDefault();
    setInteracted(true);
    const i = TARGETS.findIndex((t) => t.id === activeId);
    if (e.key === 'ArrowRight') {
      const next = TARGETS[(i + 1) % TARGETS.length].id;
      setLocked(next);
      setHovered(next);
    } else if (e.key === 'ArrowLeft') {
      const next = TARGETS[(i - 1 + TARGETS.length) % TARGETS.length].id;
      setLocked(next);
      setHovered(next);
    } else if (e.key === 'Enter') {
      setLocked((prev) => (prev === activeId ? null : activeId));
    } else if (e.key === 'Escape') {
      setLocked(null);
      setHovered(null);
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--cs-bg-surface)',
        borderColor: 'var(--cs-border-subtle)',
        boxShadow: '0 24px 80px color-mix(in srgb, var(--cs-bg-base) 55%, transparent)',
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 h-11 border-b"
        style={{ borderColor: 'var(--cs-border-subtle)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Crosshair size={14} style={{ color: 'var(--cs-accent)' }} aria-hidden />
          <span className="text-xs font-semibold truncate" style={{ color: 'var(--cs-text-primary)' }}>
            Scope Reactor
          </span>
          <CSBadge variant="accent">Live inspect</CSBadge>
        </div>
        <p className="hidden sm:block text-[11px] truncate" style={{ color: 'var(--cs-text-muted)' }}>
          {interacted ? 'Hover to inspect · click to lock · arrows to cycle' : 'Auto-inspecting a broken checkout — hover to take over'}
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_200px]">
        <div
          ref={stageRef}
          role="group"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-describedby={`${labelId}-hint`}
          onKeyDown={onKeyDown}
          onMouseLeave={() => { if (!locked) setHovered(null); }}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cs-accent)] min-h-[320px]"
          style={{ backgroundColor: 'var(--cs-bg-base)' }}
        >
          <span id={labelId} className="sr-only">Interactive UI inspector</span>
          <p id={`${labelId}-hint`} className="sr-only">
            Hover or tap highlighted checkout elements to inspect them. Use arrow keys to cycle, Enter to lock, Escape to unlock.
          </p>

          {!reduced && (
            <div
              className="cs-scan-line pointer-events-none absolute inset-x-0 h-16 z-[3]"
              style={{
                background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--cs-accent) 22%, transparent), transparent)',
              }}
              aria-hidden
            />
          )}

          <MockCheckout
            activeId={activeId}
            lockedId={locked}
            targetRefs={targetRefs}
            onEnter={takeOver}
            onLeave={() => { if (!locked) setHovered(null); }}
          />

          {box && (
            <div
              className="cs-inspect-box"
              style={{ top: box.top - 4, left: box.left - 4, width: box.width + 8, height: box.height + 8 }}
            >
              <div
                className="absolute -top-7 left-0 flex items-center gap-1.5 rounded-md px-1.5 py-0.5 whitespace-nowrap"
                style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-on-accent)' }}
              >
                <span className="font-mono text-[10px] font-medium">
                  {active.role} “{active.name}”
                </span>
              </div>
            </div>
          )}
        </div>

        <ReactorHud active={active} firing={firing && !reduced} />
      </div>

      <div
        className="border-t px-4 py-3 grid sm:grid-cols-2 gap-3"
        style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-raised)' }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <CSMonoLabel>Issue</CSMonoLabel>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--cs-text-primary)' }}>{active.issue}</p>
        </div>
        <div className="min-w-0">
          <CSMonoLabel>Prompt fragment</CSMonoLabel>
          <p className="text-xs mt-1 font-mono leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>
            {active.prompt}
          </p>
        </div>
      </div>
    </div>
  );
};

interface MockCheckoutProps {
  activeId: string;
  lockedId: string | null;
  targetRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onEnter: (id: string, lock?: boolean) => void;
  onLeave: () => void;
}

const MockCheckout: React.FC<MockCheckoutProps> = ({ activeId, lockedId, targetRefs, onEnter, onLeave }) => (
  <div className="p-4 sm:p-5">
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--cs-border-default)', backgroundColor: 'var(--cs-bg-surface)' }}
    >
      <div
        className="flex items-center gap-2 px-3 h-8 border-b"
        style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-raised)' }}
      >
        <span className="flex gap-1" aria-hidden>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-danger)' }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-warning)' }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-success)' }} />
        </span>
        <span className="flex-1 text-center font-mono text-[10px]" style={{ color: 'var(--cs-text-muted)' }}>
          checkout.acme.dev/pay
        </span>
      </div>

      <div className="p-4 grid sm:grid-cols-[1fr_168px] gap-4">
        <div>
          <div
            className="w-full h-24 rounded-lg mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--cs-bg-overlay), var(--cs-bg-raised))',
              border: '1px solid var(--cs-border-subtle)',
            }}
          />
          <p className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Acme Headphones</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--cs-text-muted)' }}>Midnight Black · Qty 2</p>
          <InspectHit
            id="badge"
            activeId={activeId}
            lockedId={lockedId}
            targetRefs={targetRefs}
            onEnter={onEnter}
            onLeave={onLeave}
            className="mt-2 inline-flex"
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-1"
              style={{ backgroundColor: 'var(--cs-success-muted)', color: 'var(--cs-success)' }}
            >
              In stock
            </span>
          </InspectHit>
        </div>

        <div className="relative min-h-[196px] pb-2">
          <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--cs-text-muted)' }}>Summary</p>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--cs-text-secondary)' }}>
            <span>Subtotal</span><span>$49.00</span>
          </div>
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--cs-text-secondary)' }}>
            <span>Tax $3.92</span>
          </div>
          <InspectHit
            id="total"
            activeId={activeId}
            lockedId={lockedId}
            targetRefs={targetRefs}
            onEnter={onEnter}
            onLeave={onLeave}
            className="w-full"
          >
            <div className="flex justify-between text-sm font-semibold py-1" style={{ color: 'var(--cs-text-primary)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--cs-danger)' }}>$0.00</span>
            </div>
          </InspectHit>
          <InspectHit
            id="card"
            activeId={activeId}
            lockedId={lockedId}
            targetRefs={targetRefs}
            onEnter={onEnter}
            onLeave={onLeave}
            className="w-full mt-2"
          >
            <div
              className="rounded-md border px-2 py-1.5 text-[11px] font-mono"
              style={{ borderColor: 'var(--cs-border-default)', color: 'var(--cs-text-secondary)' }}
            >
              •••• 4242
            </div>
          </InspectHit>
          <InspectHit
            id="pay"
            activeId={activeId}
            lockedId={lockedId}
            targetRefs={targetRefs}
            onEnter={onEnter}
            onLeave={onLeave}
            className="absolute right-0 top-[84px] w-[78%]"
          >
            <div
              className="rounded-md px-3 py-2 text-xs font-semibold text-center"
              style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-on-accent)' }}
            >
              Pay now
            </div>
          </InspectHit>
        </div>
      </div>
    </div>
  </div>
);

interface InspectHitProps {
  id: string;
  activeId: string;
  lockedId: string | null;
  className?: string;
  children: React.ReactNode;
  targetRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  onEnter: (id: string, lock?: boolean) => void;
  onLeave: () => void;
}

const InspectHit: React.FC<InspectHitProps> = ({
  id, activeId, lockedId, className = '', children, targetRefs, onEnter, onLeave,
}) => (
  <button
    type="button"
    ref={(node) => { targetRefs.current[id] = node; }}
    onMouseEnter={() => onEnter(id)}
    onMouseLeave={onLeave}
    onFocus={() => onEnter(id)}
    onClick={() => onEnter(id, true)}
    aria-pressed={lockedId === id}
    className={`cursor-pointer text-left rounded-md min-h-[44px] flex items-center ${className}`}
    style={{
      outline: activeId === id ? 'none' : undefined,
      zIndex: id === 'pay' ? 2 : 1,
    }}
  >
    {children}
  </button>
);

const ReactorHud: React.FC<{ active: InspectTarget; firing: boolean }> = ({ active, firing }) => (
  <aside
    className="border-t lg:border-t-0 lg:border-l px-3 py-4 flex flex-col items-center gap-3"
    style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-raised)' }}
    aria-hidden
  >
    <CSMonoLabel>Dual-lane core</CSMonoLabel>
    <svg viewBox="0 0 200 200" className="w-[160px] h-[160px]" role="img" aria-label="Inspection reactor">
      <defs>
        <radialGradient id="cs-reactor-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--cs-accent)" stopOpacity="0.28" />
          <stop offset="70%" stopColor="var(--cs-bg-raised)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#cs-reactor-core)" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="var(--cs-border-default)" strokeWidth="1" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="var(--cs-secondary)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 7" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="var(--cs-teal)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 6" />

      <g className={`cs-radar-sweep ${firing ? 'cs-radar-sweep-fast' : ''}`}>
        <path d="M100 100 L100 12 A88 88 0 0 1 148 24 Z" fill="var(--cs-accent)" fillOpacity="0.16" />
      </g>

      <g className={`cs-orbit ${firing ? 'cs-orbit-fast' : ''}`}>
        <circle cx="100" cy="30" r="4.5" fill="var(--cs-teal)" />
      </g>
      <g className={`cs-orbit-rev ${firing ? 'cs-orbit-rev-fast' : ''}`}>
        <circle cx="100" cy="12" r="4.5" fill="var(--cs-secondary)" />
      </g>

      {TARGETS.map((t) => {
        const p = polar(t.blip.angle, t.blip.r);
        const on = t.id === active.id;
        return (
          <circle
            key={t.id}
            cx={p.x}
            cy={p.y}
            r={on ? 5 : 3}
            className={on ? 'cs-blip' : undefined}
            fill={on ? 'var(--cs-accent)' : 'var(--cs-text-muted)'}
            opacity={on ? 1 : 0.45}
          />
        );
      })}

      <circle cx="100" cy="100" r="28" fill="var(--cs-bg-surface)" stroke="var(--cs-border-default)" />
      <text x="100" y="97" textAnchor="middle" fill="var(--cs-text-muted)" fontSize="8" fontFamily="ui-monospace, monospace">
        {active.role}
      </text>
      <text x="100" y="110" textAnchor="middle" fill="var(--cs-text-primary)" fontSize="9" fontFamily="ui-monospace, monospace">
        {active.name.length > 12 ? `${active.name.slice(0, 11)}…` : active.name}
      </text>
    </svg>

    <div className="w-full space-y-2">
      <LaneRow icon={<Eye size={12} />} label="Vision" value={active.vision} color="var(--cs-teal)" />
      <LaneRow icon={<Globe size={12} />} label="Playwright" value={active.aria} color="var(--cs-secondary)" />
    </div>
  </aside>
);

const LaneRow: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({
  icon, label, value, color,
}) => (
  <div className="rounded-lg border px-2.5 py-2" style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-surface)' }}>
    <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
      {icon}
      <span className="font-mono text-[10px] uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-[10px] leading-relaxed font-mono" style={{ color: 'var(--cs-text-secondary)' }}>{value}</p>
  </div>
);

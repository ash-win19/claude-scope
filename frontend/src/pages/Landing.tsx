import React from 'react';
import { Link } from 'react-router-dom';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';

const steps = [
  { num: '01', title: 'Record', desc: 'Capture any browser tab with a single click. We detect every UI state change automatically.' },
  { num: '02', title: 'Analyze', desc: 'Each frame is inspected via accessibility snapshots, building a complete component map.' },
  { num: '03', title: 'Prompt', desc: 'Get a structured system prompt ready to paste into Claude Code, Codex, or Cursor.' },
];

const Landing: React.FC = () => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
    {/* Fixed header */}
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-14">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
      </Link>
      <Link to="/auth">
        <CSButton variant="ghost" size="sm">Sign in</CSButton>
      </Link>
    </header>

    {/* Hero */}
    <section className="mx-auto pt-32 pb-16 px-6" style={{ maxWidth: 680 }}>
      <CSMonoLabel>DEVELOPER TOOL · FREE BETA</CSMonoLabel>
      <h1
        className="mt-4 text-[40px] font-semibold leading-tight"
        style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.03em' }}
      >
        Inspect your UI.<br />Prompt your AI.
      </h1>
      <p className="mt-4 text-lg" style={{ color: 'var(--cs-text-secondary)' }}>
        Claude Scope records your screen, maps every component, and writes your Claude Code prompt for you.
      </p>
      <div className="flex items-center gap-3 mt-8">
        <Link to="/auth">
          <CSButton variant="primary" size="lg">Get started free →</CSButton>
        </Link>
        <a href="#how-it-works">
          <CSButton variant="ghost" size="lg">See how it works</CSButton>
        </a>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" className="mx-auto px-6 pb-20" style={{ maxWidth: 680 }}>
      <CSMonoLabel>HOW IT WORKS</CSMonoLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {steps.map((s) => (
          <CSCard key={s.num} padding="default">
            <span className="font-mono text-4xl font-semibold" style={{ color: 'var(--cs-accent)', opacity: 0.35 }}>
              {s.num}
            </span>
            <h3 className="text-base font-semibold mt-3" style={{ color: 'var(--cs-text-primary)' }}>{s.title}</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--cs-text-secondary)' }}>{s.desc}</p>
          </CSCard>
        ))}
      </div>
    </section>

    {/* CTA strip */}
    <section
      className="py-12 px-6"
      style={{ backgroundColor: 'var(--cs-bg-surface)' }}
    >
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: 680 }}>
        <p className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
          Stop describing bugs with words.
        </p>
        <Link to="/auth">
          <CSButton variant="primary" size="lg">Start recording →</CSButton>
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="mx-auto px-6 py-12 flex items-center justify-between" style={{ maxWidth: 680 }}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
        <CSMonoLabel>Built for developers</CSMonoLabel>
      </div>
      <Link to="/auth">
        <CSButton variant="ghost" size="sm">Sign in</CSButton>
      </Link>
    </footer>
  </div>
);

export default Landing;

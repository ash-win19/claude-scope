import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Coffee,
  Crosshair,
  Eye,
  Film,
  Globe,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { ScopeReactor } from '@/components/landing/ScopeReactor';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useThemeStore } from '@/store/themeStore';

const AGENTS = ['Claude Code', 'Cursor', 'Codex', 'Raw markdown'];

const NAV_LINKS = [
  { href: '#reactor', label: 'Try it' },
  { href: '#demo', label: 'Demo' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const Landing: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { setTheme, getResolvedTheme } = useThemeStore();
  useDocumentTitle('');

  const resolved = getResolvedTheme();
  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark');
  const handleSignup = () => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });
  const handleLogin = () => loginWithRedirect();

  return (
    <div className="min-h-dvh overflow-x-hidden" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
        style={{ backgroundColor: 'var(--cs-accent)', color: 'var(--cs-on-accent)' }}
      >
        Skip to content
      </a>

      <header
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b"
        style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-nav-backdrop)' }}
      >
        <div className="mx-auto flex items-center justify-between h-14 px-4 sm:px-6" style={{ maxWidth: 1120 }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium cursor-pointer transition-colors duration-150 text-[var(--cs-text-secondary)] hover:text-[var(--cs-text-primary)]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://claudescope.mintlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium cursor-pointer transition-colors duration-150 text-[var(--cs-text-secondary)] hover:text-[var(--cs-text-primary)]"
            >
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-11 w-11 sm:h-9 sm:w-9 inline-flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-150 text-[var(--cs-text-secondary)] hover:text-[var(--cs-text-primary)]"
              aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolved === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <CSButton variant="ghost" size="sm" onClick={handleLogin}>Sign in</CSButton>
            <CSButton variant="primary" size="sm" onClick={handleSignup}>Get started</CSButton>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
          <div
            className="cs-landing-blob cs-glow-breathe"
            style={{
              width: 420,
              height: 420,
              top: -80,
              left: '50%',
              transform: 'translateX(-40%)',
              background: 'color-mix(in srgb, var(--cs-accent) 22%, transparent)',
            }}
            aria-hidden
          />
          <div
            className="cs-landing-blob cs-glow-breathe"
            style={{
              width: 320,
              height: 320,
              top: 120,
              right: -60,
              background: 'color-mix(in srgb, var(--cs-secondary) 18%, transparent)',
              animationDelay: '1.2s',
            }}
            aria-hidden
          />

          <div className="relative mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-12 items-start" style={{ maxWidth: 1120 }}>
            <div className="cs-hero-rise text-center lg:text-left">
              <CSMonoLabel>Developer tool · Free beta</CSMonoLabel>
              <h1
                className="mt-4 text-[40px] sm:text-[56px] font-semibold leading-[1.08]"
                style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.03em' }}
              >
                Stop describing UI bugs.
                <br />
                <span style={{ color: 'var(--cs-accent)' }}>Record them.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg max-w-xl mx-auto lg:mx-0" style={{ color: 'var(--cs-text-secondary)' }}>
                Claude Scope records your tab, maps every component with vision and accessibility snapshots, and writes the prompt your coding agent can actually act on.
              </p>
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mt-8">
                <CSButton variant="primary" size="lg" onClick={handleSignup} iconRight={<ArrowRight size={16} />}>
                  Start recording free
                </CSButton>
                <a href="#demo">
                  <CSButton variant="secondary" size="lg">Watch it work</CSButton>
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>Works with</span>
                {AGENTS.map((agent) => (
                  <span
                    key={agent}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{ borderColor: 'var(--cs-border-default)', color: 'var(--cs-text-secondary)' }}
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </div>

            <div id="reactor" className="cs-hero-rise scroll-mt-24" style={{ animationDelay: '120ms' }}>
              <ScopeReactor />
            </div>
          </div>
        </section>

        <section id="demo" className="scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: 'var(--cs-bg-surface)' }}>
          <div className="mx-auto" style={{ maxWidth: 1120 }}>
            <div className="max-w-2xl mb-10">
              <CSMonoLabel>Live demo</CSMonoLabel>
              <h2 className="text-[28px] sm:text-[36px] font-semibold mt-3 leading-tight" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
                From a broken checkout to an agent-ready prompt
              </h2>
              <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--cs-text-secondary)' }}>
                Eight seconds of recording. Dual-lane analysis. A prompt you paste into Claude Code, Cursor, or Codex — with frames, ARIA, and the actual bug.
              </p>
            </div>
            <LiveDemo />
          </div>
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="mx-auto" style={{ maxWidth: 1120 }}>
            <div className="max-w-2xl mb-10">
              <CSMonoLabel>The gap</CSMonoLabel>
              <h2 className="text-[28px] sm:text-[36px] font-semibold mt-3 leading-tight" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
                Your agent can’t fix what it can’t see
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <CSCard padding="spacious">
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cs-text-muted)' }}>
                  Without Claude Scope
                </p>
                <p className="text-sm leading-relaxed font-mono" style={{ color: 'var(--cs-text-secondary)' }}>
                  “the pay button on checkout is overlapping the total on mobile and the price shows zero even though there are two headphones in the cart, also the in-stock badge is wrong…”
                </p>
                <p className="text-xs mt-4" style={{ color: 'var(--cs-danger)' }}>12-message thread. Still guessing at selectors.</p>
              </CSCard>
              <CSCard padding="spacious" style={{ borderColor: 'var(--cs-accent-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cs-accent)' }}>
                  With Claude Scope
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--cs-text-primary)' }}>
                  {[
                    'Keyframes of the exact overflow',
                    'ARIA tree with the $0.00 status node',
                    'Vision boxes on the colliding CTA',
                    'A structured prompt, copied in one click',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--cs-success)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CSCard>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 px-4 sm:px-6" style={{ backgroundColor: 'var(--cs-bg-surface)' }}>
          <div className="mx-auto" style={{ maxWidth: 1120 }}>
            <CSMonoLabel>Why it lands</CSMonoLabel>
            <h2 className="text-[28px] sm:text-[36px] font-semibold mt-3 mb-10" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
              Built for the way you already debug
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Film, title: 'Record anything', desc: 'Capture any browser tab. Frame differencing keeps the UI states that matter and drops the rest.', color: 'var(--cs-step-record)' },
                { icon: Eye, title: 'Vision that sees layout', desc: 'Every keyframe is analyzed for elements, overlap, and visual drift — not just a screenshot dump.', color: 'var(--cs-teal)' },
                { icon: Globe, title: 'Playwright ARIA tree', desc: 'A full accessibility snapshot of the URL, so your agent gets structure, not adjectives.', color: 'var(--cs-secondary)' },
                { icon: Zap, title: 'Prompt, instantly', desc: 'Visual timeline and structural inspection merge into one prompt for Claude Code, Cursor, or Codex.', color: 'var(--cs-step-output)' },
                { icon: Crosshair, title: 'Inspect like a scope', desc: 'Hover the reactor to see how dual-lane readout turns a vague bug into a named component.', color: 'var(--cs-accent)' },
                { icon: Check, title: 'Your key, your models', desc: 'Bring your own Anthropic key. Recordings are processed, frames kept, video discarded.', color: 'var(--cs-warning)' },
              ].map((item) => (
                <CSCard key={item.title} padding="default" className="h-full">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--cs-bg-raised)', color: item.color }}
                  >
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>{item.title}</h3>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>{item.desc}</p>
                </CSCard>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6">
          <div className="mx-auto" style={{ maxWidth: 720 }}>
            <CSMonoLabel>How it works</CSMonoLabel>
            <h2 className="text-[28px] sm:text-[36px] font-semibold mt-3 mb-10" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
              Three steps to the prompt
            </h2>
            <ol className="flex flex-col gap-8">
              {[
                { num: '01', title: 'Record your screen', desc: 'Click record, reproduce the bug, stop. Claude Scope extracts key frames with SSIM-based differencing — no manual screenshots.' },
                { num: '02', title: 'Dual-lane analysis', desc: 'Vision AI reads every frame. Playwright inspects the URL and captures the ARIA tree. Both lanes run at once.' },
                { num: '03', title: 'Get your prompt', desc: 'Timeline and structure merge into one prompt. Copy it into Claude Code, Codex, or Cursor and start coding.' },
              ].map((step) => (
                <li key={step.num} className="flex gap-5 sm:gap-6">
                  <span className="font-mono text-3xl font-semibold shrink-0 w-12" style={{ color: 'var(--cs-accent)', opacity: 0.45 }}>
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>{step.title}</h3>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: 'var(--cs-bg-surface)' }}>
          <div className="mx-auto text-center" style={{ maxWidth: 480 }}>
            <CSMonoLabel>Pricing</CSMonoLabel>
            <h2 className="text-[28px] sm:text-[36px] font-semibold mt-3 mb-4" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
              Free during beta
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
              Claude Scope is free while in beta. You bring your own Anthropic API key for vision analysis. Managed processing tiers come after launch.
            </p>
            <CSCard padding="default" style={{ textAlign: 'left' }}>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-semibold" style={{ color: 'var(--cs-text-primary)' }}>$0</span>
                <span className="text-sm" style={{ color: 'var(--cs-text-muted)' }}>/ month during beta</span>
              </div>
              <ul className="flex flex-col gap-2">
                {['Unlimited recordings', 'Vision + Playwright analysis', 'Prompts for Claude Code, Cursor, Codex', 'BYOK — bring your own key'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm" style={{ color: 'var(--cs-text-primary)' }}>
                    <Check size={14} style={{ color: 'var(--cs-success)' }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <CSButton variant="primary" size="lg" className="w-full mt-6" onClick={handleSignup} iconRight={<ArrowRight size={16} />}>
                Get started free
              </CSButton>
            </CSCard>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6">
          <div className="mx-auto" style={{ maxWidth: 640 }}>
            <CSMonoLabel>FAQ</CSMonoLabel>
            <h2 className="text-[28px] sm:text-[36px] font-semibold mt-3 mb-8" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
              Common questions
            </h2>
            {[
              { q: 'What browsers are supported?', a: 'Chrome and Edge support screen recording via getDisplayMedia. Firefox has partial support.' },
              { q: 'Do I need my own API key?', a: 'Yes. Claude Scope uses the Anthropic API for vision analysis. You configure your key in workspace settings.' },
              { q: 'Where are my recordings stored?', a: 'Recording video is processed server-side and discarded after frame extraction. Only extracted frames and analysis results are persisted.' },
              { q: 'Can I use this with Cursor or Codex?', a: 'Yes. The generated prompt works with any AI coding agent. Claude Scope formats it for Claude Code, Codex, Cursor, or raw markdown.' },
              { q: 'Is the reactor on this page the real product?', a: 'It is a live inspect surface that shows the same dual-lane idea — vision plus accessibility — that the recorder produces after a capture. Sign in to record your own tab.' },
            ].map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="border-b" style={{ borderColor: 'var(--cs-border-subtle)' }}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className="flex items-center justify-between w-full text-left min-h-[52px] py-3 cursor-pointer gap-4"
                    >
                      <span className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>{item.q}</span>
                      <ChevronDown
                        size={16}
                        className="shrink-0 transition-transform duration-200"
                        style={{ color: 'var(--cs-text-muted)', transform: open ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm pb-3 leading-relaxed" style={{ color: 'var(--cs-text-secondary)' }}>
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-16 sm:py-20 px-4 sm:px-6 text-center" style={{ backgroundColor: 'var(--cs-bg-surface)' }}>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.02em' }}>
            Stop describing bugs with words.
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--cs-text-secondary)' }}>
            Record the UI. Ship the prompt.
          </p>
          <CSButton variant="primary" size="lg" onClick={handleSignup} iconRight={<ArrowRight size={16} />}>
            Start recording
          </CSButton>
        </section>

        <section className="py-12 px-4 sm:px-6">
          <div
            className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 rounded-xl border p-6"
            style={{ maxWidth: 720, borderColor: 'var(--cs-border-subtle)', backgroundColor: 'var(--cs-bg-surface)' }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: 'var(--cs-warning-muted)' }}>
                <Coffee size={20} style={{ color: 'var(--cs-warning)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Support the project</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--cs-text-secondary)' }}>
                  Enjoying Claude Scope? Buy us a coffee to keep it free and actively maintained.
                </p>
              </div>
            </div>
            <a href="https://buymeacoffee.com/ashwinshanmugam" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <CSButton variant="secondary" size="sm" style={{ borderColor: 'var(--cs-warning)', color: 'var(--cs-warning)' }}>
                <Coffee size={14} />
                Buy me a coffee
              </CSButton>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 sm:px-6" style={{ borderColor: 'var(--cs-border-subtle)' }}>
        <div className="mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ maxWidth: 1120 }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs" aria-label="Footer">
            <a href="#demo" className="cursor-pointer text-[var(--cs-text-muted)] hover:text-[var(--cs-text-primary)] transition-colors duration-150">Demo</a>
            <a href="#pricing" className="cursor-pointer text-[var(--cs-text-muted)] hover:text-[var(--cs-text-primary)] transition-colors duration-150">Pricing</a>
            <a href="https://claudescope.mintlify.app/" target="_blank" rel="noopener noreferrer" className="cursor-pointer text-[var(--cs-text-muted)] hover:text-[var(--cs-text-primary)] transition-colors duration-150">Docs</a>
            <a href="https://github.com/ash-win19/claude-scope" target="_blank" rel="noopener noreferrer" className="cursor-pointer text-[var(--cs-text-muted)] hover:text-[var(--cs-text-primary)] transition-colors duration-150">GitHub</a>
          </nav>
          <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>Inspect your UI. Prompt your AI.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

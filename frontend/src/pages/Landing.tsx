import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { Film, Search, Zap, ChevronDown, Check } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const Landing: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useDocumentTitle('');

  const handleSignup = () => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });
  const handleLogin = () => loginWithRedirect();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cs-bg-base)' }}>

      {/* ── Navigation ── */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b" style={{ borderColor: 'var(--cs-border-subtle)', backgroundColor: 'rgba(18, 18, 18, 0.85)' }}>
        <div className="mx-auto flex items-center justify-between h-14 px-6" style={{ maxWidth: 1080 }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>How it works</a>
            <a href="#pricing" className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>Pricing</a>
            <a href="#faq" className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>FAQ</a>
            <a href="https://claudescope.mintlify.app/" target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--cs-text-secondary)' }}>Docs</a>
          </nav>
          <div className="flex items-center gap-2">
            <CSButton variant="ghost" size="sm" onClick={handleLogin}>Sign in</CSButton>
            <CSButton variant="primary" size="sm" onClick={handleSignup}>Get started</CSButton>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto pt-32 pb-20 px-6 text-center" style={{ maxWidth: 720 }}>
        <CSMonoLabel>DEVELOPER TOOL · FREE BETA</CSMonoLabel>
        <h1 className="mt-4 text-[44px] sm:text-[56px] font-semibold leading-[1.1]" style={{ color: 'var(--cs-text-primary)', letterSpacing: '-0.03em' }}>
          Inspect your UI.<br />Prompt your AI.
        </h1>
        <p className="mt-6 text-lg" style={{ color: 'var(--cs-text-secondary)', maxWidth: 520, margin: '24px auto 0' }}>
          Claude Scope records your screen, maps every component via accessibility snapshots, and writes your coding agent prompt automatically.
        </p>
        <div className="flex items-center justify-center gap-3 mt-10">
          <CSButton variant="primary" size="lg" onClick={handleSignup}>Start recording free →</CSButton>
          <a href="#how-it-works">
            <CSButton variant="ghost" size="lg">Learn more</CSButton>
          </a>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="mx-auto px-6 pb-20" style={{ maxWidth: 900 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Film size={24} />, title: 'Record anything', desc: 'Capture any browser tab. We detect every UI state change automatically using frame differencing.' },
            { icon: <Search size={24} />, title: 'Inspect everything', desc: 'Playwright captures ARIA accessibility snapshots. Vision AI analyzes every frame. Both run in parallel.' },
            { icon: <Zap size={24} />, title: 'Prompt instantly', desc: 'Get a structured system prompt ready for Claude Code, Codex, or Cursor. Copy and paste — done.' },
          ].map((item) => (
            <CSCard key={item.title} padding="default">
              <div style={{ color: 'var(--cs-accent)' }}>{item.icon}</div>
              <h3 className="text-base font-semibold mt-4" style={{ color: 'var(--cs-text-primary)' }}>{item.title}</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--cs-text-secondary)' }}>{item.desc}</p>
            </CSCard>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-6" style={{ backgroundColor: 'var(--cs-bg-surface)' }}>
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <CSMonoLabel>HOW IT WORKS</CSMonoLabel>
          <h2 className="text-[28px] font-semibold mt-3 mb-10" style={{ color: 'var(--cs-text-primary)' }}>Three steps to your prompt</h2>
          <div className="flex flex-col gap-8">
            {[
              { num: '01', title: 'Record your screen', desc: 'Click record, interact with your app, and stop. Claude Scope extracts key frames using SSIM-based frame differencing — no manual screenshots needed.' },
              { num: '02', title: 'Dual-lane analysis', desc: 'Vision AI analyzes each frame for UI elements. Playwright inspects your URL and captures a full ARIA accessibility snapshot. Both run simultaneously.' },
              { num: '03', title: 'Get your prompt', desc: 'The visual timeline and structural inspection are merged into a single prompt. Copy it into Claude Code, Codex, or Cursor and start coding.' },
            ].map((step) => (
              <div key={step.num} className="flex gap-6">
                <span className="font-mono text-3xl font-semibold shrink-0" style={{ color: 'var(--cs-accent)', opacity: 0.4, width: 48 }}>{step.num}</span>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: 'var(--cs-text-primary)' }}>{step.title}</h3>
                  <p className="text-sm mt-1.5" style={{ color: 'var(--cs-text-secondary)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-6">
        <div className="mx-auto text-center" style={{ maxWidth: 480 }}>
          <CSMonoLabel>PRICING</CSMonoLabel>
          <h2 className="text-[28px] font-semibold mt-3 mb-4" style={{ color: 'var(--cs-text-primary)' }}>Free during beta</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
            Claude Scope is free while in beta. You bring your own Anthropic API key for vision analysis. We plan to offer managed processing tiers after launch.
          </p>
          <CSCard padding="default" style={{ textAlign: 'left' }}>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-semibold" style={{ color: 'var(--cs-text-primary)' }}>$0</span>
              <span className="text-sm" style={{ color: 'var(--cs-text-muted)' }}>/ month during beta</span>
            </div>
            <div className="flex flex-col gap-2">
              {['Unlimited recordings', 'Vision + Playwright analysis', 'Prompt generation for all agents', 'BYOK (bring your own key)'].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm" style={{ color: 'var(--cs-text-primary)' }}>
                  <Check size={14} style={{ color: 'var(--cs-success)' }} />
                  {feat}
                </div>
              ))}
            </div>
            <CSButton variant="primary" size="lg" className="w-full mt-6" onClick={handleSignup}>Get started free →</CSButton>
          </CSCard>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6" style={{ backgroundColor: 'var(--cs-bg-surface)' }}>
        <div className="mx-auto" style={{ maxWidth: 640 }}>
          <CSMonoLabel>FAQ</CSMonoLabel>
          <h2 className="text-[28px] font-semibold mt-3 mb-8" style={{ color: 'var(--cs-text-primary)' }}>Common questions</h2>
          {[
            { q: 'What browsers are supported?', a: 'Chrome and Edge support screen recording via getDisplayMedia. Firefox has partial support.' },
            { q: 'Do I need my own API key?', a: 'Yes. Claude Scope uses the Anthropic API for vision analysis. You configure your key in the workspace settings.' },
            { q: 'Where are my recordings stored?', a: 'Recording video is processed server-side and discarded after frame extraction. Only extracted frames and analysis results are persisted.' },
            { q: 'Can I use this with Cursor or Codex?', a: 'Yes. The generated prompt works with any AI coding agent. Claude Scope formats it appropriately regardless of target.' },
          ].map((item, i) => (
            <div key={i} className="border-b py-4" style={{ borderColor: 'var(--cs-border-subtle)' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>{item.q}</span>
                <ChevronDown size={16} style={{ color: 'var(--cs-text-muted)', transform: openFaq === i ? 'rotate(180deg)' : '', transition: 'transform 150ms' }} />
              </button>
              {openFaq === i && (
                <p className="text-sm mt-2" style={{ color: 'var(--cs-text-secondary)' }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--cs-text-primary)' }}>Stop describing bugs with words.</h2>
        <CSButton variant="primary" size="lg" onClick={handleSignup}>Start recording →</CSButton>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-6" style={{ borderColor: 'var(--cs-border-subtle)' }}>
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1080 }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>Built for developers</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSButton } from '@/components/ui/CSButton';
import { useAuthStore } from '@/store/authStore';
import { Github, Eye, EyeOff } from 'lucide-react';

const Auth: React.FC = () => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (tab === 'signin') {
        login(email, password);
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        signup(name, email, password);
      }
      setLoading(false);
      navigate('/app');
    }, 400);
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
      <CSCard padding="spacious" className="w-full" style={{ maxWidth: 400 }}>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--cs-accent)' }} />
            <span className="text-lg font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Claude Scope</span>
          </div>
        </div>

        <div className="h-px mb-6" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />

        {/* Tabs */}
        <div className="flex gap-0 mb-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--cs-bg-raised)' }}>
          {(['signin', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className="flex-1 py-2 text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor: tab === t ? 'var(--cs-bg-overlay)' : 'transparent',
                color: tab === t ? 'var(--cs-text-primary)' : 'var(--cs-text-muted)',
              }}
            >
              {t === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {error && (
          <div
            className="rounded-lg border px-3 py-2 mb-4 text-[13px]"
            style={{
              backgroundColor: 'var(--cs-danger-muted)',
              borderColor: 'var(--cs-danger)',
              color: 'var(--cs-danger)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <CSInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          )}
          <CSInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <CSInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            iconRight={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          {tab === 'signup' && password.length > 0 && (
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className="flex-1 h-[3px] rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      passwordStrength >= level
                        ? level === 1
                          ? 'var(--cs-danger)'
                          : level === 2
                            ? 'var(--cs-warning)'
                            : 'var(--cs-success)'
                        : 'var(--cs-bg-overlay)',
                  }}
                />
              ))}
            </div>
          )}
          {tab === 'signin' && (
            <button
              type="button"
              className="text-xs self-end"
              style={{ color: 'var(--cs-text-muted)' }}
            >
              Forgot password?
            </button>
          )}
          <CSButton variant="primary" size="lg" loading={loading} className="w-full">
            {tab === 'signin' ? 'Sign in' : 'Create account'}
          </CSButton>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />
          <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--cs-border-subtle)' }} />
        </div>

        <CSButton variant="secondary" size="lg" className="w-full" iconLeft={<Github size={16} />}>
          Continue with GitHub
        </CSButton>

        {tab === 'signup' && (
          <p className="text-[11px] text-center mt-4" style={{ color: 'var(--cs-text-muted)' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </CSCard>
    </div>
  );
};

export default Auth;

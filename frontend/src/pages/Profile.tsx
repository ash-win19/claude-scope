import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Sun, Moon, Monitor, LogOut } from 'lucide-react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSToggle } from '@/components/ui/CSToggle';
import { useCSToast } from '@/components/ui/CSToast';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

function getUserInitials(name: string | undefined, email: string | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

type Theme = 'dark' | 'light' | 'system';

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'system', label: 'System', icon: <Monitor size={16} /> },
];

const Profile: React.FC = () => {
  const settings = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useThemeStore();
  const { showToast } = useCSToast();
  const { logout: auth0Logout } = useAuth0();
  const storeLogout = useAuthStore((s) => s.logout);
  useDocumentTitle('Profile');

  const handleLogout = () => {
    storeLogout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <WorkspaceShell maxWidth={640}>
      <PageHeader title="Profile" subtitle="Manage your account, preferences, and settings" />

      {/* Identity */}
      <PageSection>
        <CSCard padding="spacious">
          <div className="flex items-center gap-5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Profile'}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2"
                style={{
                  '--tw-ring-color': 'var(--cs-accent)',
                  '--tw-ring-offset-color': 'var(--cs-bg-surface)',
                } as React.CSSProperties}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold ring-2 ring-offset-2"
                style={{
                  backgroundColor: 'var(--cs-accent)',
                  color: 'var(--cs-on-accent)',
                  '--tw-ring-color': 'var(--cs-accent)',
                  '--tw-ring-offset-color': 'var(--cs-bg-surface)',
                } as React.CSSProperties}
              >
                {getUserInitials(user?.name, user?.email)}
              </div>
            )}
            <div className="flex flex-col min-w-0 gap-0.5">
              <span className="text-lg font-semibold truncate" style={{ color: 'var(--cs-text-primary)' }}>
                {user?.name || 'Unknown user'}
              </span>
              <span className="text-sm truncate" style={{ color: 'var(--cs-text-secondary)' }}>
                {user?.email || ''}
              </span>
            </div>
          </div>
        </CSCard>
      </PageSection>

      {/* Account Details */}
      <PageSection label="ACCOUNT">
        <div className="flex flex-col gap-4">
          <CSInput label="Name" value={user?.name || ''} readOnly />
          <CSInput label="Email" value={user?.email || ''} readOnly hint="Managed by Auth0" />
        </div>
      </PageSection>

      {/* Appearance */}
      <PageSection label="APPEARANCE">
        <div className="flex flex-col gap-4">
          <label className="text-xs font-medium" style={{ color: 'var(--cs-text-secondary)' }}>
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className="flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all duration-150"
                style={{
                  borderColor: theme === opt.value ? 'var(--cs-accent)' : 'var(--cs-border-default)',
                  backgroundColor: theme === opt.value ? 'var(--cs-accent-muted)' : 'var(--cs-bg-raised)',
                  color: theme === opt.value ? 'var(--cs-text-primary)' : 'var(--cs-text-secondary)',
                }}
              >
                {opt.icon}
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </PageSection>

      {/* Output Preferences */}
      <PageSection label="OUTPUT PREFERENCES">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--cs-text-secondary)' }}>
              Default agent target
            </label>
            <select
              value={settings.defaultAgent}
              onChange={(e) => settings.setDefaultAgent(e.target.value as 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW')}
              className="h-9 rounded-lg border px-3 text-sm w-full"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
            >
              <option value="CLAUDE_CODE">Claude Code</option>
              <option value="CODEX">Codex</option>
              <option value="CURSOR">Cursor</option>
              <option value="RAW">Raw</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>Include screenshots</span>
            <CSToggle checked={settings.includeScreenshots} onCheckedChange={settings.setIncludeScreenshots} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>Inline ARIA tree</span>
            <CSToggle checked={settings.inlineAriaTree} onCheckedChange={settings.setInlineAriaTree} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--cs-text-primary)' }}>Include raw DOM diff</span>
            <CSToggle checked={settings.includeRawDiff} onCheckedChange={settings.setIncludeRawDiff} />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--cs-text-secondary)' }}>
              Max recording length
            </label>
            <select
              value={settings.maxRecordingLength}
              onChange={(e) => settings.setMaxRecordingLength(Number(e.target.value))}
              className="h-9 rounded-lg border px-3 text-sm w-full"
              style={{
                backgroundColor: 'var(--cs-bg-raised)',
                borderColor: 'var(--cs-border-default)',
                color: 'var(--cs-text-primary)',
              }}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
      </PageSection>

      {/* Actions */}
      <PageSection>
        <div className="flex items-center justify-between">
          <CSButton variant="secondary" size="sm" iconLeft={<LogOut size={14} />} onClick={handleLogout}>
            Sign out
          </CSButton>
          <CSButton variant="primary" size="sm" onClick={() => showToast('Settings saved', 'success')}>
            Save changes
          </CSButton>
        </div>
      </PageSection>

      {/* Danger Zone */}
      <PageSection label="DANGER ZONE">
        <CSCard
          padding="default"
          style={{
            backgroundColor: 'var(--cs-danger-muted)',
            borderColor: 'var(--cs-danger)',
          }}
        >
          <div className="flex flex-col gap-3">
            <CSButton variant="ghost" size="sm" style={{ color: 'var(--cs-danger)' }}>
              Delete all sessions
            </CSButton>
            <CSButton variant="danger" size="md">
              Delete account
            </CSButton>
          </div>
        </CSCard>
      </PageSection>
    </WorkspaceShell>
  );
};

export default Profile;

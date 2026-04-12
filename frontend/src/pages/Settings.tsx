import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSToggle } from '@/components/ui/CSToggle';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { useCSToast } from '@/components/ui/CSToast';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

function getUserInitials(name: string | undefined, email: string | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

const Settings: React.FC = () => {
  const settings = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useCSToast();
  const { logout: auth0Logout } = useAuth0();
  const storeLogout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    storeLogout();
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <WorkspaceShell maxWidth={640}>
      <h1 className="text-[28px] font-semibold mb-8" style={{ color: 'var(--cs-text-primary)' }}>Settings</h1>

      {/* Output Preferences */}
      <section className="mb-10">
        <CSMonoLabel>OUTPUT PREFERENCES</CSMonoLabel>
        <div className="flex flex-col gap-5 mt-4">
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
      </section>

      {/* Account */}
      <section className="mb-10">
        <CSMonoLabel>ACCOUNT</CSMonoLabel>
        <div className="flex flex-col gap-4 mt-4">
          {/* Profile card */}
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Profile'}
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--cs-accent)',
                  color: 'var(--cs-on-accent, #fff)',
                }}
              >
                {getUserInitials(user?.name, user?.email)}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--cs-text-primary)' }}>
                {user?.name || 'Unknown user'}
              </span>
              <span className="text-xs truncate" style={{ color: 'var(--cs-text-secondary)' }}>
                {user?.email || ''}
              </span>
            </div>
          </div>

          <CSInput label="Name" value={user?.name || ''} readOnly />
          <CSInput label="Email" value={user?.email || ''} readOnly hint="Managed by Auth0" />
          <div className="flex justify-between">
            <CSButton variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </CSButton>
            <CSButton variant="primary" size="sm" onClick={() => showToast('Settings saved', 'success')}>
              Save changes
            </CSButton>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <CSMonoLabel>DANGER ZONE</CSMonoLabel>
        <CSCard
          padding="default"
          className="mt-4"
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
      </section>
    </WorkspaceShell>
  );
};

export default Settings;

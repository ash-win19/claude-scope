import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CSButton } from '@/components/ui/CSButton';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSToggle } from '@/components/ui/CSToggle';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { useCSToast } from '@/components/ui/CSToast';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

const Settings: React.FC = () => {
  const settings = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useCSToast();

  return (
    <AppShell maxWidth={640}>
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
          <CSInput label="Name" value={user?.name || ''} readOnly />
          <CSInput label="Email" value={user?.email || ''} readOnly hint="Connected via GitHub" />
          <div className="flex justify-end">
            <CSButton variant="primary" size="sm" onClick={() => showToast('Settings saved ✓', 'success')}>
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
    </AppShell>
  );
};

export default Settings;

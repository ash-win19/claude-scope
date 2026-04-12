import React, { useState } from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSButton } from '@/components/ui/CSButton';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSBadge } from '@/components/ui/CSBadge';
import { useCSToast } from '@/components/ui/CSToast';
import { Key, Eye, EyeOff } from 'lucide-react';

const ModelAccess: React.FC = () => {
  const { showToast } = useCSToast();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: persist to backend settings endpoint
    setTimeout(() => {
      setSaving(false);
      showToast('API key saved', 'success');
    }, 500);
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 7) + '...' + apiKey.slice(-4)
    : '';

  return (
    <WorkspaceShell maxWidth={640}>
      <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--cs-text-primary)' }}>Model Access</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
        Configure API keys for AI providers used during recording analysis.
      </p>

      {/* Anthropic */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CSMonoLabel>ANTHROPIC</CSMonoLabel>
          <CSBadge variant="success">Active</CSBadge>
        </div>
        <CSCard padding="default">
          <p className="text-sm mb-4" style={{ color: 'var(--cs-text-secondary)' }}>
            Used for vision analysis of recorded frames. Required for processing.
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <CSInput
                label="API Key"
                placeholder="sk-ant-..."
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                iconRight={
                  <button onClick={() => setShowKey(!showKey)} className="p-0.5">
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <CSButton variant="primary" size="sm" onClick={handleSave} loading={saving}>
              Save key
            </CSButton>
          </div>
        </CSCard>
      </section>

      {/* Future providers */}
      <section>
        <CSMonoLabel>OTHER PROVIDERS</CSMonoLabel>
        <p className="text-xs mt-2" style={{ color: 'var(--cs-text-muted)' }}>
          Support for OpenAI, Google, and other providers is planned.
        </p>
      </section>
    </WorkspaceShell>
  );
};

export default ModelAccess;

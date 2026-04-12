import React, { useEffect, useState } from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSButton } from '@/components/ui/CSButton';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';
import { CSBadge } from '@/components/ui/CSBadge';
import { CSToggle } from '@/components/ui/CSToggle';
import { useCSToast } from '@/components/ui/CSToast';
import { credentials, type Credential } from '@/lib/api';
import { Key, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const PROVIDERS = ['Anthropic', 'OpenAI', 'Google'] as const;

const ModelAccess: React.FC = () => {
  const { showToast } = useCSToast();
  const [creds, setCreds] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [provider, setProvider] = useState<string>(PROVIDERS[0]);
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCredentials = async () => {
    try {
      const data = await credentials.list();
      setCreds(data);
    } catch {
      showToast('Failed to load credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleSave = async () => {
    if (!label.trim() || !apiKey.trim()) {
      showToast('Label and API key are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const created = await credentials.create({ provider, label: label.trim(), apiKey: apiKey.trim() });
      setCreds((prev) => [...prev, created]);
      setLabel('');
      setApiKey('');
      setShowForm(false);
      showToast('API key saved', 'success');
    } catch {
      showToast('Failed to save credential', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cred: Credential) => {
    try {
      const updated = await credentials.update(cred.id, { isActive: !cred.isActive });
      setCreds((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      showToast('Failed to update credential', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await credentials.remove(id);
      setCreds((prev) => prev.filter((c) => c.id !== id));
      showToast('Credential deleted', 'success');
    } catch {
      showToast('Failed to delete credential', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <WorkspaceShell maxWidth={640}>
      <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--cs-text-primary)' }}>Model Access</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
        Configure API keys for AI providers used during recording analysis.
      </p>

      {/* Saved credentials */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <CSMonoLabel>SAVED KEYS</CSMonoLabel>
          <CSButton variant="secondary" size="sm" iconLeft={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>
            Add API Key
          </CSButton>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--cs-text-muted)' }}>Loading...</p>
        ) : creds.length === 0 && !showForm ? (
          <CSCard padding="default">
            <div className="flex flex-col items-center py-6 gap-2">
              <Key size={24} style={{ color: 'var(--cs-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--cs-text-muted)' }}>
                No API keys configured yet. Add one to get started.
              </p>
            </div>
          </CSCard>
        ) : (
          <div className="flex flex-col gap-3">
            {creds.map((cred) => (
              <CSCard key={cred.id} padding="default">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--cs-text-primary)' }}>
                        {cred.label}
                      </span>
                      <CSBadge variant={cred.isActive ? 'success' : 'default'}>
                        {cred.isActive ? 'Active' : 'Inactive'}
                      </CSBadge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--cs-text-muted)' }}>{cred.provider}</span>
                      <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--cs-bg-overlay)', color: 'var(--cs-text-secondary)' }}>
                        {cred.maskedKey}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <CSToggle
                      checked={cred.isActive}
                      onCheckedChange={() => handleToggleActive(cred)}
                    />
                    <CSButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cred.id)}
                      loading={deletingId === cred.id}
                      aria-label="Delete credential"
                    >
                      <Trash2 size={14} style={{ color: 'var(--cs-danger)' }} />
                    </CSButton>
                  </div>
                </div>
              </CSCard>
            ))}
          </div>
        )}
      </section>

      {/* Add credential form */}
      {showForm && (
        <section className="mb-8">
          <CSMonoLabel>NEW API KEY</CSMonoLabel>
          <CSCard padding="default" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--cs-text-secondary)' }}>
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full h-9 rounded-lg border px-3 text-sm outline-none transition-colors duration-150"
                  style={{
                    backgroundColor: 'var(--cs-bg-raised)',
                    borderColor: 'var(--cs-border-default)',
                    color: 'var(--cs-text-primary)',
                  }}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <CSInput
                label="Label"
                placeholder="e.g. Production key"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />

              <CSInput
                label="API Key"
                placeholder="sk-..."
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                iconRight={
                  <button onClick={() => setShowKey(!showKey)} className="p-0.5">
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />

              <div className="flex justify-end gap-2 mt-2">
                <CSButton variant="ghost" size="sm" onClick={() => { setShowForm(false); setLabel(''); setApiKey(''); }}>
                  Cancel
                </CSButton>
                <CSButton variant="primary" size="sm" onClick={handleSave} loading={saving}>
                  Save key
                </CSButton>
              </div>
            </div>
          </CSCard>
        </section>
      )}
    </WorkspaceShell>
  );
};

export default ModelAccess;

import React, { useState } from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSButton } from '@/components/ui/CSButton';
import { CSBadge } from '@/components/ui/CSBadge';
import { useCSToast } from '@/components/ui/CSToast';
import { useProviderStore, PROVIDERS } from '@/store/providerStore';
import { Eye, EyeOff, ExternalLink, Image, Check, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const ModelAccess: React.FC = () => {
  const { showToast } = useCSToast();
  const { keys, activeProviderId, activeModelId, setKey, removeKey, setActiveProvider, setActiveModel } = useProviderStore();
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  useDocumentTitle('Model Access');

  const maskKey = (key: string) => key.length > 12 ? key.slice(0, 7) + '...' + key.slice(-4) : '••••••••';

  const handleSaveKey = (providerId: string) => {
    if (!keyInput.trim()) return;
    setKey(providerId, keyInput.trim());
    setEditingProvider(null);
    setKeyInput('');
    setShowKey(false);
    showToast('API key saved', 'success');
  };

  return (
    <WorkspaceShell maxWidth={720}>
      <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--cs-text-primary)' }}>Model Access</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--cs-text-secondary)' }}>
        Configure API keys and select which provider and model to use for vision analysis.
      </p>

      <div className="flex flex-col gap-4">
        {PROVIDERS.map((provider) => {
          const hasKey = !!keys[provider.id];
          const isActive = activeProviderId === provider.id;
          const isEditing = editingProvider === provider.id;

          return (
            <CSCard key={provider.id} padding="default" style={isActive ? { borderColor: 'var(--cs-accent-border)' } : {}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>{provider.name}</span>
                  {hasKey && <CSBadge variant="success">Key saved</CSBadge>}
                  {isActive && <CSBadge variant="accent">Active</CSBadge>}
                </div>
                <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: 'var(--cs-text-muted)' }}>
                  Docs <ExternalLink size={10} />
                </a>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {provider.models.map((model) => {
                  const isModelActive = activeModelId === model.id && isActive;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        if (hasKey) {
                          setActiveProvider(provider.id);
                          setActiveModel(model.id);
                        }
                      }}
                      disabled={!hasKey}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors"
                      style={{
                        borderColor: isModelActive ? 'var(--cs-accent)' : 'var(--cs-border-default)',
                        backgroundColor: isModelActive ? 'var(--cs-accent-muted)' : 'var(--cs-bg-raised)',
                        color: hasKey ? 'var(--cs-text-primary)' : 'var(--cs-text-muted)',
                        cursor: hasKey ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {model.name}
                      {model.supportsImages && <Image size={10} style={{ color: 'var(--cs-success)' }} />}
                      {isModelActive && <Check size={10} style={{ color: 'var(--cs-accent)' }} />}
                    </button>
                  );
                })}
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CSInput
                      placeholder={provider.keyPlaceholder}
                      type={showKey ? 'text' : 'password'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      iconRight={
                        <button onClick={() => setShowKey(!showKey)} className="p-0.5">
                          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                  </div>
                  <CSButton variant="primary" size="sm" onClick={() => handleSaveKey(provider.id)}>Save</CSButton>
                  <CSButton variant="ghost" size="sm" onClick={() => { setEditingProvider(null); setKeyInput(''); setShowKey(false); }}>Cancel</CSButton>
                </div>
              ) : hasKey ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: 'var(--cs-text-muted)' }}>{maskKey(keys[provider.id])}</span>
                  <div className="flex gap-2">
                    <CSButton variant="ghost" size="sm" onClick={() => { setEditingProvider(provider.id); setKeyInput(keys[provider.id]); }}>
                      Update key
                    </CSButton>
                    <CSButton variant="ghost" size="sm" style={{ color: 'var(--cs-danger)' }} onClick={() => { removeKey(provider.id); showToast('Key removed', 'info'); }}>
                      <Trash2 size={12} />
                    </CSButton>
                  </div>
                </div>
              ) : (
                <CSButton variant="secondary" size="sm" onClick={() => setEditingProvider(provider.id)}>
                  Add API key
                </CSButton>
              )}
            </CSCard>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: 'var(--cs-text-muted)' }}>
        <div className="flex items-center gap-1"><Image size={10} style={{ color: 'var(--cs-success)' }} /> Supports image input</div>
        <div className="flex items-center gap-1"><Check size={10} style={{ color: 'var(--cs-accent)' }} /> Currently selected</div>
      </div>
    </WorkspaceShell>
  );
};

export default ModelAccess;

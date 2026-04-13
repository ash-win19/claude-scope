import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { CSCard } from '@/components/ui/CSCard';
import { CSInput } from '@/components/ui/CSInput';
import { CSButton } from '@/components/ui/CSButton';
import { CSBadge } from '@/components/ui/CSBadge';
import { useCSToast } from '@/components/ui/CSToast';
import { useProviderStore, PROVIDERS } from '@/store/providerStore';
import { credentials as credentialsApi, Credential, ApiError } from '@/lib/api';
import { Eye, EyeOff, ExternalLink, Image, Check, Trash2, Shield, Loader2 } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const ModelAccess: React.FC = () => {
  const { showToast } = useCSToast();
  const {
    savedCredentials,
    activeProviderId,
    activeModelId,
    setSavedCredential,
    removeSavedCredential,
    setActiveProvider,
    setActiveModel,
  } = useProviderStore();

  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<string | null>(null);
  useDocumentTitle('Model Access');

  /** Fetch credentials from backend on mount and sync into the store. */
  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const creds = await credentialsApi.list();
      // Sync backend state into local store
      // First, build a set of providers that have credentials on the backend
      const backendProviders = new Set<string>();
      for (const cred of creds) {
        backendProviders.add(cred.provider);
        setSavedCredential(cred.provider, cred.id, cred.maskedKey);
      }
      // Remove any local references that no longer exist on the backend
      for (const providerId of Object.keys(savedCredentials)) {
        if (!backendProviders.has(providerId)) {
          removeSavedCredential(providerId);
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Auth redirect handled by api.ts
        return;
      }
      showToast('Failed to load saved credentials', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleSaveKey = async (providerId: string) => {
    const trimmedKey = keyInput.trim();
    if (!trimmedKey) return;

    setSavingProvider(providerId);
    try {
      const existing = savedCredentials[providerId];

      let cred: Credential;
      if (existing) {
        // Update existing credential
        cred = await credentialsApi.update(existing.credentialId, { apiKey: trimmedKey });
        showToast('API key updated securely on server', 'success');
      } else {
        // Create new credential
        const provider = PROVIDERS.find((p) => p.id === providerId);
        cred = await credentialsApi.create({
          provider: providerId,
          label: provider?.name ?? providerId,
          apiKey: trimmedKey,
        });
        showToast('API key saved securely on server', 'success');
      }

      setSavedCredential(providerId, cred.id, cred.maskedKey);
      setEditingProvider(null);
      setKeyInput('');
      setShowKey(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save API key';
      showToast(message, 'error');
    } finally {
      setSavingProvider(null);
    }
  };

  const handleDeleteKey = async (providerId: string) => {
    const existing = savedCredentials[providerId];
    if (!existing) return;

    setDeletingProvider(providerId);
    try {
      await credentialsApi.remove(existing.credentialId);
      removeSavedCredential(providerId);
      showToast('API key removed', 'info');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to remove API key';
      showToast(message, 'error');
    } finally {
      setDeletingProvider(null);
    }
  };

  return (
    <WorkspaceShell maxWidth={720}>
      <PageHeader title="Model Access" subtitle="Configure API keys and select which provider and model to use for vision analysis." />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--cs-text-muted)' }} />
          <span className="ml-2 text-sm" style={{ color: 'var(--cs-text-muted)' }}>Loading credentials...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {PROVIDERS.map((provider) => {
            const credential = savedCredentials[provider.id];
            const hasKey = !!credential;
            const isActive = activeProviderId === provider.id;
            const isEditing = editingProvider === provider.id;
            const isSaving = savingProvider === provider.id;
            const isDeleting = deletingProvider === provider.id;

            return (
              <CSCard key={provider.id} padding="default" style={isActive ? { borderColor: 'var(--cs-accent-border)' } : {}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--cs-text-primary)' }}>{provider.name}</span>
                    {hasKey && (
                      <CSBadge variant="success">
                        <span className="flex items-center gap-1">
                          <Shield size={10} />
                          Secured
                        </span>
                      </CSBadge>
                    )}
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
                    <CSButton variant="primary" size="sm" onClick={() => handleSaveKey(provider.id)} disabled={isSaving || !keyInput.trim()}>
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                    </CSButton>
                    <CSButton variant="ghost" size="sm" onClick={() => { setEditingProvider(null); setKeyInput(''); setShowKey(false); }} disabled={isSaving}>
                      Cancel
                    </CSButton>
                  </div>
                ) : hasKey ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: 'var(--cs-text-muted)' }}>{credential.maskedKey}</span>
                    <div className="flex gap-2">
                      <CSButton variant="ghost" size="sm" onClick={() => { setEditingProvider(provider.id); setKeyInput(''); }}>
                        Update key
                      </CSButton>
                      <CSButton
                        variant="ghost"
                        size="sm"
                        style={{ color: 'var(--cs-danger)' }}
                        onClick={() => handleDeleteKey(provider.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
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
      )}

      <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: 'var(--cs-text-muted)' }}>
        <div className="flex items-center gap-1"><Image size={10} style={{ color: 'var(--cs-success)' }} /> Supports image input</div>
        <div className="flex items-center gap-1"><Check size={10} style={{ color: 'var(--cs-accent)' }} /> Currently selected</div>
        <div className="flex items-center gap-1"><Shield size={10} style={{ color: 'var(--cs-success)' }} /> Encrypted on server</div>
      </div>
    </WorkspaceShell>
  );
};

export default ModelAccess;

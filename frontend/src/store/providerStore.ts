import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelInfo {
  id: string;
  name: string;
  supportsImages: boolean;
}

export interface ProviderConfig {
  id: string;
  name: string;
  keyPrefix: string;
  keyPlaceholder: string;
  models: ModelInfo[];
  docsUrl: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-api03-...',
    docsUrl: 'https://docs.anthropic.com/en/api/getting-started',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', supportsImages: true },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', supportsImages: true },
      { id: 'claude-haiku-3-5-20241022', name: 'Claude Haiku 3.5', supportsImages: true },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', supportsImages: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', supportsImages: true },
      { id: 'o3', name: 'o3', supportsImages: false },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    keyPrefix: 'AI',
    keyPlaceholder: 'AIza...',
    docsUrl: 'https://ai.google.dev/docs',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', supportsImages: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', supportsImages: true },
    ],
  },
];

/** Maps provider id -> backend credential id (if one exists). */
export type CredentialMap = Record<string, { credentialId: string; maskedKey: string }>;

interface ProviderState {
  /** Provider id -> credential info from backend. No plaintext keys stored. */
  savedCredentials: CredentialMap;
  activeProviderId: string;
  activeModelId: string;
  setSavedCredential: (providerId: string, credentialId: string, maskedKey: string) => void;
  removeSavedCredential: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
  setActiveModel: (modelId: string) => void;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      savedCredentials: {},
      activeProviderId: 'anthropic',
      activeModelId: 'claude-sonnet-4-20250514',
      setSavedCredential: (providerId, credentialId, maskedKey) =>
        set((s) => ({
          savedCredentials: { ...s.savedCredentials, [providerId]: { credentialId, maskedKey } },
        })),
      removeSavedCredential: (providerId) =>
        set((s) => {
          const next = { ...s.savedCredentials };
          delete next[providerId];
          return { savedCredentials: next };
        }),
      setActiveProvider: (providerId) => set({ activeProviderId: providerId }),
      setActiveModel: (modelId) => set({ activeModelId: modelId }),
    }),
    {
      name: 'cs-providers',
      // Migrate from old schema that stored plaintext keys
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        // If the old `keys` field exists, drop it — those were plaintext keys
        if (state && typeof state === 'object' && 'keys' in state) {
          delete state.keys;
        }
        // Ensure savedCredentials exists
        if (!state.savedCredentials) {
          state.savedCredentials = {};
        }
        return state as ProviderState;
      },
      version: 1,
    }
  )
);

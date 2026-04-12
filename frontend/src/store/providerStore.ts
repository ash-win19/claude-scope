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

interface ProviderState {
  keys: Record<string, string>;
  activeProviderId: string;
  activeModelId: string;
  setKey: (providerId: string, key: string) => void;
  removeKey: (providerId: string) => void;
  setActiveProvider: (providerId: string) => void;
  setActiveModel: (modelId: string) => void;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      keys: {},
      activeProviderId: 'anthropic',
      activeModelId: 'claude-sonnet-4-20250514',
      setKey: (providerId, key) =>
        set((s) => ({ keys: { ...s.keys, [providerId]: key } })),
      removeKey: (providerId) =>
        set((s) => {
          const next = { ...s.keys };
          delete next[providerId];
          return { keys: next };
        }),
      setActiveProvider: (providerId) => set({ activeProviderId: providerId }),
      setActiveModel: (modelId) => set({ activeModelId: modelId }),
    }),
    { name: 'cs-providers' }
  )
);

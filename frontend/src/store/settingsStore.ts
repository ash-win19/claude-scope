import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultAgent: 'claude' | 'codex' | 'cursor' | 'raw';
  includeScreenshots: boolean;
  inlineAriaTree: boolean;
  includeRawDiff: boolean;
  maxRecordingLength: number;
  setDefaultAgent: (agent: SettingsState['defaultAgent']) => void;
  setIncludeScreenshots: (v: boolean) => void;
  setInlineAriaTree: (v: boolean) => void;
  setIncludeRawDiff: (v: boolean) => void;
  setMaxRecordingLength: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultAgent: 'claude',
      includeScreenshots: true,
      inlineAriaTree: true,
      includeRawDiff: false,
      maxRecordingLength: 30,
      setDefaultAgent: (agent) => set({ defaultAgent: agent }),
      setIncludeScreenshots: (v) => set({ includeScreenshots: v }),
      setInlineAriaTree: (v) => set({ inlineAriaTree: v }),
      setIncludeRawDiff: (v) => set({ includeRawDiff: v }),
      setMaxRecordingLength: (v) => set({ maxRecordingLength: v }),
    }),
    { name: 'cs-settings' }
  )
);

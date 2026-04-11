import { create } from 'zustand';

export interface ARIANode {
  role: string;
  name: string;
  children?: ARIANode[];
  diffStatus?: 'added' | 'changed' | 'removed';
}

export interface Frame {
  id: string;
  timestamp: number;
  url: string;
  thumbnailUrl: string;
  diffSummary: { added: number; changed: number; removed: number };
  ariaTree: ARIANode[];
}

export interface Session {
  id: string;
  title: string;
  status: 'processing' | 'complete' | 'error';
  duration: number;
  frameCount: number;
  urls: string[];
  createdAt: string;
  processingTime: number;
  prompt: string;
  frames: Frame[];
}

interface SessionState {
  isRecording: boolean;
  elapsedTime: number;
  activeSessionId: string | null;
  processingStage: number;
  processingPercent: number;
  startRecording: (sessionId: string) => void;
  stopRecording: () => void;
  setElapsedTime: (t: number) => void;
  setProcessingStage: (stage: number) => void;
  setProcessingPercent: (percent: number) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isRecording: false,
  elapsedTime: 0,
  activeSessionId: null,
  processingStage: 0,
  processingPercent: 0,
  startRecording: (sessionId) => set({ isRecording: true, activeSessionId: sessionId, elapsedTime: 0 }),
  stopRecording: () => set({ isRecording: false }),
  setElapsedTime: (t) => set({ elapsedTime: t }),
  setProcessingStage: (stage) => set({ processingStage: stage }),
  setProcessingPercent: (percent) => set({ processingPercent: percent }),
  reset: () => set({ isRecording: false, elapsedTime: 0, activeSessionId: null, processingStage: 0, processingPercent: 0 }),
}));

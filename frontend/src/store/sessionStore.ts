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
  recordingContext: {
    title: string;
    seedUrl: string;
    notes: string;
    agentTarget: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  } | null;
  recordingArtifact: {
    blob: Blob;
    mimeType: string;
    durationMs: number;
  } | null;
  startRecording: (sessionId: string) => void;
  stopRecording: () => void;
  setElapsedTime: (t: number) => void;
  setProcessingStage: (stage: number) => void;
  setProcessingPercent: (percent: number) => void;
  setRecordingContext: (ctx: SessionState['recordingContext']) => void;
  clearRecordingContext: () => void;
  setRecordingArtifact: (artifact: SessionState['recordingArtifact']) => void;
  clearRecordingArtifact: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isRecording: false,
  elapsedTime: 0,
  activeSessionId: null,
  processingStage: 0,
  processingPercent: 0,
  recordingContext: null,
  recordingArtifact: null,
  startRecording: (sessionId) => set({ isRecording: true, activeSessionId: sessionId, elapsedTime: 0 }),
  stopRecording: () => set({ isRecording: false }),
  setElapsedTime: (t) => set({ elapsedTime: t }),
  setProcessingStage: (stage) => set({ processingStage: stage }),
  setProcessingPercent: (percent) => set({ processingPercent: percent }),
  setRecordingContext: (ctx) => set({ recordingContext: ctx }),
  clearRecordingContext: () => set({ recordingContext: null }),
  setRecordingArtifact: (artifact) => set({ recordingArtifact: artifact }),
  clearRecordingArtifact: () => set({ recordingArtifact: null }),
  reset: () => set({ isRecording: false, elapsedTime: 0, activeSessionId: null, processingStage: 0, processingPercent: 0, recordingContext: null, recordingArtifact: null }),
}));

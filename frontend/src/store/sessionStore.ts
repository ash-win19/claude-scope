import { create } from 'zustand';
import { saveRecordingBlob, deleteRecordingBlob } from '@/lib/recordingStorage';

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
  pipelineStatus: 'idle' | 'recording' | 'captured' | 'uploading' | 'processing' | 'complete' | 'error';
  setPipelineStatus: (status: SessionState['pipelineStatus']) => void;
  setRecordingArtifact: (artifact: SessionState['recordingArtifact']) => void;
  clearRecordingArtifact: () => void;
  cleanupRecording: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isRecording: false,
  elapsedTime: 0,
  activeSessionId: null,
  processingStage: 0,
  processingPercent: 0,
  recordingContext: null,
  recordingArtifact: null,
  pipelineStatus: 'idle',
  startRecording: (sessionId) => set({ isRecording: true, activeSessionId: sessionId, elapsedTime: 0, pipelineStatus: 'recording' }),
  stopRecording: () => set({ isRecording: false, pipelineStatus: 'captured' }),
  setElapsedTime: (t) => set({ elapsedTime: t }),
  setProcessingStage: (stage) => set({ processingStage: stage }),
  setProcessingPercent: (percent) => set({ processingPercent: percent }),
  setRecordingContext: (ctx) => set({ recordingContext: ctx }),
  clearRecordingContext: () => set({ recordingContext: null }),
  setPipelineStatus: (status) => set({ pipelineStatus: status }),
  setRecordingArtifact: (artifact) => {
    set({ recordingArtifact: artifact });
    if (artifact) {
      const id = get().activeSessionId || crypto.randomUUID();
      saveRecordingBlob(id, artifact.blob, { mimeType: artifact.mimeType, durationMs: artifact.durationMs });
    }
  },
  clearRecordingArtifact: () => set({ recordingArtifact: null }),
  cleanupRecording: () => {
    const sessionId = get().activeSessionId;
    if (sessionId) {
      deleteRecordingBlob(sessionId);
    }
    set({ recordingArtifact: null, recordingContext: null, pipelineStatus: 'idle', activeSessionId: null });
  },
  reset: () => {
    const sessionId = get().activeSessionId;
    if (sessionId) {
      deleteRecordingBlob(sessionId);
    }
    set({ isRecording: false, elapsedTime: 0, activeSessionId: null, processingStage: 0, processingPercent: 0, recordingContext: null, recordingArtifact: null, pipelineStatus: 'idle' });
  },
}));

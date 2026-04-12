export interface ProcessedFrame {
  id: string;
  sessionId: string;
  timestamp: number;
  url: string;
  thumbnailUrl: string;
  diffSummary: { added: number; changed: number; removed: number };
  ariaTree: Array<{
    role: string;
    name: string;
    children?: Array<{ role: string; name: string; children?: unknown[]; diffStatus?: string }>;
    diffStatus?: 'added' | 'changed' | 'removed';
  }>;
  createdAt: string;
}

export interface ProcessingResponse {
  sessionId: string;
  status: 'complete';
  title: string;
  seedUrl: string;
  agentTarget: string;
  fileSize: number;
  mimeType: string;
  prompt: string;
  frames: ProcessedFrame[];
  frameCount: number;
  urlsInspected: string[];
  processingMs: number;
}

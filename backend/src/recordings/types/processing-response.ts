export interface ProcessingResponse {
  sessionId: string;
  status: 'processing' | 'complete' | 'error';
  title: string;
  seedUrl: string;
  agentTarget: string;
  fileSize: number;
  mimeType: string;

  // Future fields — populated after processing completes
  prompt?: string;
  frames?: unknown[];
  frameCount?: number;
  urlsInspected?: string[];
  processingMs?: number;
}

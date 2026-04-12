export interface UIElement {
  type: string;
  label: string;
  state?: string;
}

export interface ExtractedFrame {
  frameId: string;
  timestampMs: number;
  filePath: string;
  format: 'png' | 'jpg';
}

export interface FrameAnalysisResult {
  frameId: string;
  timestampMs: number;
  description: string;
  elements: UIElement[];
  observations: string[];
  success: boolean;
  error?: string;
}

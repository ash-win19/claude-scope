export interface ElementCounts {
  buttons: number;
  inputs: number;
  links: number;
  headings: number;
  images: number;
  total: number;
}

export interface ARIASnapshot {
  url: string;
  ariaTree: string;
  counts: ElementCounts;
  success: boolean;
  error?: string;
}

export interface InspectionResult {
  urlsInspected: string[];
  snapshots: ARIASnapshot[];
  durationMs: number;
}

import { RecordingTimeline } from './timeline.types';
import { InspectionResult } from './inspection.types';

export interface SynthesisInput {
  timeline: RecordingTimeline;
  seedUrl: string;
  agentTarget: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  title: string;
  notes?: string;
  inspection: InspectionResult; // required — both lanes must succeed
}

export interface SynthesisOutput {
  prompt: string;
  summary: string;
  urlsInspected: string[];
}

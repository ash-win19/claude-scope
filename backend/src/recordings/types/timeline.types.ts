import { UIElement } from './vision.types';

export type TimelineEventType =
  | 'initial'
  | 'state-change'
  | 'navigation'
  | 'interaction'
  | 'error';

export interface TimelineEvent {
  timestampMs: number;
  frameId: string;
  type: TimelineEventType;
  summary: string;
  elements: UIElement[];
}

export interface RecordingTimeline {
  summary: string;
  durationMs: number;
  frameCount: number;
  failedFrames: number;
  events: TimelineEvent[];
}

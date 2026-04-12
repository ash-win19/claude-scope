import { Injectable, Logger } from '@nestjs/common';
import { FrameAnalysisResult } from './types/vision.types';
import {
  RecordingTimeline,
  TimelineEvent,
  TimelineEventType,
} from './types/timeline.types';

@Injectable()
export class VisionTimelineService {
  private readonly logger = new Logger(VisionTimelineService.name);

  /**
   * Builds a recording timeline from per-frame analysis results.
   * Pure synchronous function that:
   * 1. Sorts frames by timestampMs
   * 2. Filters to successful frames, tracking failed count
   * 3. First frame becomes an 'initial' event
   * 4. Adjacent frames are compared to detect changes, skip redundant frames
   * 5. Returns a RecordingTimeline with chronological events and summary
   */
  buildTimeline(analyses: FrameAnalysisResult[]): RecordingTimeline {
    if (analyses.length === 0) {
      return {
        summary: 'No frames to analyze',
        durationMs: 0,
        frameCount: 0,
        failedFrames: 0,
        events: [],
      };
    }

    const sorted = [...analyses].sort((a, b) => a.timestampMs - b.timestampMs);
    const successful = sorted.filter((a) => a.success);
    const failedFrames = sorted.length - successful.length;

    if (successful.length === 0) {
      return {
        summary: 'All frames failed analysis',
        durationMs: 0,
        frameCount: sorted.length,
        failedFrames,
        events: [],
      };
    }

    const events: TimelineEvent[] = [];

    // First successful frame is always the initial event
    const first = successful[0];
    events.push({
      timestampMs: first.timestampMs,
      frameId: first.frameId,
      type: 'initial',
      summary: first.description,
      elements: [...first.elements],
    });

    // Compare adjacent frames to detect changes
    for (let i = 1; i < successful.length; i++) {
      const prev = successful[i - 1];
      const curr = successful[i];

      // Skip redundant frames (identical descriptions)
      if (curr.description === prev.description) {
        continue;
      }

      const eventType = this.classifyChange(prev, curr);

      events.push({
        timestampMs: curr.timestampMs,
        frameId: curr.frameId,
        type: eventType,
        summary: curr.description,
        elements: [...curr.elements],
      });
    }

    const durationMs =
      successful[successful.length - 1].timestampMs - successful[0].timestampMs;

    const summary = this.buildSummary(events, durationMs, failedFrames);

    this.logger.log(
      `Built timeline: ${events.length} events from ${successful.length} frames (${failedFrames} failed)`,
    );

    return {
      summary,
      durationMs,
      frameCount: sorted.length,
      failedFrames,
      events,
    };
  }

  /**
   * Classifies the type of change between two adjacent frames.
   */
  private classifyChange(
    prev: FrameAnalysisResult,
    curr: FrameAnalysisResult,
  ): TimelineEventType {
    const prevDesc = prev.description.toLowerCase();
    const currDesc = curr.description.toLowerCase();

    // Check for navigation indicators
    const navigationKeywords = [
      'navigate',
      'page',
      'url',
      'redirect',
      'route',
      'tab',
      'new page',
      'loaded',
    ];
    for (const keyword of navigationKeywords) {
      if (currDesc.includes(keyword) && !prevDesc.includes(keyword)) {
        return 'navigation';
      }
    }

    // Check for interaction indicators
    const interactionKeywords = [
      'click',
      'hover',
      'focus',
      'select',
      'type',
      'input',
      'dropdown',
      'modal',
      'dialog',
      'popup',
      'menu',
    ];
    for (const keyword of interactionKeywords) {
      if (currDesc.includes(keyword)) {
        return 'interaction';
      }
    }

    // Check for error indicators
    const errorKeywords = ['error', 'fail', 'warning', 'alert', '404', '500'];
    for (const keyword of errorKeywords) {
      if (currDesc.includes(keyword) && !prevDesc.includes(keyword)) {
        return 'error';
      }
    }

    // Default to state-change
    return 'state-change';
  }

  /**
   * Builds a human-readable summary of the recording timeline.
   */
  private buildSummary(
    events: TimelineEvent[],
    durationMs: number,
    failedFrames: number,
  ): string {
    const durationSec = (durationMs / 1000).toFixed(1);
    const parts: string[] = [];

    parts.push(
      `Recording timeline: ${events.length} events over ${durationSec}s`,
    );

    const typeCounts = new Map<string, number>();
    for (const event of events) {
      typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
    }

    const typeDescriptions: string[] = [];
    if (typeCounts.has('navigation')) {
      typeDescriptions.push(
        `${typeCounts.get('navigation')} navigation(s)`,
      );
    }
    if (typeCounts.has('interaction')) {
      typeDescriptions.push(
        `${typeCounts.get('interaction')} interaction(s)`,
      );
    }
    if (typeCounts.has('state-change')) {
      typeDescriptions.push(
        `${typeCounts.get('state-change')} state change(s)`,
      );
    }
    if (typeCounts.has('error')) {
      typeDescriptions.push(`${typeCounts.get('error')} error(s)`);
    }

    if (typeDescriptions.length > 0) {
      parts.push(typeDescriptions.join(', '));
    }

    if (failedFrames > 0) {
      parts.push(`${failedFrames} frame(s) failed analysis`);
    }

    return parts.join('. ') + '.';
  }
}

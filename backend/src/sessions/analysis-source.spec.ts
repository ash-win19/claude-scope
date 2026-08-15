import { resolveAnalysisJson } from './analysis-source';
import type { AnalysisJson } from '../database/schema';

const blob: AnalysisJson = {
  timeline: {
    summary: 'from blob',
    durationMs: 1000,
    frameCount: 1,
    failedFrames: 0,
    events: [],
  },
  inspection: {
    urlsInspected: ['https://example.com'],
    snapshots: [],
    durationMs: 10,
  },
  visionSuccessCount: 1,
  totalFrames: 1,
};

describe('resolveAnalysisJson', () => {
  it('prefers the session_analysis row over the sessions blob', () => {
    const resolved = resolveAnalysisJson(blob, {
      timelineJson: { ...blob.timeline, summary: 'from row' },
      inspectionJson: blob.inspection,
      visionSuccessCount: 2,
      totalFrames: 3,
    });
    expect(resolved?.timeline.summary).toBe('from row');
    expect(resolved?.visionSuccessCount).toBe(2);
    expect(resolved?.totalFrames).toBe(3);
  });

  it('falls back to the sessions blob when the row is missing', () => {
    expect(resolveAnalysisJson(blob, null)?.timeline.summary).toBe('from blob');
  });

  it('returns null when neither source has timeline and inspection', () => {
    expect(resolveAnalysisJson(null, null)).toBeNull();
    expect(
      resolveAnalysisJson(null, {
        timelineJson: null,
        inspectionJson: blob.inspection,
        visionSuccessCount: 0,
        totalFrames: 0,
      }),
    ).toBeNull();
  });
});

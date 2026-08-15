import {
  AnalysisJson,
  InspectionResultJson,
  RecordingTimelineJson,
} from '../database/schema';

export interface AnalysisRow {
  timelineJson: RecordingTimelineJson | AnalysisJson['timeline'] | null;
  inspectionJson: InspectionResultJson | AnalysisJson['inspection'] | null;
  visionSuccessCount: number;
  totalFrames: number;
}

/**
 * Prefer the dedicated session_analysis row. Fall back to the deprecated
 * sessions.analysis jsonb for recordings persisted before that split.
 */
export function resolveAnalysisJson(
  sessionBlob: AnalysisJson | null | undefined,
  analysisRow?: AnalysisRow | null,
): AnalysisJson | null {
  if (analysisRow?.timelineJson && analysisRow?.inspectionJson) {
    return {
      timeline: analysisRow.timelineJson as AnalysisJson['timeline'],
      inspection: analysisRow.inspectionJson,
      visionSuccessCount: analysisRow.visionSuccessCount,
      totalFrames: analysisRow.totalFrames,
    };
  }
  if (sessionBlob?.timeline && sessionBlob?.inspection) {
    return sessionBlob;
  }
  return null;
}

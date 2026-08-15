import * as crypto from 'crypto';
import * as fs from 'fs';
import { ExtractedFrame } from './types/vision.types';

/** Prefer ffprobe duration; fall back to the client-recorded elapsed time. */
export function resolveDurationSeconds(
  probeSeconds: number,
  durationMs?: number,
): number {
  if (Number.isFinite(probeSeconds) && probeSeconds > 0) {
    return probeSeconds;
  }
  if (durationMs && Number.isFinite(durationMs) && durationMs > 0) {
    return durationMs / 1000;
  }
  return 0;
}

export function computeExtractFps(
  durationSeconds: number,
  maxFrames: number,
): number {
  if (!durationSeconds || durationSeconds <= 0) {
    return 1;
  }
  if (durationSeconds <= 30) {
    return 1;
  }
  return maxFrames / durationSeconds;
}

/**
 * Drop consecutive frames whose PNG bytes are identical.
 * Static screens in a recording otherwise get billed as separate vision calls.
 */
export function dropConsecutiveDuplicateFrames(
  frames: ExtractedFrame[],
): ExtractedFrame[] {
  if (frames.length <= 1) {
    return frames;
  }

  const kept: ExtractedFrame[] = [];
  let lastHash: string | null = null;

  for (const frame of frames) {
    const hash = crypto
      .createHash('sha256')
      .update(fs.readFileSync(frame.filePath))
      .digest('hex');
    if (hash === lastHash) {
      continue;
    }
    kept.push(frame);
    lastHash = hash;
  }

  return kept.length > 0 ? kept : frames.slice(0, 1);
}

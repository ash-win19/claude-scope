import * as fs from 'fs';
import {
  computeExtractFps,
  dropConsecutiveDuplicateFrames,
  resolveDurationSeconds,
} from './frame-selection';
import { ExtractedFrame } from './types/vision.types';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

const readFileSync = fs.readFileSync as jest.Mock;

function frame(id: string): ExtractedFrame {
  return {
    frameId: id,
    timestampMs: 0,
    filePath: `/tmp/${id}.png`,
    format: 'png',
  };
}

describe('resolveDurationSeconds', () => {
  it('prefers a valid ffprobe duration', () => {
    expect(resolveDurationSeconds(12.5, 8000)).toBe(12.5);
  });

  it('falls back to client durationMs when probe is 0', () => {
    expect(resolveDurationSeconds(0, 8000)).toBe(8);
  });

  it('returns 0 when neither source is usable', () => {
    expect(resolveDurationSeconds(0)).toBe(0);
    expect(resolveDurationSeconds(Number.NaN, -1)).toBe(0);
  });
});

describe('computeExtractFps', () => {
  it('uses 1fps for recordings of 30s or less', () => {
    expect(computeExtractFps(10, 20)).toBe(1);
    expect(computeExtractFps(30, 20)).toBe(1);
  });

  it('caps longer recordings to maxFrames', () => {
    expect(computeExtractFps(60, 20)).toBeCloseTo(20 / 60);
  });

  it('defaults to 1fps when duration is unknown', () => {
    expect(computeExtractFps(0, 20)).toBe(1);
  });
});

describe('dropConsecutiveDuplicateFrames', () => {
  it('keeps frames whose bytes differ', () => {
    readFileSync.mockImplementation((path: string) => Buffer.from(path));
    const frames = [frame('a'), frame('b'), frame('c')];
    expect(dropConsecutiveDuplicateFrames(frames).map((f) => f.frameId)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('drops consecutive identical frames', () => {
    readFileSync.mockImplementation((path: string) =>
      path.includes('b') || path.includes('c')
        ? Buffer.from('same')
        : Buffer.from(path),
    );
    const frames = [frame('a'), frame('b'), frame('c'), frame('d')];
    expect(dropConsecutiveDuplicateFrames(frames).map((f) => f.frameId)).toEqual([
      'a',
      'b',
      'd',
    ]);
  });
});

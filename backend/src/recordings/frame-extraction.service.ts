import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { ExtractedFrame } from './types/vision.types';
import {
  computeExtractFps,
  dropConsecutiveDuplicateFrames,
  resolveDurationSeconds,
} from './frame-selection';

export interface FrameExtractionOptions {
  maxFrames?: number;
  /** Client-recorded elapsed time, used when ffprobe cannot read duration. */
  durationMs?: number;
}

@Injectable()
export class FrameExtractionService {
  private readonly logger = new Logger(FrameExtractionService.name);
  private static readonly DEFAULT_MAX_FRAMES = 20;

  /**
   * Extracts PNG frames from a video file using ffmpeg.
   *
   * For videos <= 30s, extracts at 1fps.
   * For longer videos, calculates fps to stay within maxFrames.
   * Results are capped to maxFrames.
   */
  async extractFrames(
    videoPath: string,
    outputDir: string,
    options?: FrameExtractionOptions,
  ): Promise<ExtractedFrame[]> {
    const maxFrames = options?.maxFrames ?? FrameExtractionService.DEFAULT_MAX_FRAMES;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const probeDuration = await this.getVideoDuration(videoPath);
    const duration = resolveDurationSeconds(probeDuration, options?.durationMs);
    if (!probeDuration && options?.durationMs) {
      this.logger.warn(
        `ffprobe returned no duration; using client durationMs=${options.durationMs}`,
      );
    } else if (!duration) {
      this.logger.warn(`Could not determine video duration, defaulting to 1fps extraction`);
    }
    this.logger.log(`Video duration: ${duration}s`);

    const fps = computeExtractFps(duration, maxFrames);
    this.logger.log(`Using fps: ${fps.toFixed(4)} (maxFrames: ${maxFrames})`);

    const outputPattern = path.join(outputDir, 'frame-%04d.png');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([`-vf`, `fps=${fps}`])
        .output(outputPattern)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });

    const files = fs
      .readdirSync(outputDir)
      .filter((f) => f.startsWith('frame-') && f.endsWith('.png'))
      .sort();

    if (files.length === 0) {
      throw new Error(
        `No frames were extracted from video: ${videoPath}`,
      );
    }

    const allFrames: ExtractedFrame[] = files.map((file, index) => ({
      frameId: `frame_${String(index).padStart(4, '0')}`,
      timestampMs: Math.round((index / fps) * 1000),
      filePath: path.join(outputDir, file),
      format: 'png' as const,
    }));

    const uniqueFrames = dropConsecutiveDuplicateFrames(allFrames);
    const frames = uniqueFrames.slice(0, maxFrames);
    this.logger.log(
      `Extracted ${files.length} frames, ${uniqueFrames.length} unique, using ${frames.length} (cap: ${maxFrames})`,
    );

    return frames;
  }

  private getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to probe video: ${err.message}`));
          return;
        }

        const duration = Number(metadata?.format?.duration);
        if (!isFinite(duration) || duration <= 0) {
          this.logger.warn('ffprobe returned no duration metadata, returning 0');
          resolve(0);
          return;
        }

        resolve(duration);
      });
    });
  }
}

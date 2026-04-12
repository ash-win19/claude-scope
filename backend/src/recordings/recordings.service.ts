import { Inject, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { sessions, frames } from '../database/schema';
import { eq } from 'drizzle-orm';
import { UploadRecordingDto } from './dto/upload-recording.dto';
import { ProcessingResponse, ProcessedFrame } from './types/processing-response';
import { FrameExtractionService } from './frame-extraction.service';
import { VisionService } from './vision.service';
import { VisionTimelineService } from './vision-timeline.service';
import { PlaywrightService } from './playwright.service';
import { SynthesisService } from './synthesis.service';

@Injectable()
export class RecordingsService {
  private readonly logger = new Logger(RecordingsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly frameExtraction: FrameExtractionService,
    private readonly vision: VisionService,
    private readonly visionTimeline: VisionTimelineService,
    private readonly playwright: PlaywrightService,
    private readonly synthesis: SynthesisService,
  ) {}

  async processUpload(
    userId: string,
    file: Express.Multer.File,
    dto: UploadRecordingDto,
  ): Promise<ProcessingResponse> {
    const startTime = Date.now();
    const sessionId = this.generateId('sess');

    // 1. Create session row (status: processing)
    await this.db.insert(sessions).values({
      id: sessionId,
      userId,
      title: dto.title,
      status: 'processing',
      agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
      seedUrl: dto.seedUrl,
      notes: dto.notes ?? null,
    });

    // 2. Create temp workspace
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-recording-'));
    const videoPath = path.join(tmpDir, 'recording.webm');
    const framesDir = path.join(tmpDir, 'frames');

    try {
      // 3. Write uploaded video to temp storage
      this.logger.log(`[${sessionId}] Writing video to ${videoPath} (${file.size} bytes)`);
      fs.writeFileSync(videoPath, file.buffer);

      // 4. Extract frames
      this.logger.log(`[${sessionId}] Extracting frames...`);
      const extractedFrames = await this.frameExtraction.extractFrames(videoPath, framesDir);
      this.logger.log(`[${sessionId}] Extracted ${extractedFrames.length} frames`);

      // 5. Run vision + playwright in parallel
      this.logger.log(`[${sessionId}] Running vision analysis and playwright inspection in parallel...`);
      const [visionResults, inspectionResult] = await Promise.all([
        this.vision.analyzeFrames(extractedFrames),
        dto.seedUrl && this.playwright.isAvailable()
          ? this.playwright.inspectUrls([dto.seedUrl])
          : Promise.resolve(undefined),
      ]);

      // 6. Build timeline from vision results
      this.logger.log(`[${sessionId}] Building timeline...`);
      const timeline = this.visionTimeline.buildTimeline(visionResults);

      // 7. Synthesize prompt
      this.logger.log(`[${sessionId}] Synthesizing prompt...`);
      const synthesisResult = this.synthesis.synthesize({
        timeline,
        seedUrl: dto.seedUrl,
        agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
        title: dto.title,
        notes: dto.notes,
        inspection: inspectionResult,
      });

      // 8. Persist frames into the frames table
      this.logger.log(`[${sessionId}] Persisting ${extractedFrames.length} frames...`);
      const persistedFrames: ProcessedFrame[] = [];

      for (let i = 0; i < extractedFrames.length; i++) {
        const ef = extractedFrames[i];
        const analysis = visionResults[i];
        const frameId = this.generateId('frm');

        // Read frame file as base64 data URL for thumbnailUrl
        const frameBuffer = fs.readFileSync(ef.filePath);
        const base64 = frameBuffer.toString('base64');
        const thumbnailUrl = `data:image/png;base64,${base64}`;

        // Convert vision elements to ARIANodeJson shape
        const ariaTree = analysis && analysis.success
          ? analysis.elements.map((el) => ({
              role: el.type,
              name: el.label,
              ...(el.state ? { diffStatus: undefined } : {}),
            }))
          : [];

        // Compute basic diffSummary by comparing element counts with previous frame
        let diffSummary = { added: 0, changed: 0, removed: 0 };
        if (i > 0 && analysis?.success) {
          const prevAnalysis = visionResults[i - 1];
          if (prevAnalysis?.success) {
            const prevNames = new Set(prevAnalysis.elements.map((e) => `${e.type}:${e.label}`));
            const currNames = new Set(analysis.elements.map((e) => `${e.type}:${e.label}`));
            let added = 0;
            let removed = 0;
            for (const name of currNames) {
              if (!prevNames.has(name)) added++;
            }
            for (const name of prevNames) {
              if (!currNames.has(name)) removed++;
            }
            diffSummary = { added, changed: 0, removed };
          }
        }

        const [inserted] = await this.db.insert(frames).values({
          id: frameId,
          sessionId,
          timestamp: ef.timestampMs,
          url: dto.seedUrl,
          thumbnailUrl,
          diffSummary,
          ariaTree,
        }).returning();

        persistedFrames.push({
          id: inserted.id,
          sessionId: inserted.sessionId,
          timestamp: inserted.timestamp,
          url: inserted.url,
          thumbnailUrl: inserted.thumbnailUrl,
          diffSummary: inserted.diffSummary,
          ariaTree: inserted.ariaTree as ProcessedFrame['ariaTree'],
          createdAt: inserted.createdAt.toISOString(),
        });
      }

      // 9. Update session row
      const processingMs = Date.now() - startTime;
      const urlsInspected = synthesisResult.urlsInspected;

      await this.db.update(sessions).set({
        status: 'complete',
        frameCount: persistedFrames.length,
        urlCount: urlsInspected.length,
        processingTime: processingMs,
        prompt: synthesisResult.prompt,
        urls: urlsInspected,
        duration: Math.round(timeline.durationMs / 1000),
        seedUrl: dto.seedUrl,
        notes: dto.notes ?? null,
        updatedAt: new Date(),
      }).where(eq(sessions.id, sessionId));

      this.logger.log(`[${sessionId}] Processing complete in ${processingMs}ms`);

      // 10. Return full response
      return {
        sessionId,
        status: 'complete',
        title: dto.title,
        seedUrl: dto.seedUrl,
        agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
        fileSize: file.size,
        mimeType: file.mimetype,
        prompt: synthesisResult.prompt,
        frames: persistedFrames,
        frameCount: persistedFrames.length,
        urlsInspected,
        processingMs,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[${sessionId}] Processing failed: ${message}`);

      const processingMs = Date.now() - startTime;

      await this.db.update(sessions).set({
        status: 'error',
        processingTime: processingMs,
        lastError: message,
        updatedAt: new Date(),
      }).where(eq(sessions.id, sessionId));

      throw new InternalServerErrorException({
        sessionId,
        error: message,
        processingMs,
      });
    } finally {
      // 11. Cleanup temp files
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        this.logger.log(`[${sessionId}] Cleaned up temp directory`);
      } catch {
        this.logger.warn(`[${sessionId}] Failed to clean up temp directory: ${tmpDir}`);
      }
    }
  }

  private generateId(prefix: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = `${prefix}_`;
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

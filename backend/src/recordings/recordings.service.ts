import { Inject, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { sessions, frames, sessionAnalysis, type ProcessingStatusJson } from '../database/schema';
import { AssetsService } from '../assets/assets.service';
import { eq } from 'drizzle-orm';
import { UploadRecordingDto } from './dto/upload-recording.dto';
import { ProcessingResponse, ProcessedFrame } from './types/processing-response';
import { FrameExtractionService } from './frame-extraction.service';
import { VisionService, VisionRequestOptions } from './vision.service';
import { VisionTimelineService } from './vision-timeline.service';
import { PlaywrightService } from './playwright.service';
import { CredentialsService } from '../credentials/credentials.service';

@Injectable()
export class RecordingsService {
  private readonly logger = new Logger(RecordingsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly frameExtraction: FrameExtractionService,
    private readonly vision: VisionService,
    private readonly visionTimeline: VisionTimelineService,
    private readonly playwright: PlaywrightService,
    private readonly assetsService: AssetsService,
    private readonly credentialsService: CredentialsService,
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
    await this.updateStatus(sessionId, this.initialStatus());

    // 1b. Look up user's active Anthropic credential for BYOK
    const visionOptions: VisionRequestOptions = {};
    const userApiKey = await this.credentialsService.getDecryptedKeyForProvider(userId, 'anthropic');
    if (userApiKey) {
      visionOptions.apiKey = userApiKey;
      this.logger.log(`[${sessionId}] Using user-provided Anthropic API key (BYOK)`);
    } else {
      this.logger.log(`[${sessionId}] No user credential found, falling back to server ANTHROPIC_API_KEY`);
    }

    // 2. Create temp workspace
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-recording-'));
    const videoPath = path.join(tmpDir, 'recording.webm');
    const framesDir = path.join(tmpDir, 'frames');

    try {
      // 3. Write uploaded video to temp storage
      this.logger.log(`[${sessionId}] Writing video to ${videoPath} (${file.size} bytes)`);
      fs.writeFileSync(videoPath, file.buffer);

      // 4. Extract frames
      await this.updateStatus(sessionId, {
        overallStage: 'extracting',
        frameExtraction: { status: 'running', startedAt: new Date().toISOString() },
      });
      this.logger.log(`[${sessionId}] Extracting frames...`);
      const extractedFrames = await this.frameExtraction.extractFrames(videoPath, framesDir);
      this.logger.log(`[${sessionId}] Extracted ${extractedFrames.length} frames`);
      await this.updateStatus(sessionId, {
        frameExtraction: { status: 'complete', completedAt: new Date().toISOString(), detail: `${extractedFrames.length} frames` },
      });

      // 5. Validate both lanes are available
      if (!this.playwright.isAvailable()) {
        throw new Error('Playwright browser is not available. Cannot process recording.');
      }

      if (!this.vision.isAvailable(visionOptions)) {
        throw new Error('Vision service is not available. Check ANTHROPIC_API_KEY or add your own key on the Model Access page.');
      }

      // 6. Run vision + playwright in parallel — both required
      await this.updateStatus(sessionId, {
        overallStage: 'analyzing',
        visionLane: { status: 'running', startedAt: new Date().toISOString() },
        playwrightLane: { status: 'running', startedAt: new Date().toISOString() },
      });
      this.logger.log(`[${sessionId}] Running vision and playwright lanes in parallel...`);

      const [visionResults, inspectionResult] = await Promise.all([
        this.vision.analyzeFrames(extractedFrames, visionOptions),
        this.playwright.inspectUrls([dto.seedUrl]),
      ]);

      // 7. Validate vision lane produced results
      const successCount = visionResults.filter((r) => r.success).length;
      if (successCount === 0) {
        throw new Error(`Vision analysis failed for all ${visionResults.length} frames`);
      }

      this.logger.log(`[${sessionId}] Vision: ${successCount}/${visionResults.length} frames. Playwright: ${inspectionResult.snapshots.length} snapshots.`);
      await this.updateStatus(sessionId, {
        visionLane: { status: 'complete', completedAt: new Date().toISOString(), detail: `${successCount}/${visionResults.length} frames` },
        playwrightLane: { status: 'complete', completedAt: new Date().toISOString(), detail: `${inspectionResult.snapshots.length} snapshots` },
      });

      // 8. Build timeline from vision results
      this.logger.log(`[${sessionId}] Building timeline...`);
      const timeline = this.visionTimeline.buildTimeline(visionResults);

      // 8b. Create session_analysis record (dual-write)
      // Truncate large ARIA trees before persisting to avoid oversized query params
      const truncatedInspection = {
        ...inspectionResult,
        snapshots: inspectionResult.snapshots.map(s => ({
          ...s,
          ariaTree: s.ariaTree && s.ariaTree.length > 50000
            ? s.ariaTree.slice(0, 50000) + '\n# ... truncated at 50000 chars'
            : s.ariaTree,
        })),
      };
      const analysisId = this.generateId('sa');
      await this.db.insert(sessionAnalysis).values({
        id: analysisId,
        sessionId,
        timelineJson: timeline,
        inspectionJson: truncatedInspection,
        visionSuccessCount: successCount,
        totalFrames: visionResults.length,
        analysisVersion: 1,
        promptStatus: 'pending',
      });

      // 9. Skip prompt synthesis (deferred to generate-prompt endpoint — CAP-76)
      await this.updateStatus(sessionId, {
        overallStage: 'persisting',
        synthesis: { status: 'pending', detail: 'Deferred to generate-prompt' },
      });

      // 10. Persist frames into the frames table
      this.logger.log(`[${sessionId}] Persisting ${extractedFrames.length} frames...`);
      const persistedFrames: ProcessedFrame[] = [];

      for (let i = 0; i < extractedFrames.length; i++) {
        const ef = extractedFrames[i];
        const analysis = visionResults[i];
        const frameId = this.generateId('frm');

        // Store frame as asset and use API URL for thumbnailUrl
        const frameBuffer = fs.readFileSync(ef.filePath);
        const asset = await this.assetsService.createAsset(sessionId, frameId, 'thumbnail', frameBuffer, 'image/png');
        const thumbnailUrl = `/api/assets/${asset.id}`;

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

      // 10. Build merged analysis artifact
      const analysisPayload = {
        timeline: {
          summary: timeline.summary,
          durationMs: timeline.durationMs,
          frameCount: timeline.frameCount,
          failedFrames: timeline.failedFrames,
          events: timeline.events.map((e) => ({
            timestampMs: e.timestampMs,
            frameId: e.frameId,
            type: e.type,
            summary: e.summary,
            elements: e.elements,
          })),
        },
        inspection: {
          urlsInspected: inspectionResult.urlsInspected,
          snapshots: inspectionResult.snapshots.map((s) => ({
            url: s.url,
            ariaTree: s.ariaTree,
            counts: s.counts,
            success: s.success,
            error: s.error,
          })),
          durationMs: inspectionResult.durationMs,
        },
        visionSuccessCount: successCount,
        totalFrames: visionResults.length,
      };

      // 11. Update session row
      const processingMs = Date.now() - startTime;

      await this.db.update(sessions).set({
        status: 'complete',
        frameCount: persistedFrames.length,
        urlCount: inspectionResult.urlsInspected.length,
        processingTime: processingMs,
        analysis: analysisPayload,
        promptStatus: 'not_started',
        urls: inspectionResult.urlsInspected,
        duration: Math.round(timeline.durationMs / 1000),
        seedUrl: dto.seedUrl,
        notes: dto.notes ?? null,
        inspectionJson: inspectionResult,
        inspectionDurationMs: inspectionResult.durationMs,
        updatedAt: new Date(),
      }).where(eq(sessions.id, sessionId));

      this.logger.log(`[${sessionId}] Processing complete in ${processingMs}ms`);
      await this.updateStatus(sessionId, { overallStage: 'complete' });

      // Update session_analysis prompt status
      await this.db.update(sessionAnalysis).set({
        promptStatus: 'complete',
        updatedAt: new Date(),
      }).where(eq(sessionAnalysis.sessionId, sessionId));

      // 12. Return full response
      return {
        sessionId,
        status: 'complete',
        title: dto.title,
        seedUrl: dto.seedUrl,
        agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
        fileSize: file.size,
        mimeType: file.mimetype,
        promptStatus: 'not_started' as const,
        frames: persistedFrames,
        frameCount: persistedFrames.length,
        urlsInspected: inspectionResult.urlsInspected,
        processingMs,
        inspection: {
          urlsInspected: inspectionResult.urlsInspected,
          snapshots: inspectionResult.snapshots.map((s) => ({
            url: s.url,
            counts: s.counts,
            success: s.success,
            error: s.error,
          })),
          durationMs: inspectionResult.durationMs,
        },
        processingStatus: {
          overallStage: 'complete',
          visionLane: { status: 'complete' },
          playwrightLane: { status: 'complete' },
          frameExtraction: { status: 'complete' },
          synthesis: { status: 'complete' },
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[${sessionId}] Processing failed: ${message}`);
      if (err instanceof Error && err.stack) {
        this.logger.error(`[${sessionId}] Stack: ${err.stack}`);
      }
      if ((err as any)?.cause) {
        this.logger.error(`[${sessionId}] Cause: ${JSON.stringify((err as any).cause)}`);
      }
      if ((err as any)?.detail) {
        this.logger.error(`[${sessionId}] Detail: ${(err as any).detail}`);
      }

      const processingMs = Date.now() - startTime;

      await this.db.update(sessions).set({
        status: 'error',
        processingTime: processingMs,
        lastError: message,
        updatedAt: new Date(),
      }).where(eq(sessions.id, sessionId));

      // Attribute error to correct lane
      const laneError = message.toLowerCase();
      const errorUpdate: Partial<ProcessingStatusJson> = {
        overallStage: 'error',
        lastError: message,
      };
      if (laneError.includes('playwright') || laneError.includes('browser')) {
        errorUpdate.playwrightLane = { status: 'error', error: message };
      } else if (laneError.includes('vision') || laneError.includes('anthropic') || laneError.includes('frame')) {
        errorUpdate.visionLane = { status: 'error', error: message };
      }

      await this.updateStatus(sessionId, errorUpdate);

      // Best effort - don't let this fail the error handler
      try {
        await this.db.update(sessionAnalysis).set({
          promptStatus: 'error',
          promptError: message,
          updatedAt: new Date(),
        }).where(eq(sessionAnalysis.sessionId, sessionId));
      } catch {}

      throw new InternalServerErrorException({
        sessionId,
        error: message,
        processingMs,
      });
    } finally {
      // 13. Cleanup temp files
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        this.logger.log(`[${sessionId}] Cleaned up temp directory`);
      } catch {
        this.logger.warn(`[${sessionId}] Failed to clean up temp directory: ${tmpDir}`);
      }
    }
  }

  private async updateStatus(sessionId: string, status: Partial<ProcessingStatusJson>) {
    const current = await this.db.select({ processingStatus: sessions.processingStatus })
      .from(sessions).where(eq(sessions.id, sessionId)).limit(1);

    const existing = (current[0]?.processingStatus as ProcessingStatusJson | null) ?? this.initialStatus();
    const merged = { ...existing, ...status, lastUpdated: new Date().toISOString() };

    await this.db.update(sessions).set({ processingStatus: merged }).where(eq(sessions.id, sessionId));
  }

  private initialStatus(): ProcessingStatusJson {
    return {
      overallStage: 'uploading',
      visionLane: { status: 'pending' },
      playwrightLane: { status: 'pending' },
      frameExtraction: { status: 'pending' },
      synthesis: { status: 'pending' },
      lastUpdated: new Date().toISOString(),
    };
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

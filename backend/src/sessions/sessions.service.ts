import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { sessions, frames, sessionAnalysis, AnalysisJson } from '../database/schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SynthesisService } from '../recordings/synthesis.service';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly synthesis: SynthesisService,
  ) {}

  async create(userId: string, dto: CreateSessionDto) {
    const id = this.generateId('sess');

    const [session] = await this.db
      .insert(sessions)
      .values({
        id,
        userId,
        title: dto.title,
        status: 'processing',
        prompt: dto.prompt ?? '',
        agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
        frameCount: dto.frameCount ?? 0,
        urlCount: dto.urlCount ?? 0,
      })
      .returning();

    return session;
  }

  async findAllByUser(userId: string, limit?: number) {
    // List views only need metadata. Selecting prompt / analysis /
    // inspectionJson / processingStatus would ship megabytes of JSON
    // that the dashboard and sessions index immediately discard.
    const query = this.db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        title: sessions.title,
        status: sessions.status,
        duration: sessions.duration,
        frameCount: sessions.frameCount,
        urlCount: sessions.urlCount,
        agentTarget: sessions.agentTarget,
        seedUrl: sessions.seedUrl,
        processingTime: sessions.processingTime,
        promptStatus: sessions.promptStatus,
        createdAt: sessions.createdAt,
        updatedAt: sessions.updatedAt,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));

    return limit !== undefined ? query.limit(limit) : query;
  }

  async findOne(userId: string, sessionId: string) {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException();
    }

    const sessionFrames = await this.db
      .select()
      .from(frames)
      .where(eq(frames.sessionId, sessionId))
      .orderBy(frames.timestamp);

    const [analysis] = await this.db
      .select()
      .from(sessionAnalysis)
      .where(eq(sessionAnalysis.sessionId, sessionId))
      .limit(1);

    return { ...session, frames: sessionFrames, analysis: analysis ?? null };
  }

  async update(userId: string, sessionId: string, dto: UpdateSessionDto) {
    await this.assertOwnership(userId, sessionId);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.urls !== undefined) updateData.urls = dto.urls;
    if (dto.processingTime !== undefined)
      updateData.processingTime = dto.processingTime;
    if (dto.prompt !== undefined) updateData.prompt = dto.prompt;
    if (dto.agentTarget !== undefined) updateData.agentTarget = dto.agentTarget;
    if (dto.frameCount !== undefined) updateData.frameCount = dto.frameCount;
    if (dto.urlCount !== undefined) updateData.urlCount = dto.urlCount;

    const [updated] = await this.db
      .update(sessions)
      .set(updateData)
      .where(eq(sessions.id, sessionId))
      .returning();

    return updated;
  }

  async remove(userId: string, sessionId: string) {
    await this.assertOwnership(userId, sessionId);

    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
    return { deleted: true };
  }

  async getStats(userId: string) {
    const [result] = await this.db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        completedSessions: sql<number>`count(case when ${sessions.status} = 'complete' then 1 end)::int`,
        totalDuration: sql<number>`coalesce(sum(${sessions.duration}), 0)::int`,
        avgProcessingTime: sql<number>`coalesce(avg(${sessions.processingTime}), 0)::int`,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId));

    return result;
  }

  async getProcessingStatus(userId: string, sessionId: string) {
    const [session] = await this.db
      .select({
        id: sessions.id,
        status: sessions.status,
        processingStatus: sessions.processingStatus,
        processingTime: sessions.processingTime,
        lastError: sessions.lastError,
      })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify ownership
    const [owner] = await this.db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (owner.userId !== userId) {
      throw new ForbiddenException();
    }

    return {
      sessionId: session.id,
      sessionStatus: session.status,
      processingStatus: session.processingStatus,
      processingTime: session.processingTime,
      lastError: session.lastError,
    };
  }

  async generatePrompt(userId: string, sessionId: string) {
    this.logger.log(`[${sessionId}] generatePrompt called by user ${userId}`);

    await this.assertOwnership(userId, sessionId);

    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      this.logger.warn(`[${sessionId}] Session not found`);
      throw new NotFoundException('Session not found');
    }

    this.logger.log(`[${sessionId}] Session status=${session.status}, promptStatus=${session.promptStatus}, hasAnalysis=${!!session.analysis}`);

    const analysis = session.analysis as AnalysisJson | null;

    // Guard: no analysis data available
    if (!analysis) {
      this.logger.warn(`[${sessionId}] No analysis data on session`);
      throw new BadRequestException('Session has no analysis data. Upload must complete first.');
    }

    // Guard: already generating
    if (session.promptStatus === 'generating') {
      return { sessionId, promptStatus: 'generating', prompt: null };
    }

    // Guard: already complete with prompt
    if (session.promptStatus === 'complete' && session.prompt) {
      return { sessionId, promptStatus: 'complete', prompt: session.prompt };
    }

    // Set status to generating
    await this.db.update(sessions).set({
      promptStatus: 'generating',
      updatedAt: new Date(),
    }).where(eq(sessions.id, sessionId));

    try {
      // Reconstruct inputs for synthesis from stored analysis
      const timeline = {
        summary: analysis.timeline.summary,
        durationMs: analysis.timeline.durationMs,
        frameCount: analysis.timeline.frameCount,
        failedFrames: analysis.timeline.failedFrames,
        events: analysis.timeline.events.map((e) => ({
          timestampMs: e.timestampMs,
          frameId: e.frameId,
          type: e.type as 'initial' | 'state-change' | 'navigation' | 'interaction' | 'error',
          summary: e.summary,
          elements: e.elements,
        })),
      };

      const inspection = {
        urlsInspected: analysis.inspection.urlsInspected,
        snapshots: analysis.inspection.snapshots.map((s) => ({
          url: s.url,
          ariaTree: s.ariaTree,
          counts: s.counts,
          success: s.success,
          error: s.error,
        })),
        durationMs: analysis.inspection.durationMs,
      };

      const synthesisResult = this.synthesis.synthesize({
        timeline,
        seedUrl: session.seedUrl,
        agentTarget: session.agentTarget,
        title: session.title,
        notes: session.notes ?? undefined,
        inspection,
      });

      // Persist prompt and set status to complete
      await this.db.update(sessions).set({
        prompt: synthesisResult.prompt,
        promptStatus: 'complete',
        promptError: null,
        updatedAt: new Date(),
      }).where(eq(sessions.id, sessionId));

      return { sessionId, promptStatus: 'complete', prompt: synthesisResult.prompt };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[${sessionId}] Prompt generation failed: ${message}`);
      if (err instanceof Error && err.stack) {
        this.logger.error(`[${sessionId}] Stack: ${err.stack}`);
      }
      if ((err as any)?.cause) {
        this.logger.error(`[${sessionId}] Cause: ${JSON.stringify((err as any).cause)}`);
      }

      await this.db.update(sessions).set({
        promptStatus: 'error',
        promptError: message,
        updatedAt: new Date(),
      }).where(eq(sessions.id, sessionId));

      throw err;
    }
  }

  private async assertOwnership(userId: string, sessionId: string) {
    const [session] = await this.db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(and(eq(sessions.id, sessionId)))
      .limit(1);

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException();
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

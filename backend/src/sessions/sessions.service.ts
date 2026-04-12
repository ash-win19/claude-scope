import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { sessions, frames } from '../database/schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

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

  async findAllByUser(userId: string) {
    return this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));
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

    return { ...session, frames: sessionFrames };
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
        completedSessions: sql<number>`count(*) filter (where ${sessions.status} = 'complete')::int`,
        totalDuration: sql<number>`coalesce(sum(${sessions.duration}), 0)::int`,
        avgProcessingTime: sql<number>`coalesce(avg(${sessions.processingTime}), 0)::int`,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId));

    return result;
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

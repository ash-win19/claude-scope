import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { userSettings } from '../database/schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async get(userId: string) {
    const [settings] = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (!settings) {
      const [created] = await this.db
        .insert(userSettings)
        .values({ userId })
        .returning();
      return this.toResponse(created);
    }

    return this.toResponse(settings);
  }

  async update(userId: string, dto: UpdateSettingsDto) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dto.defaultAgent !== undefined)
      updateData.defaultAgent = dto.defaultAgent;
    if (dto.includeScreenshots !== undefined)
      updateData.includeScreenshots = dto.includeScreenshots ? 1 : 0;
    if (dto.inlineAriaTree !== undefined)
      updateData.inlineAriaTree = dto.inlineAriaTree ? 1 : 0;
    if (dto.includeRawDiff !== undefined)
      updateData.includeRawDiff = dto.includeRawDiff ? 1 : 0;
    if (dto.maxRecordingLength !== undefined)
      updateData.maxRecordingLength = dto.maxRecordingLength;

    const [updated] = await this.db
      .update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId))
      .returning();

    return this.toResponse(updated);
  }

  private toResponse(row: typeof userSettings.$inferSelect) {
    return {
      defaultAgent: row.defaultAgent,
      includeScreenshots: row.includeScreenshots === 1,
      inlineAriaTree: row.inlineAriaTree === 1,
      includeRawDiff: row.includeRawDiff === 1,
      maxRecordingLength: row.maxRecordingLength,
    };
  }
}

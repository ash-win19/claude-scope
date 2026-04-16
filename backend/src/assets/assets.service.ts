import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { sessionAssets } from '../database/schema';
import { AssetStorageService } from './asset-storage.service';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly storage: AssetStorageService,
  ) {}

  async createAsset(
    sessionId: string,
    frameId: string | null,
    kind: string,
    buffer: Buffer,
    mimeType: string,
  ) {
    const id = `ast_${crypto.randomBytes(4).toString('hex')}`;
    const ext = mimeType.split('/')[1] || 'bin';
    const storageKey = `${sessionId}/${id}.${ext}`;

    await this.storage.write(storageKey, buffer);

    try {
      const [asset] = await this.db.insert(sessionAssets).values({
        id,
        sessionId,
        frameId,
        kind,
        storageKey,
        mimeType,
        byteSize: buffer.length,
      }).returning();

      return asset;
    } catch (error) {
      await this.storage.remove(storageKey);
      this.logger.error(`Failed to persist asset metadata for ${storageKey}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async getAsset(assetId: string) {
    const [asset] = await this.db
      .select()
      .from(sessionAssets)
      .where(eq(sessionAssets.id, assetId))
      .limit(1);

    if (!asset) throw new NotFoundException('Asset not found');

    const buffer = await this.storage.read(asset.storageKey);
    return { buffer, mimeType: asset.mimeType, asset };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { sessions } from '../database/schema';
import { UploadRecordingDto } from './dto/upload-recording.dto';
import { ProcessingResponse } from './types/processing-response';

@Injectable()
export class RecordingsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async processUpload(
    userId: string,
    file: Express.Multer.File,
    dto: UploadRecordingDto,
  ): Promise<ProcessingResponse> {
    const sessionId = this.generateId('sess');

    await this.db.insert(sessions).values({
      id: sessionId,
      userId,
      title: dto.title,
      status: 'processing',
      agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
    });

    return {
      sessionId,
      status: 'processing',
      title: dto.title,
      seedUrl: dto.seedUrl,
      agentTarget: dto.agentTarget ?? 'CLAUDE_CODE',
      fileSize: file.size,
      mimeType: file.mimetype,
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

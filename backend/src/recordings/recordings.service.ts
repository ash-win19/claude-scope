import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { sessions } from '../database/schema';
import { UploadRecordingDto } from './dto/upload-recording.dto';
import { ProcessingResponse } from './types/processing-response';
import {
  RECORDING_STORAGE,
  IRecordingStorage,
} from './storage/recording-storage.interface';

const MIME_TO_EXTENSION: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/x-matroska': 'mkv',
};

@Injectable()
export class RecordingsService {
  private readonly logger = new Logger(RecordingsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(RECORDING_STORAGE)
    private readonly storage: IRecordingStorage,
  ) {}

  async processUpload(
    userId: string,
    file: Express.Multer.File,
    dto: UploadRecordingDto,
  ): Promise<ProcessingResponse> {
    const sessionId = this.generateId('sess');
    const extension = MIME_TO_EXTENSION[file.mimetype] ?? 'webm';

    const workspace = await this.storage.createWorkspace(
      sessionId,
      file.buffer,
      extension,
    );

    try {
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
    } finally {
      await this.storage.cleanup(workspace);
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

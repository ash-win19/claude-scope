import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import {
  IRecordingStorage,
  TempWorkspace,
} from './recording-storage.interface';

@Injectable()
export class LocalRecordingStorage implements IRecordingStorage {
  private readonly logger = new Logger(LocalRecordingStorage.name);

  async createWorkspace(
    requestId: string,
    videoBuffer: Buffer,
    extension: string,
  ): Promise<TempWorkspace> {
    const basePath = path.join(os.tmpdir(), 'claude-scope', requestId);
    const framesDir = path.join(basePath, 'frames');
    const videoPath = path.join(basePath, `recording.${extension}`);

    await fs.mkdir(framesDir, { recursive: true });
    await fs.writeFile(videoPath, videoBuffer);

    return { basePath, videoPath, framesDir };
  }

  async writeFrame(
    workspace: TempWorkspace,
    filename: string,
    data: Buffer,
  ): Promise<string> {
    const filePath = path.join(workspace.framesDir, filename);
    await fs.writeFile(filePath, data);
    return filePath;
  }

  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  async cleanup(workspace: TempWorkspace): Promise<void> {
    try {
      await fs.rm(workspace.basePath, { recursive: true, force: true });
    } catch (err) {
      this.logger.warn(
        `Failed to clean up workspace at ${workspace.basePath}: ${err}`,
      );
    }
  }
}

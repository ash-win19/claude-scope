import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AssetStorageService {
  private readonly logger = new Logger(AssetStorageService.name);
  private readonly baseDir = path.resolve(process.cwd(), 'uploads');

  async write(storageKey: string, buffer: Buffer): Promise<void> {
    const fullPath = path.join(this.baseDir, storageKey);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    this.logger.debug(`Wrote asset: ${storageKey} (${buffer.length} bytes)`);
  }

  async read(storageKey: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, storageKey);
    return fs.readFileSync(fullPath);
  }

  async remove(storageKey: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storageKey);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

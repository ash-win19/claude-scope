import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { chromium, Browser, BrowserContext } from 'playwright';

@Injectable()
export class PlaywrightService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlaywrightService.name);
  private browser: Browser | null = null;

  async onModuleInit(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        headless: true,
      });
      this.logger.log('Chromium browser launched successfully');
    } catch (error) {
      this.logger.error('Failed to launch Chromium browser', error);
      this.browser = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Chromium browser closed');
      this.browser = null;
    }
  }

  isAvailable(): boolean {
    return this.browser !== null;
  }

  async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error('Browser is not available');
    }

    return this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
  }
}

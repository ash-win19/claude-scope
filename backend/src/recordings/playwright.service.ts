import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { chromium, Browser, BrowserContext } from 'playwright';
import {
  ARIASnapshot,
  ElementCounts,
  InspectionResult,
} from './types/inspection.types';

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

  async inspectUrls(urls: string[]): Promise<InspectionResult> {
    const startTime = Date.now();

    if (!this.isAvailable()) {
      return {
        urlsInspected: [],
        snapshots: [],
        durationMs: Date.now() - startTime,
      };
    }

    const uniqueUrls = [...new Set(urls)];
    const snapshots: ARIASnapshot[] = [];
    const context = await this.createContext();

    try {
      for (const url of uniqueUrls) {
        const page = await context.newPage();
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

          const ariaTree = await page.ariaSnapshot();
          const counts = this.countElementsFromYaml(ariaTree);

          snapshots.push({
            url,
            ariaTree,
            counts,
            success: true,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(`Failed to inspect URL ${url}: ${message}`);
          snapshots.push({
            url,
            ariaTree: '',
            counts: {
              buttons: 0,
              inputs: 0,
              links: 0,
              headings: 0,
              images: 0,
              total: 0,
            },
            success: false,
            error: message,
          });
        } finally {
          await page.close();
        }
      }
    } finally {
      await context.close();
    }

    return {
      urlsInspected: uniqueUrls,
      snapshots,
      durationMs: Date.now() - startTime,
    };
  }

  private countElementsFromYaml(ariaYaml: string): ElementCounts {
    const counts: ElementCounts = {
      buttons: 0,
      inputs: 0,
      links: 0,
      headings: 0,
      images: 0,
      total: 0,
    };

    const lines = ariaYaml.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Match ARIA snapshot YAML roles: "- role" or "- role 'name'"
      const roleMatch = trimmed.match(/^-\s+(\w+)/);
      if (!roleMatch) continue;

      const role = roleMatch[1].toLowerCase();

      if (role === 'button') {
        counts.buttons++;
        counts.total++;
      } else if (
        role === 'textbox' ||
        role === 'combobox' ||
        role === 'spinbutton'
      ) {
        counts.inputs++;
        counts.total++;
      } else if (role === 'link') {
        counts.links++;
        counts.total++;
      } else if (role === 'heading') {
        counts.headings++;
        counts.total++;
      } else if (role === 'img' || role === 'image') {
        counts.images++;
        counts.total++;
      }
    }

    return counts;
  }
}

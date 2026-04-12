import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { FrameAnalysisResult, ExtractedFrame } from './types/vision.types';

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private readonly client: Anthropic | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log('Anthropic client initialized successfully');
    } else {
      this.client = null;
      this.logger.warn(
        'ANTHROPIC_API_KEY is not set. Vision analysis will be unavailable.',
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async analyzeFrame(frame: ExtractedFrame): Promise<FrameAnalysisResult> {
    return {
      frameId: frame.frameId,
      timestampMs: frame.timestampMs,
      description: '',
      elements: [],
      observations: [],
      success: false,
      error: 'Not implemented',
    };
  }
}

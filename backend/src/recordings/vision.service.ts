import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import {
  FrameAnalysisResult,
  ExtractedFrame,
  UIElement,
} from './types/vision.types';

const VISION_PROMPT = `Analyze this UI screenshot and return a JSON object with the following structure:
{
  "description": "A concise description of what is shown in the screenshot",
  "elements": [
    { "type": "button|input|link|text|image|icon|menu|dialog|other", "label": "visible label or description", "state": "optional state like disabled, focused, active" }
  ],
  "observations": ["Notable observation about the UI state, layout, or content"]
}

Focus on the most important and visible UI elements. Return ONLY valid JSON, no additional text.`;

interface VisionAnalysisResponse {
  description: string;
  elements: UIElement[];
  observations: string[];
}

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

  /**
   * Analyzes a single extracted frame using the Anthropic vision API.
   * Returns error result if the client is not available or on failure.
   */
  async analyzeFrame(frame: ExtractedFrame): Promise<FrameAnalysisResult> {
    if (!this.client) {
      return {
        frameId: frame.frameId,
        timestampMs: frame.timestampMs,
        description: '',
        elements: [],
        observations: [],
        success: false,
        error: 'Anthropic client is not available. Check ANTHROPIC_API_KEY.',
      };
    }

    try {
      const imageBuffer = fs.readFileSync(frame.filePath);
      const base64Image = imageBuffer.toString('base64');
      const mediaType = frame.format === 'png' ? 'image/png' : 'image/jpeg';

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: VISION_PROMPT,
              },
            ],
          },
        ],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const rawText = textBlock && 'text' in textBlock ? textBlock.text : '';

      try {
        // Extract JSON from response — Claude may wrap it in markdown code blocks or add surrounding text
        const start = rawText.indexOf('{');
        const end = rawText.lastIndexOf('}');
        if (start < 0 || end <= start) {
          throw new Error('No JSON object found in response');
        }
        const jsonStr = rawText.substring(start, end + 1);
        const parsed: VisionAnalysisResponse = JSON.parse(jsonStr);
        const elements = Array.isArray(parsed.elements) ? parsed.elements : [];
        if (elements.length === 0) {
          this.logger.warn(`Frame ${frame.frameId}: parsed JSON has no elements`);
        }
        return {
          frameId: frame.frameId,
          timestampMs: frame.timestampMs,
          description: parsed.description || '',
          elements,
          observations: parsed.observations || [],
          success: true,
        };
      } catch (parseErr) {
        this.logger.warn(
          `Failed to parse JSON for frame ${frame.frameId}: ${parseErr instanceof Error ? parseErr.message : parseErr}. Raw: ${rawText.substring(0, 200)}`,
        );
        return {
          frameId: frame.frameId,
          timestampMs: frame.timestampMs,
          description: rawText,
          elements: [],
          observations: [],
          success: true,
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Vision analysis failed for frame ${frame.frameId}: ${message}`,
      );
      return {
        frameId: frame.frameId,
        timestampMs: frame.timestampMs,
        description: '',
        elements: [],
        observations: [],
        success: false,
        error: message,
      };
    }
  }

  /**
   * Analyzes multiple frames sequentially and returns all results.
   * Partial failures are tolerated (individual frames may have success: false).
   */
  async analyzeFrames(frames: ExtractedFrame[]): Promise<FrameAnalysisResult[]> {
    this.logger.log(`Starting analysis of ${frames.length} frames`);
    const results: FrameAnalysisResult[] = [];

    for (const frame of frames) {
      const result = await this.analyzeFrame(frame);
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(
      `Frame analysis complete: ${successCount}/${frames.length} succeeded`,
    );

    return results;
  }
}

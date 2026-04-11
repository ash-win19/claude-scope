import { Logger } from '@nestjs/common';

const logger = new Logger('Configuration');

export function validateConfig(config: Record<string, unknown>) {
  if (!config.ANTHROPIC_API_KEY) {
    logger.warn(
      'ANTHROPIC_API_KEY is not set. AI features will be unavailable.',
    );
  }
  return config;
}

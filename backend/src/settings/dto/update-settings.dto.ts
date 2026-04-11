import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: ['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'] })
  @IsOptional()
  @IsEnum(['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'])
  defaultAgent?: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeScreenshots?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inlineAriaTree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeRawDiff?: boolean;

  @ApiPropertyOptional({ minimum: 5, maximum: 300 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(300)
  maxRecordingLength?: number;
}

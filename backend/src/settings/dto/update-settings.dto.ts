import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: ['claude', 'codex', 'cursor', 'raw'] })
  @IsOptional()
  @IsEnum(['claude', 'codex', 'cursor', 'raw'])
  defaultAgent?: 'claude' | 'codex' | 'cursor' | 'raw';

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

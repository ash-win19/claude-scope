import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ enum: ['processing', 'complete', 'error'] })
  @IsOptional()
  @IsEnum(['processing', 'complete', 'error'])
  status?: 'processing' | 'complete' | 'error';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  processingTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ enum: ['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'] })
  @IsOptional()
  @IsEnum(['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'])
  agentTarget?: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  frameCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  urlCount?: number;
}

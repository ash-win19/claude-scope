import {
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadRecordingDto {
  @ApiProperty({ description: 'Title of the recording', maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'Seed URL where the recording started',
    example: 'https://example.com',
  })
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  seedUrl: string;

  @ApiPropertyOptional({ description: 'Optional notes', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Agent target for processing',
    enum: ['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'],
  })
  @IsOptional()
  @IsEnum(['CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW'])
  agentTarget?: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
}

import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'Dashboard dropdown hover bug' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

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

import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'Dashboard dropdown hover bug' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;
}

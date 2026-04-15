import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCredentialDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

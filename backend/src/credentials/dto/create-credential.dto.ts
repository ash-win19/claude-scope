import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

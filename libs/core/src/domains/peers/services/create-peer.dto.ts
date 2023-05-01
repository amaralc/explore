import { IsOptional, IsString } from 'class-validator';

export class CreatePeerDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  username!: string;

  @IsString()
  name!: string;
}

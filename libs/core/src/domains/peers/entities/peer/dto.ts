import { IsArray, IsString } from 'class-validator';

export class PeerDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  username!: string;

  @IsString({ each: true })
  @IsArray()
  subjects!: string[];
}

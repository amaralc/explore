import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class PlanSubscriptionDto {
  @IsString()
  id!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  plan!: string;

  @IsEmail()
  email!: string;
}

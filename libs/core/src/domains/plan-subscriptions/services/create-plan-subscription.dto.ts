import { IsEmail, IsString } from 'class-validator';

export class CreatePlanSubscriptionDto {
  @IsEmail()
  email!: string;

  @IsString()
  plan!: string;
}

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserDto } from '../user/dto';

export class UserCreatedMessageValueDto {
  @ValidateNested()
  @Type(() => UserDto)
  user!: UserDto;
}

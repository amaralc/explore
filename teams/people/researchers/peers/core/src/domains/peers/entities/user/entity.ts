import { randomUUID } from 'crypto';
import { Replace } from '../../../../shared/utils/replace';
import { UserDto } from './dto';

type IMakePeerProps = Replace<UserDto, { id?: string }>;

export class UserEntity extends UserDto {
  constructor({ id, name, username }: IMakePeerProps) {
    super();
    this.id = id ?? randomUUID();
    this.name = name;
    this.username = username;
  }
}

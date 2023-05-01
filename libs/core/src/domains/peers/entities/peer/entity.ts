import { randomUUID } from 'crypto';
import { Replace } from '../../../../shared/utils/replace';
import { PeerDto } from './dto';

type IMakePeerProps = Replace<PeerDto, { id?: string; subjects?: Array<string> }>;

export class PeerEntity extends PeerDto {
  constructor({ id, name, subjects, username }: IMakePeerProps) {
    super();
    this.id = id ?? randomUUID();
    this.name = name;
    this.subjects = subjects ?? [];
    this.username = username;
  }
}

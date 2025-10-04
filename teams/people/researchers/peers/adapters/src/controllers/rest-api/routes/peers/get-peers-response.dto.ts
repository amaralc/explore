import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class GetPeersResponseDto {
  @Type(() => Array<PeerEntity>)
  @ValidateNested({ each: true })
  peers!: Array<PeerEntity>;
}

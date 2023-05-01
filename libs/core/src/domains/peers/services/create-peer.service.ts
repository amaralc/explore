import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { applicationValidateOrReject } from '../../../shared/validators/validate-or-reject';
import { PEERS_ERROR_MESSAGES } from '../constants/error-messages';
import { PeerEntity } from '../entities/peer/entity';
import { PeersDatabaseRepository } from '../repositories/database.repository';
import { CreatePeerDto } from './create-peer.dto';

@Injectable()
export class CreatePeerService {
  constructor(private peersDatabaseRepository: PeersDatabaseRepository) {}

  async execute(createPeerDto: CreatePeerDto): Promise<PeerEntity> {
    // Validate
    const createPeerDtoInstance = plainToInstance(CreatePeerDto, createPeerDto);
    await applicationValidateOrReject(createPeerDtoInstance);

    const existingUser = await this.peersDatabaseRepository.findByUsername(createPeerDto.username);
    if (existingUser) {
      throw new ConflictException(PEERS_ERROR_MESSAGES['CONFLICTING_USERNAME']);
    }

    // Execute
    const peer = await this.peersDatabaseRepository.create(createPeerDto);
    console.log('peer', peer);
    return peer;
  }
}

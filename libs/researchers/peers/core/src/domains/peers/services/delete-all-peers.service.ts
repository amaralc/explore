import { Injectable } from '@nestjs/common';
import { PeersDatabaseRepository } from '../repositories/database.repository';

@Injectable()
export class DeleteAllPeersService {
  constructor(private readonly peersDatabaseRepository: PeersDatabaseRepository) {}

  async execute(): Promise<void> {
    return await this.peersDatabaseRepository.deleteAll();
  }
}

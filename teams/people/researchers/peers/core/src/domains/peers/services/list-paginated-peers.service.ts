import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { ValidationException } from '../../../shared/errors/validation-exception';
import { PeerEntity } from '../entities/peer/entity';
import { PeersDatabaseRepository } from '../repositories/database.repository';
import { ListPaginatedPeersDto } from './list-paginated-peers.dto';

@Injectable()
export class ListPaginatedPeersService {
  constructor(private readonly peersDatabaseRepository: PeersDatabaseRepository) {}

  async execute(listPaginatedPeersDto: ListPaginatedPeersDto): Promise<Array<PeerEntity>> {
    await validateOrReject(plainToInstance(ListPaginatedPeersDto, listPaginatedPeersDto)).catch(
      (validationErrors: ValidationError[]) => {
        throw new ValidationException(validationErrors, 'Invalid payload');
      }
    );

    return await this.peersDatabaseRepository.listPaginated(listPaginatedPeersDto);
  }
}

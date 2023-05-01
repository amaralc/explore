import { faker } from '@faker-js/faker';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryPeersDatabaseRepository } from '../repositories/database-in-memory.repository';
import { PeersDatabaseRepository } from '../repositories/database.repository';
import { InMemoryPeersEventsRepository } from '../repositories/events-in-memory.repository';
import { PeersEventsRepository } from '../repositories/events.repository';
import { CreatePeerService } from './create-peer.service';

describe('[peers] CreatePeerService', () => {
  const fakeName = faker.name.fullName();
  const fakeUsername = faker.internet.userName(fakeName);
  let service: CreatePeerService;
  let databaseRepository: PeersDatabaseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePeerService,
        { provide: PeersDatabaseRepository, useClass: InMemoryPeersDatabaseRepository },
        { provide: PeersEventsRepository, useClass: InMemoryPeersEventsRepository },
      ],
    }).compile();

    service = module.get<CreatePeerService>(CreatePeerService);
    databaseRepository = module.get<PeersDatabaseRepository>(PeersDatabaseRepository);
  });

  it('should create a new peer', async () => {
    const peer = await service.execute({
      name: fakeName,
      username: fakeUsername,
    });

    const databaseRepositoryPeer = await databaseRepository.findByUsername(fakeUsername);

    expect(databaseRepositoryPeer?.username).toEqual(fakeUsername);
    expect(peer.username).toEqual(fakeUsername);
    expect(peer.name).toEqual(fakeName);
  });

  it('should throw conflict exception if username is already being used', async () => {
    await service.execute({
      name: fakeName,
      username: fakeUsername,
    });

    await expect(
      service.execute({
        name: 'Other Name',
        username: fakeUsername,
      })
    ).rejects.toThrow(ConflictException);
  });
});

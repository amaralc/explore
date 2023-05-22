import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { NativeLogger } from '../../../shared/logs/native-logger';
import { PeerEntity } from '../entities/peer/entity';
import { InMemoryPeersDatabaseRepository } from '../repositories/database-in-memory.repository';
import { PeersDatabaseRepository } from '../repositories/database.repository';
import { DeleteAllPeersService } from './delete-all-peers.service';

describe('[peers] DeleteAllPeersService', () => {
  const numberOfFakePeers = 5;
  let service: DeleteAllPeersService;
  let databaseRepository: PeersDatabaseRepository;
  const localPeersTestDatabaseRepository: PeerEntity[] = [];

  beforeAll(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAllPeersService,
        { provide: ApplicationLogger, useClass: NativeLogger },
        { provide: PeersDatabaseRepository, useClass: InMemoryPeersDatabaseRepository },
      ],
    }).compile();

    service = module.get<DeleteAllPeersService>(DeleteAllPeersService);
    databaseRepository = module.get<PeersDatabaseRepository>(PeersDatabaseRepository);

    for (let i = 0; i < numberOfFakePeers; i++) {
      const fakeFullName = faker.name.fullName();
      const planSubscription = await databaseRepository.create({
        name: fakeFullName,
        username: faker.internet.userName(fakeFullName),
      });
      localPeersTestDatabaseRepository.push(planSubscription);
    }
  });

  it('should delete all peers', async () => {
    expect((await databaseRepository.listPaginated({})).length).toEqual(numberOfFakePeers);
    await service.execute();
    expect((await databaseRepository.listPaginated({})).length).toEqual(0);
  });
});

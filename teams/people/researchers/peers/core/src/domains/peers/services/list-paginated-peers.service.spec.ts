import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { pagination } from '../../../shared/config';
import { ValidationException } from '../../../shared/errors/validation-exception';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { NativeLogger } from '../../../shared/logs/native-logger';
import { PeerEntity } from '../entities/peer/entity';
import { InMemoryPeersDatabaseRepository } from '../repositories/database-in-memory.repository';
import { PeersDatabaseRepository } from '../repositories/database.repository';
import { ListPaginatedPeersService } from './list-paginated-peers.service';

describe('[peers] ListPaginatedPeersService', () => {
  let listPaginatedPeersService: ListPaginatedPeersService;
  let databaseRepository: PeersDatabaseRepository;
  const localPeersTestDatabaseRepository: PeerEntity[] = [];

  beforeAll(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPaginatedPeersService,
        { provide: ApplicationLogger, useClass: NativeLogger },
        { provide: PeersDatabaseRepository, useClass: InMemoryPeersDatabaseRepository },
      ],
    }).compile();

    listPaginatedPeersService = module.get<ListPaginatedPeersService>(ListPaginatedPeersService);
    databaseRepository = module.get<PeersDatabaseRepository>(PeersDatabaseRepository);

    for (let i = 0; i < 20; i++) {
      const fakeFullName = faker.name.fullName();
      const planSubscription = await databaseRepository.create({
        name: fakeFullName,
        username: faker.internet.userName(fakeFullName),
      });
      localPeersTestDatabaseRepository.push(planSubscription);
    }
  });

  it('should throw error for invalid pagination parameters', async () => {
    await expect(listPaginatedPeersService.execute({ limit: -1, page: 1 })).rejects.toThrow(ValidationException);
    await expect(listPaginatedPeersService.execute({ limit: 1, page: 0 })).rejects.toThrow(ValidationException);

    const invalidParameters = JSON.parse(JSON.stringify({ limit: 'x', page: 'y' }));
    await expect(listPaginatedPeersService.execute(invalidParameters)).rejects.toThrow(ValidationException);
  });

  it('should list paginated plan subscriptions with default limit and page if not specified', async () => {
    const LIMIT = pagination.defaultLimit;
    const PAGE = pagination.defaultPage;

    const planSubscriptions = await listPaginatedPeersService.execute({});
    const localPlanSubscriptions = [...localPeersTestDatabaseRepository];
    const expectedPlanSubscriptions = localPlanSubscriptions.slice(PAGE - 1, LIMIT);

    expect(planSubscriptions.length).toBeLessThanOrEqual(LIMIT);
    expect(planSubscriptions).toEqual(expectedPlanSubscriptions);
  });

  it('should list paginated peers given valid page and limit values', async () => {
    const LIMIT = 5;
    const PAGE = 1;

    const planSubscriptions = await listPaginatedPeersService.execute({ limit: LIMIT, page: PAGE });
    const localPlanSubscriptions = [...localPeersTestDatabaseRepository];
    const expectedPlanSubscriptions = localPlanSubscriptions.slice(PAGE - 1, LIMIT);

    expect(planSubscriptions.length).toBeLessThanOrEqual(LIMIT);
    expect(planSubscriptions).toEqual(expectedPlanSubscriptions);
  });
});

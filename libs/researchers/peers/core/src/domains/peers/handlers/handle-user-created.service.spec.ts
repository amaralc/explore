import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { IKafkaMessage } from '../../../shared/infra/events.types';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { NativeLogger } from '../../../shared/logs/native-logger';
import { PeerEntity } from '../entities/peer/entity';
import { UserCreatedMessageValueDto } from '../entities/user-created-message-value/dto';
import { InMemoryPeersDatabaseRepository } from '../repositories/database-in-memory.repository';
import { PeersDatabaseRepository } from '../repositories/database.repository';
import { HandleUserCreatedService } from './handle-user-created.service';

describe('[peers] HandleUserCreatedService', () => {
  const fakeName = faker.name.fullName();
  const fakeUsername = faker.internet.userName(fakeName);
  let service: HandleUserCreatedService;
  let databaseRepository: PeersDatabaseRepository;
  let partialMessage: Pick<IKafkaMessage, 'key' | 'attributes' | 'offset' | 'timestamp'>;
  const topic = 'my-topic';
  const partition = 0;

  beforeEach(async () => {
    jest.clearAllMocks();
    partialMessage = {
      key: Buffer.from('0'),
      attributes: 1,
      offset: '0',
      timestamp: new Date().toISOString(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleUserCreatedService,
        { provide: ApplicationLogger, useClass: NativeLogger },
        { provide: PeersDatabaseRepository, useClass: InMemoryPeersDatabaseRepository },
      ],
    }).compile();

    service = module.get<HandleUserCreatedService>(HandleUserCreatedService);
    databaseRepository = module.get<PeersDatabaseRepository>(PeersDatabaseRepository);
  });

  afterEach(async () => {
    await databaseRepository.deleteAll();
  });

  it('should log validation exception if message payload is not valid', async () => {
    let messageValue;
    messageValue = Buffer.from(JSON.stringify({ key: 'value' }));
    await expect(
      service.execute({
        topic,
        partition,
        message: {
          ...partialMessage,
          value: messageValue,
          headers: {},
        },
      })
    ).resolves.toEqual(undefined);

    messageValue = null;
    await expect(
      service.execute({
        topic,
        partition,
        message: {
          ...partialMessage,
          value: messageValue,
          headers: {},
        },
      })
    ).resolves.toEqual(undefined);

    messageValue = Buffer.from('1');
    await expect(
      service.execute({
        topic,
        partition,
        message: {
          ...partialMessage,
          value: messageValue,
          headers: {},
        },
      })
    ).resolves.toEqual(undefined);

    await expect(databaseRepository.listPaginated({})).resolves.toEqual([]);
  });

  it('should create peer if payload is valid', async () => {
    const entity: UserCreatedMessageValueDto = {
      user: {
        id: randomUUID(),
        name: fakeName,
        username: fakeUsername,
      },
    };

    const messageValue = Buffer.from(JSON.stringify(entity));
    await expect(
      service.execute({
        topic,
        partition,
        message: {
          ...partialMessage,
          value: messageValue,
          headers: {},
        },
      })
    ).resolves.not.toThrow();
    await expect(databaseRepository.listPaginated({})).resolves.toEqual([
      new PeerEntity({ name: entity.user.name, username: entity.user.username, id: entity.user.id }),
    ]);
  });
});

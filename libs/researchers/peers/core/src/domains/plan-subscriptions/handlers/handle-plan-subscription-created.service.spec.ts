import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { IKafkaMessage } from '../../../shared/infra/events.types';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { NativeLogger } from '../../../shared/logs/native-logger';
import { PlanSubscriptionCreatedMessageDto } from '../entities/plan-subscription-created-message/dto';
import { PlanSubscriptionEntity } from '../entities/plan-subscription/entity';
import { InMemoryPlanSubscriptionsDatabaseRepository } from '../repositories/database-in-memory.repository';
import { PlanSubscriptionsDatabaseRepository } from '../repositories/database.repository';
import { HandlePlanSubscriptionCreatedService } from './handle-plan-subscription-created.service';

describe('[plan-subscriptions] HandlePlanSubscriptionCreatedService', () => {
  let handlePlanSubscriptionCreatedService: HandlePlanSubscriptionCreatedService;
  let databaseRepository: PlanSubscriptionsDatabaseRepository;
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
        HandlePlanSubscriptionCreatedService,
        { provide: ApplicationLogger, useClass: NativeLogger },
        { provide: PlanSubscriptionsDatabaseRepository, useClass: InMemoryPlanSubscriptionsDatabaseRepository },
      ],
    }).compile();

    handlePlanSubscriptionCreatedService = module.get<HandlePlanSubscriptionCreatedService>(
      HandlePlanSubscriptionCreatedService
    );
    databaseRepository = module.get<PlanSubscriptionsDatabaseRepository>(PlanSubscriptionsDatabaseRepository);
  });

  afterEach(async () => {
    await databaseRepository.deleteAll();
  });

  it('should log validation exception if message payload is not valid', async () => {
    let messageValue;
    messageValue = Buffer.from(JSON.stringify({ key: 'value' }));
    await expect(
      handlePlanSubscriptionCreatedService.execute({
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
      handlePlanSubscriptionCreatedService.execute({
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
      handlePlanSubscriptionCreatedService.execute({
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

  it('should create plan subscription if payload is valid', async () => {
    const entity: PlanSubscriptionCreatedMessageDto = {
      id: randomUUID(),
      isActive: faker.datatype.boolean(),
      email: faker.internet.email(),
      plan: faker.lorem.slug(1),
    };

    const messageValue = Buffer.from(JSON.stringify(entity));
    await expect(
      handlePlanSubscriptionCreatedService.execute({
        topic,
        partition,
        message: {
          ...partialMessage,
          value: messageValue,
          headers: {},
        },
      })
    ).resolves.not.toThrow();
    await expect(databaseRepository.listPaginated({})).resolves.toEqual([new PlanSubscriptionEntity(entity)]);
  });
});

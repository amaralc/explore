import { faker } from '@faker-js/faker';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationException } from '../../../shared/errors/validation-exception';
import { ApplicationLogger } from '../../../shared/logs/application-logger';
import { NativeLogger } from '../../../shared/logs/native-logger';
import { InMemoryPlanSubscriptionsDatabaseRepository } from '../repositories/database-in-memory.repository';
import { PlanSubscriptionsDatabaseRepository } from '../repositories/database.repository';
import { CreatePlanSubscriptionService } from './create-plan-subscription.service';

describe('[plan-subscriptions] CreatePlanSubscriptionService', () => {
  let service: CreatePlanSubscriptionService;
  let databaseRepository: PlanSubscriptionsDatabaseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePlanSubscriptionService,
        { provide: ApplicationLogger, useClass: NativeLogger },
        { provide: PlanSubscriptionsDatabaseRepository, useClass: InMemoryPlanSubscriptionsDatabaseRepository },
      ],
    }).compile();

    service = module.get<CreatePlanSubscriptionService>(CreatePlanSubscriptionService);
    databaseRepository = module.get<PlanSubscriptionsDatabaseRepository>(PlanSubscriptionsDatabaseRepository);
  });

  it('should throw conflict exception if e-mail is already being used', async () => {
    const newUserEmail = faker.internet.email();
    await service.execute({
      email: newUserEmail,
      plan: 'default',
    });
    await expect(
      service.execute({
        email: newUserEmail,
        plan: 'default',
      })
    ).rejects.toThrow(ConflictException);
  });

  it('should throw validation exception if e-mail is not valid', async () => {
    const invalidUserEmail = 'invalid-user-email';
    await expect(
      service.execute({
        email: invalidUserEmail,
        plan: 'default',
      })
    ).rejects.toThrow(ValidationException);
  });

  it('should create a new plan-subscription', async () => {
    const email = faker.internet.email();
    const createPlanSubscriptionDto = {
      email,
      plan: 'default',
    };

    await service.execute(createPlanSubscriptionDto);
    const planSubscription = await databaseRepository.findByEmail(email);
    expect(planSubscription).toBeDefined();
    expect(planSubscription?.isActive).toEqual(true);
  });
});

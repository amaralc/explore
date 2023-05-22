import { faker } from '@faker-js/faker';
import axios, { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { Kafka, Partitioners } from 'kafkajs';

const setupTest = async () => {
  const kafkaClient = new Kafka({
    brokers: ['localhost:9092'],
    clientId: 'core-peers-svc-e2e',
  });

  const planSubscriptionMessages = [];
  const producer = kafkaClient.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  await producer.connect();
  for (let i = 0; i < 10; i++) {
    const planSubscriptionCreatedMessage = {
      id: randomUUID(),
      email: faker.internet.email(),
      plan: faker.lorem.slug(1),
      isActive: faker.datatype.boolean(),
    };
    planSubscriptionMessages.push(planSubscriptionCreatedMessage);

    await producer.send({
      topic: 'plan-subscription-created',
      messages: [{ value: JSON.stringify(planSubscriptionCreatedMessage) }],
    });
  }
  await producer.disconnect();
  return { planSubscriptionMessages };
};

describe('[GET] /plan-subscriptions', () => {
  it('[200] should list all plan subscriptions with pagination', async () => {
    // Setup tests
    await setupTest();

    const PAGE = 1;
    const LIMIT = 5;

    // Dispatch get request
    try {
      const res = await axios.get(`/plan-subscriptions?page=${PAGE}&limit=${LIMIT}`, {
        headers: {
          Authorization: 'my-secret-api-key',
        },
      });
      // Assert that the response status is 200
      expect(res.status).toBe(200);

      // Expect that the response data is an array containing no more than LIMIT plan subscriptions that have "isActive", "id", "email" and "plan" attributes. "email" must be an email
      expect(res.data.planSubscriptions.length).toBeLessThanOrEqual(LIMIT);
      expect(res.data).toEqual(
        expect.objectContaining({
          planSubscriptions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              isActive: expect.any(Boolean),
              email: expect.stringMatching(/.+@.+..+/),
              plan: expect.any(String),
            }),
          ]),
        })
      );
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it('[400] should throw error for invalid pagination parameters', async () => {
    // Setup tests
    let PAGE = -1;
    let LIMIT = 1;
    try {
      await axios.get(`/plan-subscriptions?page=${PAGE}&limit=${LIMIT}`, {
        headers: {
          Authorization: 'my-secret-api-key',
        },
      });
      expect(true).toEqual(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AxiosError);
      if (e instanceof AxiosError) {
        expect(e.response.status).toEqual(400);
      }
    }

    PAGE = 1;
    LIMIT = -1;
    try {
      await axios.get(`/plan-subscriptions?page=${PAGE}&limit=${LIMIT}`, {
        headers: {
          Authorization: 'my-secret-api-key',
        },
      });
      expect(true).toEqual(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AxiosError);
      if (e instanceof AxiosError) {
        expect(e.response.status).toEqual(400);
      }
    }
  });
});

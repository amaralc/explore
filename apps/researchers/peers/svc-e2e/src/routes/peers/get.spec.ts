import { faker } from '@faker-js/faker';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Kafka, Partitioners } from 'kafkajs';
import { delay } from '../../support/delay';

describe('[GET] /peers', () => {
  const userCreatedMessageValues = [];

  const kafkaClient = new Kafka({
    brokers: ['localhost:9092'],
    clientId: 'core-peers-svc-e2e',
  });

  beforeAll(async () => {
    await axios.delete('/peers', {
      headers: {
        Authorization: 'my-secret-api-key',
      },
    });

    const producer = kafkaClient.producer({ createPartitioner: Partitioners.DefaultPartitioner });
    await producer.connect();

    const userCreatedMessages = [];
    for (let i = 0; i < 10; i++) {
      const fakeFullName = faker.name.fullName();
      const fakeUsername = faker.internet.userName(fakeFullName);
      const userCreatedMessageValue = {
        user: {
          id: randomUUID(),
          name: fakeFullName,
          username: fakeUsername,
        },
      };
      userCreatedMessageValues.push(userCreatedMessageValue);
      userCreatedMessages.push({ value: JSON.stringify(userCreatedMessageValue) });
    }

    await producer.send({
      topic: 'user-created',
      messages: [...userCreatedMessages],
    });

    await producer.disconnect();
    console.log('Waiting for 5 seconds before resuming...');
    await delay(5000);
  }, 30000);

  afterAll(async () => {
    await axios.delete('/peers', {
      headers: {
        Authorization: 'my-secret-api-key',
      },
    });
  });

  it('[200] should list all peers with pagination', async () => {
    const PAGE = 1;
    const LIMIT = 50;

    const res = await axios.get(`/peers?page=${PAGE}&limit=${LIMIT}`, {
      headers: {
        Authorization: 'my-secret-api-key',
      },
    });
    // Assert that the response status is 200
    expect(res.status).toBe(200);

    // Expect that the response data is an array containing no more than LIMIT plan subscriptions that have "isActive", "id", "email" and "plan" attributes. "email" must be an email
    expect(res.data.peers.length).toBeLessThanOrEqual(LIMIT);
    expect(res.data.peers.length).toBeGreaterThan(0);
    expect(res.data.peers).toEqual(
      userCreatedMessageValues
        .map((messageValue) => ({
          id: messageValue.user.id,
          name: messageValue.user.name,
          username: messageValue.user.username,
          subjects: [],
        }))
        .splice(PAGE - 1, LIMIT)
    );
  });

  it('[400] should throw error for invalid pagination parameters', async () => {
    // Setup tests
    let PAGE = -1;
    let LIMIT = 1;
    try {
      await axios.get(`/peers?page=${PAGE}&limit=${LIMIT}`, {
        headers: {
          Authorization: 'my-secret-api-key',
        },
      });
      fail('should throw error for invalid pagination parameters');
    } catch (error) {
      if (error.response) {
        expect(error.response.status).toEqual(400);
      } else {
        throw error;
      }
    }

    PAGE = 1;
    LIMIT = -1;
    try {
      await axios.get(`/peers?page=${PAGE}&limit=${LIMIT}`, {
        headers: {
          Authorization: 'my-secret-api-key',
        },
      });
      fail('should throw error for invalid pagination parameters');
    } catch (error) {
      if (error.response) {
        expect(error.response.status).toEqual(400);
      } else {
        throw error;
      }
    }
  });
});

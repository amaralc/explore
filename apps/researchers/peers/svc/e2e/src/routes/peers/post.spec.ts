import { faker } from '@faker-js/faker';
import axios from 'axios';

describe('[POST] /peers', () => {
  const fakeName = faker.name.fullName();
  const fakeUsername = faker.internet.userName(fakeName);

  it('[201] should create new peer', async () => {
    const res = await axios.post(
      `/peers`,
      {
        name: fakeName,
        username: fakeUsername,
      },
      {
        headers: {
          Authorization: 'my-secret-api-key',
        },
      }
    );

    expect(res.status).toBe(201);
    expect(res.data).toEqual({
      id: expect.any(String),
      username: fakeUsername,
      name: fakeName,
      subjects: [],
    });
  });

  it('[409] should not create two peers with the username', async () => {
    try {
      await axios.post(
        `/peers`,
        {
          name: fakeName,
          username: fakeUsername,
        },
        {
          headers: {
            Authorization: 'my-secret-api-key',
          },
        }
      );

      await axios.post(
        `/peers`,
        {
          name: 'Different Name',
          username: fakeUsername, // same username
        },
        {
          headers: {
            Authorization: 'my-secret-api-key',
          },
        }
      );

      fail('Expected to fail');
    } catch (error) {
      if (error.response) {
        expect(error.response.status).toEqual(409);
      } else {
        throw error;
      }
    }
  });
});

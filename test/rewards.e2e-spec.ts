import { faker } from '@faker-js/faker';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import NeDB from '@seald-io/nedb';
import { AppModule } from 'src/app.module';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { createRandomReward } from 'src/mocks/rewards';
import type { Reward } from 'src/rewards/models/reward.model';
import type { User } from 'src/users/models/user.model';
import request from 'superwstest';
import { AUTH_HEADER, subscribeRequest, TEST_USER } from './e2e-test.util';

describe('RewardsResolver (e2e)', () => {
  let app: INestApplication;

  let mockRewardsDb: NeDB<Reward>;
  let mockUsersDb: NeDB<User>;

  beforeEach(async () => {
    mockRewardsDb = new NeDB<Reward>();
    mockUsersDb = new NeDB<User>();

    await mockUsersDb.insertAsync(TEST_USER);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('REWARDS_DB')
      .useValue(mockRewardsDb)
      .overrideProvider('USERS_DB')
      .useValue(mockUsersDb)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await app.listen(0, '0.0.0.0');
  });

  afterEach(async () => {
    await app.close();
  });

  it('reward', async () => {
    const reward = createRandomReward();
    reward.reason = faker.lorem.sentence();

    await mockRewardsDb.insertAsync(reward);

    const test = request(app.getHttpServer())
      .post('/graphql')
      .set(AUTH_HEADER)
      .send({
        operationName: 'reward',
        query: `#graphql
        query reward($id: ID!) {
          reward(id: $id) {
            id
            createdAt
            lastModifiedAt
            giverId
            receiverId
            date
            reason
            anonymous
          }
        }`,
        variables: {
          id: reward.id,
        },
      })
      .expect(200)
      .expect(({ body }) => {
        const data = body.data;

        const expected = {
          ...reward,
          createdAt: reward.createdAt.toISOString(),
          lastModifiedAt: reward.lastModifiedAt.toISOString(),
          date: reward.date.toISOString(),
          reason: reward.reason,
        };

        expect(data.reward).toEqual(expected);
      });

    return test;
  });

  it('addReward', async () => {
    const subscribeRewardAddedRequest = subscribeRequest({
      query: `#graphql
      subscription rewardAdded {
        rewardAdded {
          id
          createdAt
        }
      }`,
    });

    const subscriptionTest = request(app.getHttpServer())
      .ws('/graphql', ['graphql-transport-ws'])
      .sendJson({
        type: 'connection_init',
        payload: AUTH_HEADER,
      })
      .expectJson({ type: 'connection_ack' })
      .sendJson(subscribeRewardAddedRequest);

    await subscriptionTest;

    let id = '';

    await request(app.getHttpServer())
      .post('/graphql')
      .set(AUTH_HEADER)
      .send({
        operationName: 'addReward',
        query: `#graphql
        mutation addReward($data: NewRewardInput!) {
          addReward(newRewardData: $data) {
            id
            createdAt
            reason
          }
        }`,
        variables: {
          data: {
            giverId: faker.datatype.uuid(),
            receiverId: faker.datatype.uuid(),
            reason: 'reason',
          },
        },
      })
      .expect(200)
      .expect(({ body }) => {
        const data = body.data;
        expect(data.addReward).toBeTruthy();
        expect(data.addReward).toEqual({
          id: expect.stringMatching(UUID_V4_REGEX),
          createdAt: expect.any(String),
          reason: 'reason',
        });
        id = data.addReward.id;
      });

    await subscriptionTest
      .expectJson((message) => {
        expect(message.type).toEqual('next');
        expect(message.id).toEqual(subscribeRewardAddedRequest.id);
        const data = message.payload.data;
        expect(data).toEqual({
          rewardAdded: {
            id,
            createdAt: expect.any(String),
          },
        });
      })
      .close()
      .expectClosed();
  });

  it('rewards', async () => {
    const totalCount = 5;
    await mockRewardsDb.insertAsync(
      Array.from({ length: totalCount }, () => createRandomReward()),
    );

    const test = request(app.getHttpServer())
      .post('/graphql')
      .set(AUTH_HEADER)
      .send({
        operationName: 'rewards',
        query: `#graphql
        query rewards {
          rewards {
            nodes {
              id
            }
            pageInfo {
              totalCount
            }
          }
        }`,
      })
      .expect(200)
      .expect(({ body }) => {
        const data = body.data;
        expect(data.rewards.nodes[0].id).toEqual(
          expect.stringMatching(UUID_V4_REGEX),
        );
        expect(data.rewards.pageInfo.totalCount).toEqual(totalCount);
      });

    return test;
  });

  it('removeReward', async () => {
    const reward = createRandomReward();
    const id = reward.id;

    await mockRewardsDb.insertAsync(reward);

    const subscribeRewardRemovedRequest = subscribeRequest({
      query: `#graphql
      subscription rewardRemoved {
        rewardRemoved
      }`,
    });

    const subscriptionTest = request(app.getHttpServer())
      .ws('/graphql', ['graphql-transport-ws'])
      .sendJson({
        type: 'connection_init',
        payload: AUTH_HEADER,
      })
      .expectJson({ type: 'connection_ack' })
      .sendJson(subscribeRewardRemovedRequest);

    await subscriptionTest;

    await request(app.getHttpServer())
      .post('/graphql')
      .set(AUTH_HEADER)
      .send({
        operationName: 'removeReward',
        query: `#graphql
        mutation removeReward($id: ID!) {
          removeReward(id: $id)
        }`,
        variables: {
          id,
        },
      })
      .expect(200)
      .expect(({ body }) => {
        const data = body.data;
        expect(data.removeReward).toBeTruthy();
      });

    await subscriptionTest
      .expectJson((message) => {
        expect(message.type).toEqual('next');
        expect(message.id).toEqual(subscribeRewardRemovedRequest.id);
        const data = message.payload.data;
        expect(data).toEqual({
          rewardRemoved: id,
        });
      })
      .close()
      .expectClosed();
  });
});

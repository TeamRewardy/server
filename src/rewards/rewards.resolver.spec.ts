import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { GraphQLResolveInfo } from 'graphql';
import { PageInfo } from 'src/common/models/paginated.model';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { createRandomReward } from 'src/mocks/rewards';
import { USERS } from 'src/mocks/users';
import { PubSubModule } from 'src/pub-sub.module';
import type { Reward } from './models/reward.model';
import { PaginatedReward } from './models/reward.model';
import { RewardsResolver } from './rewards.resolver';
import { RewardsService } from './rewards.service';

describe('RewardsResolver', () => {
  let resolver: RewardsResolver;

  let mockRewardsService: Partial<RewardsService> = {};

  beforeEach(async () => {
    mockRewardsService = {};

    const module: TestingModule = await Test.createTestingModule({
      imports: [PubSubModule],
      providers: [RewardsResolver, RewardsService],
    })
      .overrideProvider(RewardsService)
      .useValue(mockRewardsService)
      .compile();

    resolver = module.get<RewardsResolver>(RewardsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a reward', async () => {
    mockRewardsService.create = jest.fn().mockImplementation(async (dto) => {
      const result = {
        ...dto,
        id: faker.datatype.uuid(),
      };
      return result;
    });

    const actual = await resolver.addReward({
      giverId: faker.helpers.arrayElement(USERS).id,
      receiverId: faker.helpers.arrayElement(USERS).id,
    });

    expect(actual).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(UUID_V4_REGEX),
      }),
    );

    expect(mockRewardsService.create).toHaveBeenCalled();
  });

  it('should find paginated rewards', async () => {
    const rewards: Reward[] = [];

    for (let index = 0; index < 30; index++) {
      rewards.push(createRandomReward());
    }

    mockRewardsService.findAll = jest
      .fn()
      .mockImplementation(() => Promise.resolve(rewards.slice(0, 10)));
    mockRewardsService.count = jest
      .fn()
      .mockImplementation(() => Promise.resolve(rewards.length));

    const response = await resolver.rewards(
      {},
      {},
      {},
      { offset: 0, limit: 10 },
      {
        fieldNodes: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rewards' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'nodes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pageInfo' } },
              ],
            },
          },
        ],
      } as unknown as GraphQLResolveInfo,
    );

    const pageInfo = new PageInfo();
    pageInfo.hasNextPage = true;
    pageInfo.totalCount = 30;

    const expected = new PaginatedReward();
    expected.nodes = rewards.slice(0, 10);
    expected.pageInfo = pageInfo;

    expect(response).toStrictEqual(expected);
  });
});

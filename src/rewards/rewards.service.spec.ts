import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { REWARDS } from 'src/mocks/rewards';
import { USERS } from 'src/mocks/users';
import { Reward } from './models/reward.model';
import { RewardsService } from './rewards.service';

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardsService],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new reward', async () => {
    const actual = await service.create({
      giverId: faker.helpers.arrayElement(USERS).id,
      receiverId: faker.helpers.arrayElement(USERS).id,
    });

    expect(actual).toBeTruthy();
    expect(actual).toBeInstanceOf(Reward);
    expect(actual).toEqual({
      id: expect.stringMatching(UUID_V4_REGEX),
      createdAt: expect.any(Date),
      lastModifiedAt: expect.any(Date),
      giverId: expect.stringMatching(UUID_V4_REGEX),
      receiverId: expect.stringMatching(UUID_V4_REGEX),
      date: expect.any(Date),
      anonymous: false,
    });
  });

  it('should find rewards', async () => {
    const totalCount = REWARDS.length;

    // const mockedRewards = Array.from({ length: totalCount }, () =>
    //   createRandomReward(),
    // );

    const rewards = await service.findAll({ offset: 0, limit: 10 });
    expect(rewards).toHaveLength(totalCount);
    expect(rewards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(UUID_V4_REGEX),
        }),
      ]),
    );
  });

  it('should count rewards', async () => {
    const count = await service.count({});
    expect(count).toEqual(REWARDS.length);
  });
});

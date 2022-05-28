import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import NeDB from '@seald-io/nedb';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { createRandomReward } from 'src/mocks/rewards';
import { createRandomUser } from 'src/mocks/users';
import type { User } from 'src/users/models/user.model';
import { Reward } from './models/reward.model';
import { RewardsService } from './rewards.service';

describe('RewardsService', () => {
  let service: RewardsService;

  let mockDb: NeDB<Reward>;

  beforeEach(async () => {
    mockDb = new NeDB<Reward>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardsService, { provide: 'REWARDS_DB', useValue: mockDb }],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new reward', async () => {
    const users: User[] = Array.from({ length: 5 }, () => createRandomUser());

    const actual = await service.create({
      giverId: faker.helpers.arrayElement(users).id,
      receiverId: faker.helpers.arrayElement(users).id,
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
    const totalCount = 5;
    await mockDb.insertAsync(
      Array.from({ length: totalCount }, () => createRandomReward()),
    );

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
    const totalCount = 5;
    await mockDb.insertAsync(
      Array.from({ length: totalCount }, () => createRandomReward()),
    );

    const count = await service.count({});
    expect(count).toEqual(totalCount);
  });
});

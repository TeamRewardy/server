import { faker } from '@faker-js/faker';
import type { RewardId } from 'src/rewards/models/reward.model';
import { Reward } from 'src/rewards/models/reward.model';
import { createRandomNode } from './node';
import { USERS } from './users';

export const REWARDS: Reward[] = [];

export function createRandomReward(): Reward {
  return new Reward({
    ...createRandomNode<RewardId>(),

    giverId: faker.helpers.arrayElement(USERS).id,
    receiverId: faker.helpers.arrayElement(USERS).id,
    date: faker.date.past(),
    reason: faker.helpers.maybe(() => faker.lorem.sentence()),
    anonymous: faker.datatype.boolean(),
  });
}

Array.from({ length: 10 }).forEach(() => {
  REWARDS.push(createRandomReward());
});

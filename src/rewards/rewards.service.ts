import { faker } from '@faker-js/faker';
import { Injectable, Logger } from '@nestjs/common';
import type { PaginationArgs } from 'src/common/dto/pagination.args';
import type { SearchArgs } from 'src/common/dto/search.args';
import type { SortArgs } from 'src/common/dto/sort.args';
import { REWARDS } from 'src/mocks/rewards';
import type { NewRewardInput } from './dto/new-reward.input';
import type { RewardsFilterArgs } from './dto/rewards-filter.args';
import type { RewardId } from './models/reward.model';
import { Reward } from './models/reward.model';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  async create(data: NewRewardInput): Promise<Reward> {
    const reward = new Reward({
      ...data,
      id: faker.datatype.uuid() as unknown as RewardId,
    });
    REWARDS.push(reward);
    return reward;
  }

  async findOneById(id: RewardId): Promise<Reward | undefined> {
    return REWARDS.find((reward) => reward.id === id);
  }

  async findAll(
    rewardsArgs: RewardsFilterArgs & SearchArgs & SortArgs & PaginationArgs,
  ): Promise<Reward[]> {
    return REWARDS;
  }

  async count(rewardsArgs: RewardsFilterArgs & SearchArgs): Promise<number> {
    return REWARDS.length;
  }

  async findAllByIds(
    ids: readonly RewardId[],
  ): Promise<Array<Reward | Error | undefined>> {
    return ids.map((id) => REWARDS.find((reward) => reward.id === id));
  }

  async remove(id: RewardId): Promise<boolean> {
    let result = false;
    const idx = REWARDS.findIndex((reward) => reward.id === id);
    if (idx >= 0) {
      REWARDS.splice(idx, 1);
      result = true;
    }
    return result;
  }
}

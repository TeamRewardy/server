import { faker } from '@faker-js/faker';
import { Inject, Injectable, Logger } from '@nestjs/common';
import NeDB from '@seald-io/nedb';
import type { PaginationArgs } from 'src/common/dto/pagination.args';
import type { SearchArgs } from 'src/common/dto/search.args';
import type { SortArgs } from 'src/common/dto/sort.args';
import type { NewRewardInput } from './dto/new-reward.input';
import type { RewardsFilterArgs } from './dto/rewards-filter.args';
import type { RewardId } from './models/reward.model';
import { Reward } from './models/reward.model';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(@Inject('REWARDS_DB') private readonly db: NeDB<Reward>) {}

  async create(data: NewRewardInput): Promise<Reward> {
    const reward = new Reward({
      ...data,
      id: faker.datatype.uuid() as unknown as RewardId,
    });
    await this.db.insertAsync(reward);
    return reward;
  }

  async findOneById(id: RewardId): Promise<Reward | undefined> {
    return this.db
      .findOneAsync({ id })
      .then((reward) => (reward ? new Reward(reward) : undefined));
  }

  async findAll(
    rewardsArgs: RewardsFilterArgs & SearchArgs & SortArgs & PaginationArgs,
  ): Promise<Reward[]> {
    let cursor = this.db.findAsync({});
    if (rewardsArgs.sortBy) {
      cursor = cursor.sort({
        [rewardsArgs.sortBy]: rewardsArgs.sortDesc ? -1 : 1,
      });
    }
    return await cursor
      .skip(rewardsArgs.offset)
      .limit(rewardsArgs.limit)
      .then((rewards) => rewards.map((reward) => new Reward(reward)));
  }

  async count(rewardsArgs: RewardsFilterArgs & SearchArgs): Promise<number> {
    return await this.db.countAsync({});
  }

  async findAllByIds(
    ids: readonly RewardId[],
  ): Promise<Array<Reward | Error | undefined>> {
    const rewards = await this.db
      .findAsync({ id: { $in: ids } })
      .then((rewards) => rewards.map((reward) => new Reward(reward)));
    return ids.map((id) => rewards.find((reward) => reward.id === id));
  }

  async remove(id: RewardId): Promise<boolean> {
    return (await this.db.removeAsync({ id }, { multi: true })) > 0;
  }
}

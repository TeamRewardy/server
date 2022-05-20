import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { PaginationArgs } from 'src/common/dto/pagination.args';
import { SearchArgs } from 'src/common/dto/search.args';
import { SortArgs } from 'src/common/dto/sort.args';
import { paginated } from 'src/common/utils/pagination.util';
import { PUB_SUB_KEY } from 'src/pub-sub.module';
import { User } from 'src/users/models/user.model';
import { UsersDataLoader, USERS_LOADER_KEY } from 'src/users/users.loader';
import { NewRewardInput } from './dto/new-reward.input';
import { RewardsFilterArgs } from './dto/rewards-filter.args';
import { PaginatedReward, Reward, RewardId } from './models/reward.model';
import { RewardsDataLoader, REWARDS_LOADER_KEY } from './rewards.loader';
import { RewardsService } from './rewards.service';

const REWARD_ADDED = 'rewardAdded';
const REWARD_REMOVED = 'rewardRemoved';

@Resolver(() => Reward)
export class RewardsResolver {
  private readonly logger = new Logger(RewardsResolver.name);

  constructor(
    private readonly rewardsService: RewardsService,
    @Inject(PUB_SUB_KEY) private readonly pubSub: PubSub,
  ) {}

  @Query((returns) => Reward)
  async reward(
    @Args('id', { type: () => ID }) id: RewardId,
    @Context(REWARDS_LOADER_KEY) rewardsLoader: RewardsDataLoader,
  ): Promise<Reward> {
    const reward = await rewardsLoader.load(id);
    if (!reward) {
      this.logger.warn(`${Reward.name} ${id} not found`);
      throw new NotFoundException(`${Reward.name} ${id}`);
    }
    return reward;
  }

  @Query((returns) => PaginatedReward)
  async rewards(
    @Args() rewardsFilterArgs: RewardsFilterArgs,
    @Args() searchArgs: SearchArgs,
    @Args() sortArgs: SortArgs,
    @Args() paginationArgs: PaginationArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedReward> {
    return paginated(PaginatedReward, {
      nodesResolver: () =>
        this.rewardsService.findAll({
          ...rewardsFilterArgs,
          ...searchArgs,
          ...sortArgs,
          ...paginationArgs,
        }),
      countResolver: () =>
        this.rewardsService.count({
          ...rewardsFilterArgs,
          ...searchArgs,
        }),
      paginationArgs,
      info,
    });
  }

  @Mutation((returns) => Reward)
  async addReward(
    @Args('newRewardData') newRewardData: NewRewardInput,
  ): Promise<Reward> {
    const reward = await this.rewardsService.create(newRewardData);
    this.pubSub.publish(REWARD_ADDED, { rewardAdded: reward });
    return reward;
  }

  @Mutation((returns) => Boolean)
  async removeReward(
    @Args('id', { type: () => ID }) id: RewardId,
  ): Promise<boolean> {
    const successful = await this.rewardsService.remove(id);
    if (successful) {
      this.pubSub.publish(REWARD_REMOVED, { rewardRemoved: id });
    }
    return successful;
  }

  @Subscription((returns) => Reward)
  rewardAdded(): AsyncIterator<unknown, any, undefined> {
    return this.pubSub.asyncIterator(REWARD_ADDED);
  }

  @Subscription((returns) => ID)
  rewardRemoved(): AsyncIterator<unknown, any, undefined> {
    return this.pubSub.asyncIterator(REWARD_REMOVED);
  }

  @ResolveField((returns) => User)
  async giver(
    @Parent() reward: Reward,
    @Context(USERS_LOADER_KEY) usersLoader: UsersDataLoader,
  ): Promise<User> {
    const giver = await usersLoader.load(reward.giverId);
    if (!giver) {
      this.logger.warn(`${User.name} ${reward.giverId} not found`);
      throw new NotFoundException(`${User.name} ${reward.giverId}`);
    }
    return giver;
  }

  @ResolveField((returns) => User)
  async receiver(
    @Parent() reward: Reward,
    @Context(USERS_LOADER_KEY) usersLoader: UsersDataLoader,
  ): Promise<User> {
    const receiver = await usersLoader.load(reward.receiverId);
    if (!receiver) {
      this.logger.warn(`${User.name} ${reward.receiverId} not found`);
      throw new NotFoundException(`${User.name} ${reward.receiverId}`);
    }
    return receiver;
  }
}

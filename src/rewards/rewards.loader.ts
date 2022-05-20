import DataLoader from 'dataloader';
import type { Reward, RewardId } from './models/reward.model';
import type { RewardsService } from './rewards.service';

export type RewardsDataLoader = DataLoader<RewardId, Reward | undefined>;

export const REWARDS_LOADER_KEY = 'rewardsLoader';

export function createRewardsLoader(
  rewardsService: RewardsService,
): RewardsDataLoader {
  return new DataLoader(async (ids) => await rewardsService.findAllByIds(ids));
}

import { Module } from '@nestjs/common';
import NeDB from '@seald-io/nedb';
import type { Reward } from './models/reward.model';
import { RewardsResolver } from './rewards.resolver';
import { RewardsService } from './rewards.service';

@Module({
  providers: [
    RewardsResolver,
    RewardsService,
    {
      provide: 'REWARDS_DB',
      useValue: new NeDB<Reward>({
        filename: 'db/rewards.json',
        autoload: true,
      }),
    },
  ],
  exports: [RewardsService],
})
export class RewardsModule {}

import { Module } from '@nestjs/common';
import { RewardsResolver } from './rewards.resolver';
import { RewardsService } from './rewards.service';

@Module({
  providers: [RewardsResolver, RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}

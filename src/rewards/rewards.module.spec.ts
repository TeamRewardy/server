import { Test } from '@nestjs/testing';
import { PubSubModule } from 'src/pub-sub.module';
import { RewardsModule } from './rewards.module';
import { RewardsResolver } from './rewards.resolver';
import { RewardsService } from './rewards.service';

describe('RewardsModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [PubSubModule, RewardsModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(RewardsResolver)).toBeInstanceOf(RewardsResolver);
    expect(module.get(RewardsService)).toBeInstanceOf(RewardsService);
  });
});

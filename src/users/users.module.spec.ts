import { Test } from '@nestjs/testing';
import { PubSubModule } from 'src/pub-sub.module';
import { UsersModule } from './users.module';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [PubSubModule, UsersModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(UsersResolver)).toBeInstanceOf(UsersResolver);
    expect(module.get(UsersService)).toBeInstanceOf(UsersService);
  });
});

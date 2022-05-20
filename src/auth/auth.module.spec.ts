import { Test } from '@nestjs/testing';
import { PubSubModule } from 'src/pub-sub.module';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthModule', () => {
  it.skip('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [PubSubModule, AuthModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(AuthService)).toBeInstanceOf(AuthService);
  });
});

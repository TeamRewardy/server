import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();

    for (const subModule of [AuthModule, GraphQLModule, UsersModule]) {
      expect(module.get(subModule)).toBeInstanceOf(subModule);
    }
  });
});

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { createRandomUser } from 'src/mocks/users';
import type { User } from 'src/users/models/user.model';
import { createUsersLoader } from 'src/users/users.loader';
import { UsersService } from 'src/users/users.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  let mockAuthService: Partial<AuthService> = {};
  let mockUsersService: Partial<UsersService> = {};

  beforeEach(async () => {
    mockAuthService = {};
    mockUsersService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthResolver, AuthService, UsersService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should find me', async () => {
    const me = createRandomUser();

    mockUsersService.findAllByIds = jest
      .fn()
      .mockImplementation(async (ids) => {
        expect(ids).toEqual([me.id]);
        return [me];
      });

    const actual = await resolver.me(
      { id: me.id } as User,
      createUsersLoader(mockUsersService as UsersService),
    );

    expect(actual).toEqual(me);
  });
});

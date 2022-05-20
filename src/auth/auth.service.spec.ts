import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Profile } from 'passport-github2';
import { createRandomUser } from 'src/mocks/users';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService> = {};

  beforeEach(async () => {
    mockUsersService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate', async () => {
    const user = createRandomUser();
    user.token = 'new-token';

    mockUsersService.findOneByUsername = jest
      .fn()
      .mockImplementation(async (username) => {
        expect(username).toEqual(user.username);
        return user;
      });

    mockUsersService.update = jest.fn().mockImplementation(async (id, data) => {
      expect(id).toEqual(user.id);
      user.lastModifiedAt = new Date();
      return user;
    });

    const actual = await service.validate('new-token', {
      username: user.username,
    } as Profile);

    expect(actual).toEqual(user);
  });
});

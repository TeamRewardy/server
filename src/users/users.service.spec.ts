import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { createRandomUser, USERS } from 'src/mocks/users';
import { castUserId, User } from './models/user.model';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const username = 'User Test 01';
    const token = 'new-token';

    const actual = await service.create({
      username,
      token,
    });

    expect(actual).toBeTruthy();
    expect(actual).toBeInstanceOf(User);
    expect(actual).toEqual({
      id: expect.stringMatching(UUID_V4_REGEX),
      createdAt: expect.any(Date),
      lastModifiedAt: expect.any(Date),
      username,
      token,
    });
  });

  it('should find user by username', async () => {
    const mockedUser = createRandomUser();

    USERS.push(mockedUser);

    const user = await service.findOneByUsername(mockedUser.username);

    expect(user).toEqual(mockedUser);
  });

  it('should find users', async () => {
    const totalCount = USERS.length;

    // const mockedUsers = Array.from({ length: totalCount }, () =>
    //   createRandomUser(),
    // );

    const users = await service.findAll({ offset: 0, limit: 10 });
    expect(users).toHaveLength(totalCount);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(UUID_V4_REGEX),
          username: expect.any(String),
        }),
      ]),
    );
  });

  it('should count users', async () => {
    const count = await service.count({});
    expect(count).toEqual(USERS.length);
  });

  it('should update an existing user', async () => {
    const id = castUserId(faker.datatype.uuid());
    const user = new User({
      id,
      username: 'User to update',
    });

    USERS.push(user);

    const token = 'new-token';

    const actual = await service.update(id, { token });

    expect(actual).toBeTruthy();
    expect(actual).toBeInstanceOf(User);
    expect(actual).toEqual({
      id,
      createdAt: user.createdAt,
      lastModifiedAt: user.lastModifiedAt,
      username: user.username,
      token,
    });
  });
});

import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import NeDB from '@seald-io/nedb';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { createRandomUser } from 'src/mocks/users';
import { castUserId, User } from './models/user.model';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let mockDb: NeDB<User>;

  beforeEach(async () => {
    mockDb = new NeDB<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: 'USERS_DB', useValue: mockDb }],
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

    await mockDb.insertAsync(mockedUser);

    const user = await service.findOneByUsername(mockedUser.username);

    expect(user).toEqual(mockedUser);
  });

  it('should find users', async () => {
    const totalCount = 5;

    await mockDb.insertAsync(
      Array.from({ length: totalCount }, () => createRandomUser()),
    );

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
    const totalCount = 5;
    await mockDb.insertAsync(
      Array.from({ length: totalCount }, () => createRandomUser()),
    );

    const count = await service.count({});
    expect(count).toEqual(totalCount);
  });

  it('should update an existing user', async () => {
    const id = castUserId(faker.datatype.uuid());
    const user = new User({
      id,
      username: 'User to update',
    });

    await mockDb.insertAsync(user);

    const token = 'new-token';

    const actual = await service.update(id, { token });

    expect(actual).toBeTruthy();
    expect(actual).toBeInstanceOf(User);
    expect(actual).toEqual({
      id,
      createdAt: user.createdAt,
      lastModifiedAt: expect.any(Date),
      username: user.username,
      token,
    });
  });
});

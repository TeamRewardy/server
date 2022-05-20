import { faker } from '@faker-js/faker';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { GraphQLResolveInfo } from 'graphql';
import { PageInfo } from 'src/common/models/paginated.model';
import { UUID_V4_REGEX } from 'src/common/utils/uuid.util';
import { createRandomUser } from 'src/mocks/users';
import { PubSubModule } from 'src/pub-sub.module';
import { castUserId, PaginatedUser, User } from './models/user.model';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  let mockUsersService: Partial<UsersService> = {};

  beforeEach(async () => {
    mockUsersService = {};

    const module: TestingModule = await Test.createTestingModule({
      imports: [PubSubModule],
      providers: [UsersResolver, UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a user', async () => {
    mockUsersService.create = jest.fn().mockImplementation((dto) => {
      const result = {
        ...dto,
        id: faker.datatype.uuid(),
      };
      delete result.token;
      return Promise.resolve(result);
    });

    const actual = await resolver.addUser({
      username: 'User 01',
      token: 'new-token',
    });

    expect(actual).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(UUID_V4_REGEX),
        username: 'User 01',
      }),
    );
    expect(
      // @ts-expect-error: There should be no password
      actual.password,
    ).toBeUndefined();

    expect(mockUsersService.create).toHaveBeenCalled();
  });

  it('should find paginated users', async () => {
    const users: User[] = [];

    for (let index = 0; index < 3; index++) {
      users.push(createRandomUser());
    }

    mockUsersService.findAll = jest
      .fn()
      .mockImplementation(() => Promise.resolve(users.slice(0, 10)));
    mockUsersService.count = jest
      .fn()
      .mockImplementation(() => Promise.resolve(users.length));

    const response = await resolver.users(
      {},
      {},
      {},
      { offset: 0, limit: 10 },
      {
        fieldNodes: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'nodes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pageInfo' } },
              ],
            },
          },
        ],
      } as unknown as GraphQLResolveInfo,
    );

    const pageInfo = new PageInfo();
    pageInfo.hasNextPage = false;
    pageInfo.totalCount = 3;

    const expected = new PaginatedUser();
    expected.nodes = users.slice(0, 10);
    expected.pageInfo = pageInfo;

    expect(response).toStrictEqual(expected);
  });

  it('should update a user', async () => {
    const id = castUserId(faker.datatype.uuid());

    const user = new User({
      id,
      username: 'User',
    });

    mockUsersService.update = jest.fn().mockImplementationOnce((id, args) => {
      user.username = args.username;
      return user;
    });

    const token = 'new-token';
    const actual = await resolver.updateUser(id, { token });

    expect(actual).toEqual(
      expect.objectContaining({
        id,
        createdAt: user.createdAt,
      }),
    );
  });
});

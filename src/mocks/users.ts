import { faker } from '@faker-js/faker';
import type { UserId } from 'src/users/models/user.model';
import { User } from 'src/users/models/user.model';
import { createRandomNode } from './node';

export const USERS: User[] = [];

export function createRandomUser(): User {
  return new User({
    ...createRandomNode<UserId>(),

    username: faker.internet.userName(),
  });
}

USERS.push(
  {
    ...createRandomUser(),
    username: 'Shinigami92',
  },
  {
    ...createRandomUser(),
    username: 'ST-DDT',
  },
);

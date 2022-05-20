import { faker } from '@faker-js/faker';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { PaginationArgs } from 'src/common/dto/pagination.args';
import type { SearchArgs } from 'src/common/dto/search.args';
import type { SortArgs } from 'src/common/dto/sort.args';
import { updateFieldOptional } from 'src/common/utils/update.util';
import { USERS } from 'src/mocks/users';
import type { NewUserInput } from './dto/new-user.input';
import type { UpdateUserInput } from './dto/update-user.input';
import type { UsersFilterArgs } from './dto/users-filter.args';
import type { UserId } from './models/user.model';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(data: NewUserInput): Promise<User> {
    const user = new User({
      ...data,
      id: faker.datatype.uuid() as unknown as UserId,
    });
    USERS.push(user);
    return user;
  }

  async findOneById(id: UserId): Promise<User | undefined> {
    return USERS.find((user) => user.id === id);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return USERS.find((user) => user.username === username);
  }

  async findAll(
    usersArgs: UsersFilterArgs & SearchArgs & SortArgs & PaginationArgs,
  ): Promise<User[]> {
    return USERS;
  }

  async count(usersArgs: UsersFilterArgs & SearchArgs): Promise<number> {
    return USERS.length;
  }

  async findAllByIds(
    ids: readonly UserId[],
  ): Promise<Array<User | Error | undefined>> {
    return ids.map((id) => USERS.find((user) => user.id === id));
  }

  async update(id: UserId, data: UpdateUserInput): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.lastModifiedAt = new Date();

    updateFieldOptional(user, data, 'token');

    return user;
  }
}

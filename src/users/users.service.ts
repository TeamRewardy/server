import { faker } from '@faker-js/faker';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import NeDB from '@seald-io/nedb';
import type { PaginationArgs } from 'src/common/dto/pagination.args';
import type { SearchArgs } from 'src/common/dto/search.args';
import type { SortArgs } from 'src/common/dto/sort.args';
import { updateFieldOptional } from 'src/common/utils/update.util';
import type { NewUserInput } from './dto/new-user.input';
import type { UpdateUserInput } from './dto/update-user.input';
import type { UsersFilterArgs } from './dto/users-filter.args';
import type { UserId } from './models/user.model';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject('USERS_DB') private readonly db: NeDB<User>) {}

  async create(data: NewUserInput): Promise<User> {
    const user = new User({
      ...data,
      id: faker.datatype.uuid() as unknown as UserId,
    });
    await this.db.insertAsync(user);
    return user;
  }

  async findOneById(id: UserId): Promise<User | undefined> {
    return this.db
      .findOneAsync({ id })
      .then((user) => (user ? new User(user) : undefined));
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.db
      .findOneAsync({ username })
      .then((user) => (user ? new User(user) : undefined));
  }

  async findAll(
    usersArgs: UsersFilterArgs & SearchArgs & SortArgs & PaginationArgs,
  ): Promise<User[]> {
    let cursor = this.db.findAsync({});
    if (usersArgs.sortBy) {
      cursor = cursor.sort({ [usersArgs.sortBy]: usersArgs.sortDesc ? -1 : 1 });
    }
    return await cursor
      .skip(usersArgs.offset)
      .limit(usersArgs.limit)
      .then((users) => users.map((user) => new User(user)));
  }

  async count(usersArgs: UsersFilterArgs & SearchArgs): Promise<number> {
    return await this.db.countAsync({});
  }

  async findAllByIds(
    ids: readonly UserId[],
  ): Promise<Array<User | Error | undefined>> {
    const users = await this.db
      .findAsync({ id: { $in: ids } })
      .then((users) => users.map((user) => new User(user)));
    return ids.map((id) => users.find((user) => user.id === id));
  }

  async update(id: UserId, data: UpdateUserInput): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.lastModifiedAt = new Date();

    updateFieldOptional(user, data, 'token');

    return await this.db
      .updateAsync(
        { id },
        {
          $set: {
            lastModifiedAt: user.lastModifiedAt,
            token: user.token,
          },
        },
        {
          multi: false,
          returnUpdatedDocs: true,
        },
      )
      .then(({ affectedDocuments }) => new User(affectedDocuments as User));
  }
}

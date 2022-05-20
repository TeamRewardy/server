import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  Args,
  Context,
  Info,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { PaginationArgs } from 'src/common/dto/pagination.args';
import { SearchArgs } from 'src/common/dto/search.args';
import { SortArgs } from 'src/common/dto/sort.args';
import { paginated } from 'src/common/utils/pagination.util';
import { PUB_SUB_KEY } from 'src/pub-sub.module';
import { NewUserInput } from './dto/new-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersFilterArgs } from './dto/users-filter.args';
import { PaginatedUser, User, UserId } from './models/user.model';
import { UsersDataLoader, USERS_LOADER_KEY } from './users.loader';
import { UsersService } from './users.service';

const USER_ADDED = 'userAdded';
const USER_UPDATED = 'userUpdated';

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject(PUB_SUB_KEY) private readonly pubSub: PubSub,
  ) {}

  @Query((returns) => User)
  async user(
    @Args('id', { type: () => String }) id: UserId,
    @Context(USERS_LOADER_KEY) usersLoader: UsersDataLoader,
  ): Promise<User> {
    const user = await usersLoader.load(id);
    if (!user) {
      this.logger.warn(`${User.name} ${id} not found`);
      throw new NotFoundException(`${User.name} ${id}`);
    }
    return user;
  }

  @Query((returns) => PaginatedUser)
  async users(
    @Args() usersFilterArgs: UsersFilterArgs,
    @Args() searchArgs: SearchArgs,
    @Args() sortArgs: SortArgs,
    @Args() paginationArgs: PaginationArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<PaginatedUser> {
    return paginated(PaginatedUser, {
      nodesResolver: () =>
        this.usersService.findAll({
          ...usersFilterArgs,
          ...searchArgs,
          ...sortArgs,
          ...paginationArgs,
        }),
      countResolver: () =>
        this.usersService.count({
          ...usersFilterArgs,
          ...searchArgs,
        }),
      paginationArgs,
      info,
    });
  }

  @Mutation((returns) => User)
  async addUser(@Args('newUserData') newUserData: NewUserInput): Promise<User> {
    const user = await this.usersService.create(newUserData);
    this.pubSub.publish(USER_ADDED, { userAdded: user });
    return user;
  }

  @Mutation((returns) => User)
  async updateUser(
    @Args('id', { type: () => String }) id: UserId,
    @Args('updateUserData') updateUserData: UpdateUserInput,
  ): Promise<User> {
    const updatedUser = await this.usersService.update(id, updateUserData);
    this.pubSub.publish(USER_UPDATED, { userUpdated: updatedUser });
    return updatedUser;
  }

  @Subscription((returns) => User)
  userAdded(): AsyncIterator<unknown, any, undefined> {
    return this.pubSub.asyncIterator(USER_ADDED);
  }

  @Subscription((returns) => User)
  userUpdated(): AsyncIterator<unknown, any, undefined> {
    return this.pubSub.asyncIterator(USER_UPDATED);
  }
}

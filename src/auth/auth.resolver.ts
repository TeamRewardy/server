import { Logger, NotFoundException } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/models/user.model';
import { UsersDataLoader, USERS_LOADER_KEY } from 'src/users/users.loader';

@Resolver(() => User)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  @Query((returns) => User)
  async me(
    @CurrentUser() currentUser: User,
    @Context(USERS_LOADER_KEY) usersLoader: UsersDataLoader,
  ): Promise<User> {
    const user = await usersLoader.load(currentUser.id);
    if (!user) {
      this.logger.warn(`${User.name} ${currentUser.id} not found`);
      throw new NotFoundException(`${User.name} ${currentUser.id}`);
    }
    return user;
  }
}

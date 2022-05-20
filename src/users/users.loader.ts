import DataLoader from 'dataloader';
import type { User, UserId } from './models/user.model';
import type { UsersService } from './users.service';

export type UsersDataLoader = DataLoader<UserId, User | undefined>;

export const USERS_LOADER_KEY = 'usersLoader';

export function createUsersLoader(usersService: UsersService): UsersDataLoader {
  return new DataLoader(async (ids) => await usersService.findAllByIds(ids));
}

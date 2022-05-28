import { Module } from '@nestjs/common';
import NeDB from '@seald-io/nedb';
import type { User } from './models/user.model';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersResolver,
    UsersService,
    {
      provide: 'USERS_DB',
      useValue: new NeDB<User>({
        filename: 'db/users.json',
        autoload: true,
      }),
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

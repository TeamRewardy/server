import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { GitHubStrategy } from './github.strategy';
import { GqlAuthGuard } from './gql-auth.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({
      defaultStrategy: 'github',
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    GitHubStrategy,
    BearerStrategy,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

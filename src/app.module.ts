import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PubSubModule } from './pub-sub.module';
import {
  createRewardsLoader,
  REWARDS_LOADER_KEY,
} from './rewards/rewards.loader';
import { RewardsModule } from './rewards/rewards.module';
import { RewardsService } from './rewards/rewards.service';
import { createUsersLoader, USERS_LOADER_KEY } from './users/users.loader';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

export const TRANSACTION_ID_KEY = 'transactionId';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PubSubModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => RewardsModule),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UsersModule, RewardsModule],
      useFactory: (
        usersService: UsersService,
        rewardsService: RewardsService,
      ) => ({
        debug: true,
        introspection: true,
        playground: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: (context) => {
              const authorization = context.connectionParams?.Authorization;
              if (!authorization) {
                throw new Error("Missing 'Authorization' header!");
              }
              (context as any).req = { headers: { authorization } };
            },
          },
          'subscriptions-transport-ws': {
            onConnect: (connectionParams: any) => {
              const authorization = connectionParams?.Authorization;
              if (authorization) {
                return { req: { headers: { authorization } } };
              }
              throw new Error("Missing 'Authorization' header!");
            },
          },
        },
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context: () => ({
          [TRANSACTION_ID_KEY]: randomUUID(),
          [USERS_LOADER_KEY]: createUsersLoader(usersService),
          [REWARDS_LOADER_KEY]: createRewardsLoader(rewardsService),
        }),
      }),
      inject: [UsersService, RewardsService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

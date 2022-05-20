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
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UsersModule],
      useFactory: (usersService: UsersService) => ({
        debug: true,
        introspection: true,
        playground: true,
        subscriptions: {
          'graphql-ws': {},
          'subscriptions-transport-ws': {},
        },
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context: () => ({
          [TRANSACTION_ID_KEY]: randomUUID(),
          [USERS_LOADER_KEY]: createUsersLoader(usersService),
        }),
      }),
      inject: [UsersService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

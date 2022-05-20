import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB_KEY = 'PUB_SUB';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB_KEY,
      useClass: PubSub,
    },
  ],
  exports: [PUB_SUB_KEY],
})
export class PubSubModule {}

import { InputType } from '@nestjs/graphql';

@InputType({
  isAbstract: true,
})
export abstract class NewNodeInput {}

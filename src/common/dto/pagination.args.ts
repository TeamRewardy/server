import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field((type) => Int, {
    description: 'Offset the results returned.',
    nullable: true,
    defaultValue: 0,
  })
  @Min(0)
  offset = 0;

  @Field((type) => Int, {
    description: 'Limit the number of results returned.',
    nullable: true,
    defaultValue: 25,
  })
  @Min(1)
  @Max(50)
  limit = 25;
}

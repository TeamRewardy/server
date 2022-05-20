import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SearchArgs {
  @Field({
    description: 'A search query string.',
    nullable: true,
  })
  search?: string;
}

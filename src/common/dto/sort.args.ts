import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SortArgs {
  @Field({
    description: 'Sort the results by the specified field.',
    nullable: true,
  })
  sortBy?: string;

  @Field({
    description:
      'Sort the results in true = descending, or false = ascending order.',
    defaultValue: false,
    nullable: true,
  })
  sortDesc?: boolean = false;
}

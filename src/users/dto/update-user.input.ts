import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { UpdateNodeInput } from 'src/common/dto/update-node.input';

@InputType()
export class UpdateUserInput extends UpdateNodeInput {
  @Field()
  @IsOptional()
  token?: string;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { NewNodeInput } from 'src/common/dto/new-node.input';

@InputType()
export class NewUserInput extends NewNodeInput {
  @Field()
  @IsNotEmpty()
  username!: string;

  @Field()
  @IsNotEmpty()
  token!: string;
}

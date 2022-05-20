import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { NewNodeInput } from 'src/common/dto/new-node.input';
import { UserId } from 'src/users/models/user.model';

@InputType()
export class NewRewardInput extends NewNodeInput {
  @Field((type) => ID)
  @IsNotEmpty()
  @IsUUID()
  giverId!: UserId;

  @Field((type) => ID)
  @IsNotEmpty()
  @IsUUID()
  receiverId!: UserId;

  @Field({ nullable: true })
  @IsOptional()
  date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  anonymous?: boolean = false;
}

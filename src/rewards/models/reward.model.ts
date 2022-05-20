import { Field, ID, ObjectType } from '@nestjs/graphql';
import type {
  NodeConstructorParams,
  NodeId,
} from 'src/common/models/node.model';
import { Node } from 'src/common/models/node.model';
import { Paginated } from 'src/common/models/paginated.model';
import { UserId } from 'src/users/models/user.model';

export interface RewardId extends NodeId {
  _rewardIdBrand: string;
}

export function castRewardId(id: string): RewardId {
  return id as unknown as RewardId;
}

export interface RewardConstructorParams
  extends NodeConstructorParams<RewardId> {
  giverId: UserId;
  receiverId: UserId;
  date?: Date;
  reason?: string;
  anonymous?: boolean;
}

@ObjectType({
  description: 'Reward.',
  implements: () => Node,
})
export class Reward extends Node<RewardId> {
  @Field((type) => ID)
  giverId: UserId;

  @Field((type) => ID)
  receiverId: UserId;

  @Field()
  date: Date;

  @Field({
    nullable: true,
  })
  reason?: string;

  @Field()
  anonymous: boolean;

  constructor({
    id,
    giverId,
    receiverId,
    date,
    reason,
    anonymous,
  }: RewardConstructorParams) {
    super({ id });
    this.giverId = giverId;
    this.receiverId = receiverId;
    if (typeof date === 'string') {
      date = new Date(date);
    }
    this.date = date ?? new Date();
    this.reason = reason;
    this.anonymous = anonymous ?? false;
  }
}

@ObjectType()
export class PaginatedReward extends Paginated(Reward) {}

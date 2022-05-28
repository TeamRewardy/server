import { Field, ObjectType } from '@nestjs/graphql';
import type {
  NodeConstructorParams,
  NodeId,
} from 'src/common/models/node.model';
import { Node } from 'src/common/models/node.model';
import { Paginated } from 'src/common/models/paginated.model';

export interface UserId extends NodeId {
  _userIdBrand: string;
}

export function castUserId(id: string): UserId {
  return id as unknown as UserId;
}

export interface UserConstructorParams extends NodeConstructorParams<UserId> {
  username: string;
  token?: string | null;
}

@ObjectType({
  description: 'User.',
  implements: () => Node,
})
export class User extends Node<UserId> {
  @Field()
  username: string;

  token?: string | null;

  constructor({
    id,
    createdAt,
    lastModifiedAt,
    username,
    token,
  }: UserConstructorParams) {
    super({ id, createdAt, lastModifiedAt });
    this.username = username;
    this.token = token;
  }
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}

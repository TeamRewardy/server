import type { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { Node, NodeId } from './node.model';

@ObjectType({ description: 'PageInfo ' })
export class PageInfo {
  @Field((type) => Int)
  totalCount!: number;

  @Field()
  hasNextPage!: boolean;
}

export interface IPaginatedType<NodeClass extends Node<NodeId>> {
  nodes: NodeClass[];
  pageInfo: PageInfo;
}

export function Paginated<NodeClass extends Node<NodeId>>(
  nodeClassRef: Type<NodeClass>,
): Type<IPaginatedType<NodeClass>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<NodeClass> {
    @Field((type) => [nodeClassRef])
    readonly nodes!: NodeClass[];

    @Field((type) => PageInfo)
    readonly pageInfo: PageInfo = new PageInfo();
  }

  return PaginatedType as Type<IPaginatedType<NodeClass>>;
}

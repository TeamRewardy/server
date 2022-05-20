import type { GraphQLResolveInfo } from 'graphql';
import type { PaginationArgs } from '../dto/pagination.args';
import type { Node, NodeId } from '../models/node.model';
import type { IPaginatedType } from '../models/paginated.model';
import { PageInfo } from '../models/paginated.model';
import { isFieldNode } from './selection-node.util';

export async function paginated<
  NodeClass extends Node<NodeId>,
  PaginatedClass extends IPaginatedType<NodeClass>,
>(
  PaginatedClass: new () => PaginatedClass,
  {
    nodesResolver,
    countResolver,
    paginationArgs: { offset, limit },
    info,
  }: {
    nodesResolver: () => Promise<NodeClass[]>;
    countResolver: () => Promise<number>;
    paginationArgs: PaginationArgs;
    info: GraphQLResolveInfo;
  },
): Promise<PaginatedClass> {
  const selectedValues = info.fieldNodes[0].selectionSet?.selections
    .filter(isFieldNode)
    .map((s) => s.name.value);

  const paginatedNode = new PaginatedClass();

  if (!selectedValues) {
    return paginatedNode;
  }

  let resolvedNodes: NodeClass[] = [];
  if (selectedValues.includes('nodes')) {
    resolvedNodes = await nodesResolver();

    paginatedNode.nodes = resolvedNodes;
  }

  if (selectedValues.includes('pageInfo')) {
    paginatedNode.pageInfo = new PageInfo();

    const resolvedTotalCount = await countResolver();

    paginatedNode.pageInfo.totalCount = resolvedTotalCount;
    paginatedNode.pageInfo.hasNextPage = offset + limit < resolvedTotalCount;
  }

  return paginatedNode;
}

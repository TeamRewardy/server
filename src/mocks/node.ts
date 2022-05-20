import { faker } from '@faker-js/faker';
import type { Node, NodeId } from 'src/common/models/node.model';

export function createRandomNode<Id extends NodeId>(): Node<Id> {
  const createdAt = faker.date.past();
  return {
    id: faker.datatype.uuid() as unknown as Id,
    createdAt,
    lastModifiedAt: createdAt,
  };
}

import { Field, ID, InterfaceType } from '@nestjs/graphql';

export interface NodeId extends String {
  _nodeIdBrand: string;
}

export interface NodeConstructorParams<Id extends NodeId> {
  id: Id;
  createdAt?: Date;
}

@InterfaceType({
  description: 'Node.',
  isAbstract: true,
})
export abstract class Node<Id extends NodeId> {
  @Field((type) => ID, {
    description: 'The ID of the node.',
  })
  id: Id;

  @Field({ description: 'The creation date of the node.' })
  createdAt: Date;

  @Field({ description: 'The last modified date of the node.' })
  lastModifiedAt: Date;

  constructor({ id, createdAt }: NodeConstructorParams<Id>) {
    this.id = id;

    if (typeof createdAt === 'string') {
      createdAt = new Date(createdAt);
    }
    this.createdAt = createdAt ?? new Date();
    this.lastModifiedAt = this.createdAt;
  }
}

import type { ConditionalKeys, Primitive } from 'type-fest';
import type { UpdateNodeInput } from '../dto/update-node.input';
import type { Node, NodeId } from '../models/node.model';

export function updateFieldRequired<
  NodeClass extends Node<NodeId>,
  UpdateInput extends UpdateNodeInput,
>(
  node: NodeClass,
  data: UpdateInput,
  field: Extract<
    ConditionalKeys<NodeClass, Exclude<Primitive, null>>,
    keyof UpdateInput
  >,
): void {
  if (data[field] !== undefined) {
    // @ts-expect-error: Update required field
    node[field] = data[field] || node[field];
  }
}

export function updateFieldOptional<
  NodeClass extends Node<NodeId>,
  UpdateInput extends UpdateNodeInput,
>(
  node: NodeClass,
  data: UpdateInput,
  field: Extract<
    Exclude<
      keyof NodeClass,
      ConditionalKeys<NodeClass, Exclude<Primitive, null>>
    >,
    keyof UpdateInput
  >,
): void {
  if (data[field] !== undefined) {
    // @ts-expect-error: Update optional field
    node[field] = data[field] || undefined;
  }
}

import type { FieldNode } from 'graphql';

export function isFieldNode(value: any): value is FieldNode {
  return !(!value || typeof value !== 'object' || value.kind !== 'Field');
}

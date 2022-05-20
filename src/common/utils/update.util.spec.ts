import type { UpdateNodeInput } from '../dto/update-node.input';
import type { Node, NodeId } from '../models/node.model';
import { updateFieldOptional, updateFieldRequired } from './update.util';

describe('update.util', () => {
  describe('updateFieldRequired', () => {
    it('should update required field', () => {
      const node: Node<NodeId> & {
        required: string;
        optional?: string | null;
      } = {
        id: '' as unknown as NodeId,
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        required: 'required',
        optional: 'optional',
      };

      const data: UpdateNodeInput & {
        required?: string | null;
      } = {
        required: 'required updated',
      };

      updateFieldRequired(node, data, 'required');

      expect(node.required).toBe('required updated');
    });

    it('should set required back to initial value', () => {
      const node: Node<NodeId> & {
        required: string;
        optional?: string | null;
      } = {
        id: '' as unknown as NodeId,
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        required: 'required',
        optional: 'optional',
      };

      const data: UpdateNodeInput & {
        required?: string | null;
      } = {
        required: null,
      };

      updateFieldRequired(node, data, 'required');

      expect(node.required).toBe('required');
    });

    it('should skip updating required field', () => {
      const node: Node<NodeId> & {
        required: string;
        optional?: string | null;
      } = {
        id: '' as unknown as NodeId,
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        required: 'required',
        optional: 'optional',
      };

      const data: UpdateNodeInput & {
        required?: string | null;
      } = {};

      updateFieldRequired(node, data, 'required');

      expect(node.required).toBe('required');
    });
  });

  describe('updateFieldOptional', () => {
    it('should update optional field', () => {
      const node: Node<NodeId> & {
        required: string;
        optional?: string | null;
      } = {
        id: '' as unknown as NodeId,
        createdAt: new Date(),
        lastModifiedAt: new Date(),
        required: 'required',
        optional: 'optional',
      };

      const data: UpdateNodeInput & {
        optional?: string | null;
      } = {
        optional: 'optional updated',
      };

      updateFieldOptional(node, data, 'optional');

      expect(node.optional).toBe('optional updated');
    });
  });

  it('should unset optional field', () => {
    const node: Node<NodeId> & {
      required: string;
      optional?: string | null;
    } = {
      id: '' as unknown as NodeId,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      required: 'required',
      optional: 'optional',
    };

    const data: UpdateNodeInput & {
      optional?: string | null;
    } = {
      optional: null,
    };

    updateFieldOptional(node, data, 'optional');

    expect(node.optional).toBeUndefined();
  });

  it('should update optional field', () => {
    const node: Node<NodeId> & {
      required: string;
      optional?: string | null;
    } = {
      id: '' as unknown as NodeId,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      required: 'required',
      optional: 'optional',
    };

    const data: UpdateNodeInput & {
      optional?: string | null;
    } = {};

    updateFieldOptional(node, data, 'optional');

    expect(node.optional).toBe('optional');
  });
});

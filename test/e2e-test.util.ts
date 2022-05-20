import { faker } from '@faker-js/faker';
import { createRandomUser, USERS } from 'src/mocks/users';
import type { User } from 'src/users/models/user.model';

type JsonObject = { [member: string]: JsonValue };
type JsonArray = Array<JsonValue>;
type JsonValue = JsonObject | JsonArray | string | number | boolean | null;

export type SubscribeRequest = JsonValue & {
  readonly id: string;
  readonly type: 'subscribe';
  readonly payload: {
    extensions: Record<string, unknown>;
    operationName: string;
    query: string;
    variables: Record<string, unknown>;
  };
};

export function subscribeRequest({
  query,
}: {
  query: string;
}): SubscribeRequest {
  const matches = query.match(/subscription\s(\w+)\s/);
  const operationName = matches?.[1] ?? '';
  return {
    id: faker.datatype.uuid(),
    type: 'subscribe',
    payload: {
      extensions: {},
      operationName,
      query,
      variables: {},
    },
  };
}

export function createTestuser(): User {
  const test = createRandomUser();
  test.username = 'Test';
  test.token = 'test-token';
  return test;
}

export const TEST_USER = createTestuser();

USERS.push(TEST_USER);

export const AUTH_HEADER = {
  Authorization: `Bearer ${Buffer.from(
    `${TEST_USER.username}:${TEST_USER.token}`,
  ).toString('base64')}`,
};

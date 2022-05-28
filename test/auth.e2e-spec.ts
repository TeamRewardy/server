import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import NeDB from '@seald-io/nedb';
import { AppModule } from 'src/app.module';
import { createRandomUser } from 'src/mocks/users';
import type { User } from 'src/users/models/user.model';
import request from 'superwstest';

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;

  let mockUsersDb: NeDB<User>;

  beforeEach(async () => {
    mockUsersDb = new NeDB<User>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('USERS_DB')
      .useValue(mockUsersDb)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await app.listen(0, '0.0.0.0');
  });

  afterEach(async () => {
    await app.close();
  });

  it('me', async () => {
    const me = createRandomUser();
    me.token = 'new-token';

    await mockUsersDb.insertAsync(me);

    const test = request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${Buffer.from(me.username + ':' + me.token).toString(
          'base64',
        )}`,
      )
      .send({
        operationName: 'me',
        query: `#graphql
        query me {
          me {
            id
            createdAt
            username
          }
        }`,
        variables: {},
      })
      .expect(200)
      .expect(({ body }) => {
        const data = body.data;

        expect(data.me).toEqual({
          id: me.id,
          createdAt: me.createdAt.toISOString(),
          username: me.username,
        });
      });

    return test;
  });
});

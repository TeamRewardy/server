import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { User } from 'src/users/models/user.model';

const logger = new Logger('CurrentUser');

export const CurrentUser = createParamDecorator<unknown, ExecutionContext>(
  (data, context) => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const { id, username }: Partial<User> = req.user ?? {};
    logger.debug(JSON.stringify({ id, username }));
    return { id, username };
  },
);

import type { ExecutionContext } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

@Injectable()
export class GqlAuthGuard extends AuthGuard('bearer') {
  private readonly logger = new Logger(GqlAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Try catch is just to make sure that if there is an error, the app doesn't crash
    try {
      if (context.getType() === 'http') {
        const req = context.switchToHttp().getRequest();
        this.logger.debug(`canActivate ${req.method} ${req.url}`);
      } else {
        const ctx = GqlExecutionContext.create(context);
        const fieldName = ctx.getInfo().fieldName;
        this.logger.debug(`canActivate POST /graphql ${fieldName}`);
      }
    } catch {
      this.logger.debug('canActivate UNKNOWN');
    }

    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      if (req.method === 'GET' && req.url === '/') {
        return true;
      }
      if (
        req.method === 'GET' &&
        (req.url as string).startsWith('/auth/github')
      ) {
        // GitHubAuthGuard will handle it
        return true;
      }
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }
}

import type { ExecutionContext } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

@Injectable()
export class GitHubAuthGuard extends AuthGuard('github') {
  private readonly logger = new Logger(GitHubAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    this.logger.debug(`canActivate ${req.method} ${req.url}`);

    if (!(req.url as string).startsWith('/auth/github')) {
      return false;
    }

    return super.canActivate(context);
  }
}

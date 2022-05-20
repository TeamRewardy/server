import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import passport from 'passport';
import { GitHubAuthGuard } from './github-auth.guard';

@Controller('auth')
@UseGuards(new GitHubAuthGuard())
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Get('github')
  async github(): Promise<any> {
    return passport.authenticate('github', { scope: ['user:email'] });
  }

  @Get('github/callback')
  async githubCallback(@Req() req: Request): Promise<string> {
    passport.authenticate('github', {
      failureRedirect: '/login',
    });

    const user: any = req.user;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return Buffer.from(`${user.username}:${user.token}`).toString('base64');
  }
}

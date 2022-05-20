import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Profile } from 'passport-github2';
import { Strategy } from 'passport-github2';
import type { User } from 'src/users/models/user.model';
import { AuthService } from './auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GitHubStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://127.0.0.1:3020/auth/github/callback',
    });
  }

  async validate(token: string, _: unknown, profile: Profile): Promise<User> {
    return await this.authService.validate(token, profile);
  }
}

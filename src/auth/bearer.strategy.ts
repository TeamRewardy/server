import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import type { User } from 'src/users/models/user.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(BearerStrategy.name);

  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(token: string): Promise<User> {
    const [username, ghToken] = Buffer.from(token, 'base64')
      .toString()
      .replace('Bearer ', '')
      .split(':');

    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      this.logger.warn('Unauthorized validate requested from ' + username);
      throw new UnauthorizedException();
    }

    if (user.token !== ghToken) {
      this.logger.warn('Unauthorized validate requested from ' + username);
      throw new UnauthorizedException();
    }

    return user;
  }
}

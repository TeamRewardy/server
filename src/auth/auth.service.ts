import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Profile } from 'passport-github2';
import { UsersService } from 'src/users/users.service';
import type { User } from '../users/models/user.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usersService: UsersService) {}

  async validate(token: string, profile: Profile): Promise<User> {
    if (!token) {
      throw new BadRequestException('No token.');
    }

    if (!profile.username) {
      throw new BadRequestException('No username.');
    }

    let user = await this.usersService.findOneByUsername(profile.username);

    if (!user) {
      user = await this.usersService.create({
        username: profile.username,
        token,
      });
    } else {
      user = await this.usersService.update(user.id, {
        token,
      });
    }

    return user;
  }
}

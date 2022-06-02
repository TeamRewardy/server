import { PrefixCommandTransformPipe } from '@discord-nestjs/common';
import {
  InjectDiscordClient,
  Once,
  Payload,
  PrefixCommand,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { GiveDto } from './dto/give.dto';

@Injectable()
export class DiscordBotGateway {
  private readonly logger = new Logger(DiscordBotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady(): void {
    this.logger.log(`Bot ${this.client.user?.tag} was started!`);
  }

  @PrefixCommand('give')
  @UsePipes(PrefixCommandTransformPipe)
  async onMessage(@Payload() dto: GiveDto): Promise<string> {
    console.log(dto);
    return 'Message processed successfully';
  }
}

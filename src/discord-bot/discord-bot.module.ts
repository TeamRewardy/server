import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { DiscordBotGateway } from './discord-bot.gateway';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [DiscordBotGateway],
})
export class DiscordBotModule {}

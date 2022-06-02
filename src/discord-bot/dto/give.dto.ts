import { ArgNum, ArgRange } from '@discord-nestjs/core';

export class GiveDto {
  @ArgNum(() => ({ position: 0 }))
  receiver!: string;

  @ArgRange((last) => ({ formPosition: last + 1 }))
  reason!: string[];
}

import { Module } from '@nestjs/common';
import { BeatsService } from './beats.service';
import { BeatsController } from './beats.controller';

@Module({
  controllers: [BeatsController],
  providers: [BeatsService],
})
export class BeatsModule {}

import { Module } from '@nestjs/common';
import { BeatsController } from './beats.controller';
import { BeatsService } from './beats.service';

@Module({
    controllers: [BeatsController],
    providers: [BeatsService],
    imports: [],
    exports: [],
})
export class BeatsModule {}

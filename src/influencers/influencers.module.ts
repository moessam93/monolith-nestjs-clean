import { Module } from '@nestjs/common';
import { InfluencersService } from './influencers.service';
import { InfluencersController } from './influencers.controller';

@Module({
  controllers: [InfluencersController],
  providers: [InfluencersService],
})
export class InfluencersModule {}

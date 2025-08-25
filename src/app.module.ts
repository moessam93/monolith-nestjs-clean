import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NonIdempotentHandlerMiddleware } from './common/middleware/non-idempotent-handler.middleware';
import path from 'path';
import { BrandsModule } from './brands/brands.module';
import { InfluencersModule } from './influencers/influencers.module';
import { BeatsModule } from './beats/beats.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, BeatsModule, BrandsModule, InfluencersModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(NonIdempotentHandlerMiddleware)
    .forRoutes({path: '*', method: RequestMethod.ALL});
  }
}

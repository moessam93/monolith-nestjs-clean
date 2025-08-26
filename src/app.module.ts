import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NonIdempotentHandlerMiddleware } from './common/middleware/non-idempotent-handler.middleware';
import path from 'path';
import { BrandsModule } from './brands/brands.module';
import { InfluencersModule } from './influencers/influencers.module';
import { BeatsModule } from './beats/beats.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [PrismaModule, BeatsModule, BrandsModule, InfluencersModule, 
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ], 
      expandVariables: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'testing', 'staging', 'production').required(),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
      }),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})


export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NonIdempotentHandlerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NonIdempotentHandlerMiddleware } from './common/middleware/non-idempotent-handler.middleware';
import path from 'path';
import { BrandsModule } from './brands/brands.module';
import { InfluencersModule } from './influencers/influencers.module';
import { BeatsModule } from './beats/beats.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    PrismaModule, 
    BeatsModule, 
    BrandsModule, 
    InfluencersModule,
    AuthModule,
    UsersModule,
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
        // JWT Configuration
        JWT_ALG: Joi.string().default('RS256'),
        EXPIRY_DURATION: Joi.string().default('1h'),
        JWT_PRIVATE_KEY_BASE64: Joi.string().optional(),
        JWT_PUBLIC_KEY_BASE64: Joi.string().optional(),
        // Bcrypt Configuration
        BCRYPT_SALT_ROUNDS: Joi.number().default(12),
      }),
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})


export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NonIdempotentHandlerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

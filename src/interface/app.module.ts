import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

// No legacy dependencies - all migrated to clean architecture

// Clean Architecture modules
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

// New Clean Architecture controllers
import { AuthController } from './http/controllers/auth.controller';
import { UsersController } from './http/controllers/users.controller';
import { BeatsController } from './http/controllers/beats.controller';
import { BrandsController } from './http/controllers/brands.controller';
import { InfluencersController } from './http/controllers/influencers.controller';

// Guards and Strategy
import { JwtAuthGuard } from './http/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtStrategy } from './http/auth/jwt.strategy';

// Middleware
import { NonIdempotentHandlerMiddleware } from '../common/middleware/non-idempotent-handler.middleware';

// No legacy modules - all migrated to clean architecture

@Module({
  imports: [
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
        JWT_SECRET: Joi.string().optional(), // For development fallback
        // Bcrypt Configuration
        BCRYPT_SALT_ROUNDS: Joi.number().default(12),
      }),
    }),
    PassportModule,
    
    // Clean Architecture modules
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [
    // Clean Architecture controllers
    AuthController,
    UsersController,
    BeatsController,
    BrandsController,
    InfluencersController,
  ],
  providers: [
    JwtStrategy,
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

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TOKENS } from './common/tokens';

// Prisma
import { PrismaService } from './orm/prisma/prisma.service';
import { PrismaUnitOfWork } from './orm/prisma/uow/prisma.uow';

// Repositories
import { PrismaUsersRepo } from './orm/prisma/repositories/prisma-users.repo';
import { PrismaRolesRepo } from './orm/prisma/repositories/prisma-roles.repo';
import { PrismaBeatsRepo } from './orm/prisma/repositories/prisma-beats.repo';
import { PrismaBrandsRepo } from './orm/prisma/repositories/prisma-brands.repo';
import { PrismaInfluencersRepo } from './orm/prisma/repositories/prisma-influencers.repo';
import { PrismaSocialPlatformsRepo } from './orm/prisma/repositories/prisma-social-platforms.repo';

// Port implementations
import { BcryptHasher } from './crypto/bcrypt.hasher';
import { NestJwtSigner } from './tokens/jwt.signer';
import { SystemClock } from './common/system-clock';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const algorithm = configService.get<string>('JWT_ALG', 'RS256');
        const expiresIn = configService.get<string>('EXPIRY_DURATION', '1h');

        if (algorithm === 'RS256') {
          const privateKey = Buffer.from(
            configService.get<string>('JWT_PRIVATE_KEY_BASE64', ''),
            'base64'
          ).toString('utf-8');
          const publicKey = Buffer.from(
            configService.get<string>('JWT_PUBLIC_KEY_BASE64', ''),
            'base64'
          ).toString('utf-8');

          return {
            privateKey,
            publicKey,
            signOptions: { algorithm: 'RS256', expiresIn },
            verifyOptions: { algorithms: ['RS256'] },
          };
        }

        // Fallback to HS256 for development
        return {
          secret: configService.get<string>('JWT_SECRET', 'dev-secret'),
          signOptions: { algorithm: 'HS256', expiresIn },
          verifyOptions: { algorithms: ['HS256'] },
        };
      },
    }),
  ],
  providers: [
    // Prisma
    PrismaService,
    
    // Unit of Work
    {
      provide: TOKENS.UnitOfWork,
      useClass: PrismaUnitOfWork,
    },
    
    // Repositories
    {
      provide: TOKENS.UsersRepo,
      useClass: PrismaUsersRepo,
    },
    {
      provide: TOKENS.RolesRepo,
      useClass: PrismaRolesRepo,
    },
    {
      provide: TOKENS.BeatsRepo,
      useClass: PrismaBeatsRepo,
    },
    {
      provide: TOKENS.BrandsRepo,
      useClass: PrismaBrandsRepo,
    },
    {
      provide: TOKENS.InfluencersRepo,
      useClass: PrismaInfluencersRepo,
    },
    {
      provide: TOKENS.SocialPlatformsRepo,
      useClass: PrismaSocialPlatformsRepo,
    },
    
    // Port implementations
    {
      provide: TOKENS.PasswordHasher,
      useClass: BcryptHasher,
    },
    {
      provide: TOKENS.TokenSigner,
      useClass: NestJwtSigner,
    },
    {
      provide: TOKENS.Clock,
      useClass: SystemClock,
    },
  ],
  exports: [
    TOKENS.UnitOfWork,
    TOKENS.UsersRepo,
    TOKENS.RolesRepo,
    TOKENS.BeatsRepo,
    TOKENS.BrandsRepo,
    TOKENS.InfluencersRepo,
    TOKENS.SocialPlatformsRepo,
    TOKENS.PasswordHasher,
    TOKENS.TokenSigner,
    TOKENS.Clock,
  ],
})
export class InfrastructureModule {}

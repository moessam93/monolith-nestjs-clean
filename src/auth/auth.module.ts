import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { HashService } from '../common/services/hash.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import * as fs from 'fs';

type Algorithm = 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'HS256' | 'HS384' | 'HS512';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const algorithm = configService.get<string>('JWT_ALG', 'RS256');
        
        let privateKey: string;
        let publicKey: string;

        // Check if using base64 encoded keys
        const privateKeyBase64 = configService.get<string>('JWT_PRIVATE_KEY_BASE64');
        const publicKeyBase64 = configService.get<string>('JWT_PUBLIC_KEY_BASE64');

        if (privateKeyBase64 && publicKeyBase64) {
          // Check if the keys are already in PEM format (start with -----BEGIN)
          if (privateKeyBase64.startsWith('-----BEGIN')) {
            privateKey = privateKeyBase64;
            publicKey = publicKeyBase64;
          } else {
            // Keys are Base64 encoded, decode them
            privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');
            publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf8');
          }
        } else {
          // Fall back to file paths
          const privateKeyPath = configService.get<string>('JWT_PRIVATE_KEY_PATH');
          const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');

          if (!privateKeyPath || !publicKeyPath) {
            throw new Error(
              'JWT keys must be provided either as base64 encoded strings (JWT_PRIVATE_KEY_BASE64, JWT_PUBLIC_KEY_BASE64) ' +
              'or as file paths (JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH)'
            );
          }

          privateKey = fs.readFileSync(privateKeyPath, 'utf8');
          publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        }

        return {
          privateKey: privateKey,
          publicKey: publicKey,
          signOptions: {
            algorithm: algorithm as Algorithm,
            expiresIn: configService.get<string>('EXPIRY_DURATION', '1h'),
          },
          verifyOptions: {
            algorithms: [algorithm as Algorithm],
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, JwtStrategy],
  exports: [AuthService, HashService],
})
export class AuthModule {}

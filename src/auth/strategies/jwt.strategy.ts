import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import * as fs from 'fs';

type Algorithm = 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'HS256' | 'HS384' | 'HS512';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    let publicKey: string;

    // Check if using base64 encoded key
    const publicKeyBase64 = configService.get<string>('JWT_PUBLIC_KEY_BASE64');
    
    if (publicKeyBase64) {
      // Check if the key is already in PEM format (start with -----BEGIN)
      if (publicKeyBase64.startsWith('-----BEGIN')) {
        publicKey = publicKeyBase64;
      } else {
        // Key is Base64 encoded, decode it
        publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf8');
      }
    } else {
      // Fall back to file path
      const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');
      if (!publicKeyPath) {
        throw new Error(
          'JWT public key must be provided either as base64 encoded string (JWT_PUBLIC_KEY_BASE64) ' +
          'or as file path (JWT_PUBLIC_KEY_PATH)'
        );
      }
      publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: [configService.get<Algorithm>('JWT_ALG', 'RS256')],
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

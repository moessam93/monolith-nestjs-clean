import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const algorithm = configService.get<string>('JWT_ALG', 'RS256');
    
    if (algorithm === 'RS256') {
      const publicKey = Buffer.from(
        configService.get<string>('JWT_PUBLIC_KEY_BASE64', ''),
        'base64'
      ).toString('utf-8');

      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: publicKey,
        algorithms: ['RS256'],
      });
    } else {
      // Fallback to HS256 for development
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
        algorithms: ['HS256'],
      });
    }
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
    };
  }
}

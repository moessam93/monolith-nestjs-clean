import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Algorithm } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // Extract configuration before calling super()
    const algorithm = configService.get<string>('JWT_ALG', 'RS256');
    
    const strategyOptions = algorithm === 'RS256' 
      ? {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: Buffer.from(
            configService.get<string>('JWT_PUBLIC_KEY_BASE64', ''),
            'base64'
          ).toString('utf-8'),
          algorithms: ['RS256' as Algorithm],
        }
      : {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
          algorithms: ['HS256' as Algorithm],
        };

    // Call super() with the constructed options
    super(strategyOptions);
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

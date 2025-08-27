import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenSignerPort } from '../../application/ports/token-signer.port';

@Injectable()
export class NestJwtSigner implements TokenSignerPort {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: Record<string, any>, options?: { expiresIn?: string }): Promise<{ token: string; exp?: number }> {
    const token = await this.jwtService.signAsync(payload, options);
    const decoded = this.jwtService.decode(token) as any;
    
    return {
      token,
      exp: decoded?.exp,
    };
  }

  async verify(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }

  decode(token: string): any {
    return this.jwtService.decode(token);
  }
}

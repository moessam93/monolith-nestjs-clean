import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../common/services/hash.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private hashService: HashService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user with roles
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.hashService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract role keys
    const roles = user.userRoles.map(userRole => userRole.role.key);

    // Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
    };

    // Generate access token
    const access_token = this.jwtService.sign(payload);

    // Calculate expiration date
    const expiryDuration = this.configService.get<string>('EXPIRY_DURATION', '1h');
    const expiredAt = this.calculateExpirationDate(expiryDuration);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
      access_token,
      expiredAt,
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const roles = user.userRoles.map(userRole => userRole.role.key);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
    };
  }

  private calculateExpirationDate(duration: string): Date {
    const now = new Date();
    const durationRegex = /^(\d+)([smhd])$/;
    const match = duration.match(durationRegex);

    if (!match) {
      throw new Error(`Invalid expiry duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }
}

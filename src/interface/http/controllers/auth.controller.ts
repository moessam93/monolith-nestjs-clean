import { Body, Controller, Post, Inject, UnauthorizedException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Public } from '../../decorators/public.decorator';
import { TOKENS } from '../../../infrastructure/common/tokens';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { LoginInput, LoginOutput } from '../../../application/dto/auth.dto';
import { LoginDto } from '../validation/auth.dto';
import { ConfigService } from '@nestjs/config';
import { isOk } from '../../../application/common/result';
import { USER_NOT_FOUND } from '../../../domain/errors/user-errors';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(TOKENS.LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginOutput> {
    const input: LoginInput = {
      email: loginDto.email,
      password: loginDto.password,
      expiresIn: this.configService.get<string>('EXPIRY_DURATION', '1h'),
    };

    const result = await this.loginUseCase.execute(input);

    if (isOk(result)) {
      return result.value;
    }

    const error = result.error;

    if (error.code === USER_NOT_FOUND) {
      throw new NotFoundException({
        message: error.message,
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
      });
    }
    else {
      throw new UnauthorizedException({
        message: error.message,
        error: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

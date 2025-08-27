import { Body, Controller, Post, Inject } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { TOKENS } from '../../../infrastructure/common/tokens';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { LoginInput, LoginOutput } from '../../../application/dto/auth.dto';
import { LoginDto } from '../validation/auth.dto';
import { ConfigService } from '@nestjs/config';
import { isOk } from '../../../application/common/result';

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

    // Handle domain errors
    const error = result.error;
    if (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_CREDENTIALS') {
      throw new Error('Invalid credentials'); // This should be converted to proper HTTP exception
    }

    throw error;
  }
}

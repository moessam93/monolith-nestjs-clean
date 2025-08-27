import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { TOKENS } from '../../../infrastructure/common/tokens';
import { ValidateUserUseCase } from '../../../application/use-cases/auth/validate-user.usecase';
import { isOk } from '../../../application/common/result';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(TOKENS.ValidateUserUseCase)
    private readonly validateUserUseCase: ValidateUserUseCase,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }

    return user;
  }
}

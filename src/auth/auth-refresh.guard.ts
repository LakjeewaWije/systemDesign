import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/utils/customDecorators/publicRequest.decorator';
@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromBody(request);
    if (!token) {
      throw new UnauthorizedException('Refresh Token Not Found In The Body');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<any>('app.secret'),
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Refresh Token Expired');
    }
    return true;
  }

  private extractTokenFromBody(request: Request): string | undefined {
    const { refresh } = request.body;
    return refresh;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RIGHT_KEY } from 'src/utils/customDecorators/rights.decorator';
import { Right } from 'src/utils/enum/right.enum';

@Injectable()
export class RightsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRights = this.reflector.getAllAndOverride<Right[]>(
      RIGHT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRights) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log('user', user);
    return requiredRights.some((right) => user.rights?.includes(right));
  }
}

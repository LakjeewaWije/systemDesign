import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessResponseFilter implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: 200,
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
          data: data,
          validationErrors: {},
          errors: {},
        };
      }),
    );
  }
}

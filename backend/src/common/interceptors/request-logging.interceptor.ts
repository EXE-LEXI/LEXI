import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable, catchError, tap, throwError } from "rxjs";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${request.method} ${request.originalUrl ?? request.url} ${
            Date.now() - startedAt
          }ms`
        );
      }),
      catchError((error) => {
        this.logger.warn(
          `${request.method} ${request.originalUrl ?? request.url} failed ${
            Date.now() - startedAt
          }ms`
        );
        return throwError(() => error);
      })
    );
  }
}

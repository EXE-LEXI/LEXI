import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { ApiSuccessResponse } from "../interfaces/api-response.interface";

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (this.isApiSuccessResponse(data)) {
          return data;
        }

        return {
          success: true,
          data: data ?? null,
          message: "OK",
        };
      })
    );
  }

  private isApiSuccessResponse(data: unknown): data is ApiSuccessResponse<T> {
    return (
      Boolean(data) &&
      typeof data === "object" &&
      "success" in data &&
      "data" in data &&
      "message" in data
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl ?? request.url} ${status}`,
        exception instanceof Error ? exception.stack : `${exception}`
      );
    }

    const errorBody = {
      success: false,
      statusCode: status,
      error: this.getError(exceptionResponse, status),
      message: this.getMessage(exceptionResponse, exception),
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    };

    const details = this.getDetails(exceptionResponse);

    response.status(status).json(
      details === undefined
        ? errorBody
        : {
            ...errorBody,
            details,
          }
    );
  }

  private getMessage(exceptionResponse: unknown, exception: unknown): unknown {
    if (typeof exceptionResponse === "string") {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      return (exceptionResponse as { message: unknown }).message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return "Internal server error";
  }

  private getError(exceptionResponse: unknown, status: number): unknown {
    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "error" in exceptionResponse
    ) {
      return (exceptionResponse as { error: unknown }).error;
    }

    return HttpStatus[status] ?? "Error";
  }

  private getDetails(exceptionResponse: unknown): unknown {
    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "details" in exceptionResponse
    ) {
      return (exceptionResponse as { details: unknown }).details;
    }

    return undefined;
  }
}

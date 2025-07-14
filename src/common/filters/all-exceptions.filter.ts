import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger, // Use Nest's built-in logger
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

@Catch() // Catches all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? (exception.getResponse() as { message?: string }).message ||
          exception.message
        : 'Internal server error';

    const errorDetails =
      exception instanceof HttpException
        ? (exception.getResponse() as { error?: string }).error ||
          exception.name // For validation errors, 'error' is often present
        : 'UnhandledException';

    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Log the actual error for debugging (structured if possible)
    this.logger.error(
      `[${method} ${path}] Status: ${httpStatus} - Error: ${errorMessage}`,
      (exception as Error).stack, // Include stack trace for server errors
      'AllExceptionsFilter',
      {
        // Contextual data for structured logging
        statusCode: httpStatus,
        path: path,
        method: method,
        errorName: (exception as Error).name,
        errorMessage: (exception as Error).message,
        stack: (exception as Error).stack,
        // Include request body/params carefully to avoid sensitive data
        // body: request.body, // Be careful not to log sensitive data like passwords
        // query: request.query,
        // params: request.params,
      },
    );

    response.status(httpStatus).json({
      statusCode: httpStatus,
      timestamp: timestamp,
      path: path,
      method: method,
      message: errorMessage,
      error: errorDetails,
    });
  }
}

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: typeof message === 'string' ? message : (message as any).message,
            error: exception instanceof Error ? exception.message : 'Unknown error',
        };

        this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : 'Unknown error');

        response.status(status).json(errorResponse);
    }
}

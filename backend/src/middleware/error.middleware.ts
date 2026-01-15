import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { internalServerErrorResponse, badRequestResponse } from '../utils/response.js';
import { createLogger } from '../utils/logger.js';
import { ValidationError } from './validation.middleware.js';

/**
 * Custom application errors
 */
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400, 'BAD_REQUEST');
    }
}

/**
 * Global error handler middleware
 */
export function withErrorHandler(
    handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const correlationId = event.requestContext.requestId;
        const log = createLogger(correlationId);

        try {
            log.info('Request received', {
                path: event.path,
                method: event.httpMethod,
                queryParams: event.queryStringParameters,
            });

            const result = await handler(event);

            log.info('Request completed', {
                statusCode: result.statusCode,
            });

            return result;
        } catch (error) {
            log.error('Request failed', { error });

            // Handle known application errors
            if (error instanceof AppError) {
                return {
                    statusCode: error.statusCode,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        success: false,
                        error: error.message,
                        code: error.code,
                    }),
                };
            }

            // Handle validation errors
            if (error instanceof ValidationError) {
                return {
                    statusCode: 422,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        success: false,
                        error: error.message,
                        details: error.errors,
                    }),
                };
            }

            // Handle DynamoDB conditional check failures
            if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
                return badRequestResponse('Resource has been modified or does not exist');
            }

            // Handle unknown errors
            return internalServerErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
        }
    };
}

/**
 * Combine multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
}

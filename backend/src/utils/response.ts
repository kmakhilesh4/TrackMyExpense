import type { APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const successResponse = <T>(data: T, statusCode = 200): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            data,
        }),
    };
};

export const errorResponse = (
    error: string | Error,
    statusCode = 500,
    details?: unknown
): APIGatewayProxyResult => {
    const errorMessage = error instanceof Error ? error.message : error;

    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: false,
            error: errorMessage,
            ...(details ? { details } : {}),
        }),
    };
};

// Common response helpers
export const createdResponse = <T>(data: T): APIGatewayProxyResult => {
    return successResponse(data, 201);
};

export const noContentResponse = (): APIGatewayProxyResult => {
    return {
        statusCode: 204,
        headers: CORS_HEADERS,
        body: '',
    };
};

export const badRequestResponse = (message: string, details?: unknown): APIGatewayProxyResult => {
    return errorResponse(message, 400, details);
};

export const unauthorizedResponse = (message = 'Unauthorized'): APIGatewayProxyResult => {
    return errorResponse(message, 401);
};

export const forbiddenResponse = (message = 'Forbidden'): APIGatewayProxyResult => {
    return errorResponse(message, 403);
};

export const notFoundResponse = (message = 'Resource not found'): APIGatewayProxyResult => {
    return errorResponse(message, 404);
};

export const conflictResponse = (message: string): APIGatewayProxyResult => {
    return errorResponse(message, 409);
};

export const validationErrorResponse = (errors: unknown): APIGatewayProxyResult => {
    return errorResponse('Validation failed', 422, errors);
};

export const internalServerErrorResponse = (error?: Error): APIGatewayProxyResult => {
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error?.message || 'Internal server error';

    return errorResponse(message, 500, process.env.NODE_ENV !== 'production' ? error?.stack : undefined);
};


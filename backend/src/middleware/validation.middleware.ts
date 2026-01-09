import { z, ZodSchema, ZodError } from 'zod';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validationErrorResponse } from '../utils/response';
import logger from '../utils/logger';

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>, body: string | null): T | null {
    if (!body) {
        return null;
    }

    try {
        const parsed = JSON.parse(body);
        return schema.parse(parsed);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError('Request body validation failed', error.errors);
        }
        throw error;
    }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQueryParams<T>(
    schema: ZodSchema<T>,
    queryParams: { [key: string]: string | undefined } | null
): T {
    try {
        return schema.parse(queryParams || {});
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError('Query parameters validation failed', error.errors);
        }
        throw error;
    }
}

/**
 * Validate path parameters against a Zod schema
 */
export function validatePathParams<T>(
    schema: ZodSchema<T>,
    pathParams: { [key: string]: string | undefined } | null
): T {
    try {
        return schema.parse(pathParams || {});
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError('Path parameters validation failed', error.errors);
        }
        throw error;
    }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
    constructor(
        message: string,
        public errors: z.ZodIssue[]
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Middleware wrapper for request validation
 */
export function withValidation<TBody, TQuery = any, TPath = any>(
    schemas: {
        body?: ZodSchema<TBody>;
        query?: ZodSchema<TQuery>;
        path?: ZodSchema<TPath>;
    },
    handler: (
        event: APIGatewayProxyEvent,
        validated: {
            body?: TBody;
            query?: TQuery;
            path?: TPath;
        }
    ) => Promise<any>
) {
    return async (event: APIGatewayProxyEvent) => {
        try {
            const validated: any = {};

            // Validate body
            if (schemas.body) {
                validated.body = validateBody(schemas.body, event.body);
            }

            // Validate query parameters
            if (schemas.query) {
                validated.query = validateQueryParams(schemas.query, event.queryStringParameters);
            }

            // Validate path parameters
            if (schemas.path) {
                validated.path = validatePathParams(schemas.path, event.pathParameters);
            }

            return await handler(event, validated);
        } catch (error) {
            if (error instanceof ValidationError) {
                logger.warn('Validation error', { errors: error.errors });
                return validationErrorResponse(error.errors);
            }
            throw error;
        }
    };
}

// Common validation schemas
export const commonSchemas = {
    uuid: z.string().uuid(),
    email: z.string().email(),
    positiveNumber: z.number().positive(),
    nonEmptyString: z.string().min(1),
    isoDate: z.string().datetime(),
    pagination: z.object({
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
        nextToken: z.string().optional(),
    }),
};

import type { APIGatewayResponse } from '../types';

export const successResponse = <T>(data: T, statusCode = 200): APIGatewayResponse => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
            success: true,
            data,
        }),
    };
};

export const errorResponse = (
    error: string,
    statusCode = 500,
    details?: unknown
): APIGatewayResponse => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({
            success: false,
            error,
            ...(details && { details }),
        }),
    };
};

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { unauthorizedResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

// Create JWT verifier for Cognito
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    tokenUse: 'access',
    clientId: process.env.COGNITO_CLIENT_ID || '',
});

export interface AuthenticatedUser {
    userId: string;
    email: string;
    username: string;
}

/**
 * Middleware to verify JWT token from Cognito
 */
export async function verifyAuth(event: APIGatewayProxyEvent): Promise<AuthenticatedUser | APIGatewayProxyResult> {
    try {
        // Get token from Authorization header
        const authHeader = event.headers.Authorization || event.headers.authorization;

        if (!authHeader) {
            logger.warn('Missing Authorization header');
            return unauthorizedResponse('Missing authentication token');
        }

        // Extract token (format: "Bearer <token>")
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            logger.warn('Invalid Authorization header format');
            return unauthorizedResponse('Invalid authentication token');
        }

        // Verify token with Cognito
        const payload = await verifier.verify(token);

        // Extract user information
        const user: AuthenticatedUser = {
            userId: payload.sub,
            email: payload.email as string || '',
            username: payload.username as string || payload['cognito:username'] as string || '',
        };

        logger.info('User authenticated', { userId: user.userId });

        return user;
    } catch (error) {
        logger.error('Authentication failed', { error });

        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                return unauthorizedResponse('Token has expired');
            }
            if (error.message.includes('invalid')) {
                return unauthorizedResponse('Invalid token');
            }
        }

        return unauthorizedResponse('Authentication failed');
    }
}

/**
 * Check if user has permission to access resource
 */
export function checkResourceOwnership(
    user: AuthenticatedUser,
    resourceUserId: string
): boolean {
    return user.userId === resourceUserId;
}

/**
 * Middleware wrapper for authenticated handlers
 */
export function withAuth(
    handler: (event: APIGatewayProxyEvent, user: AuthenticatedUser) => Promise<APIGatewayProxyResult>
) {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const authResult = await verifyAuth(event);

        // If authResult is an error response, return it
        if ('statusCode' in authResult) {
            return authResult;
        }

        // Otherwise, call the handler with the authenticated user
        return handler(event, authResult);
    };
}

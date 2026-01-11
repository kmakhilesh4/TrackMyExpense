import { APIGatewayProxyHandler } from 'aws-lambda';
import { AccountRepository } from '../repositories/account.repository.js';
import { AccountService } from '../services/account.service.js';
import { successResponse, noContentResponse } from '../utils/response.js';
import { withErrorHandler, compose } from '../middleware/error.middleware.js';
import { withAuth, AuthenticatedUser } from '../middleware/auth.middleware.js';
import { withValidation } from '../middleware/validation.middleware.js';
import { accountSchemas } from '../middleware/account.validation.js';

// Initialize dependencies
const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);

/**
 * List Accounts Handler
 */
export const list: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (_event: any, user: AuthenticatedUser) => {
    const accounts = await accountService.listAccounts(user.userId);
    return successResponse(accounts);
}) as APIGatewayProxyHandler;

/**
 * Create Account Handler
 */
export const create: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: accountSchemas.create })
)(async (_event: any, user: AuthenticatedUser, validated: any) => {
    const account = await accountService.createAccount(user.userId, validated.body);
    return successResponse(account, 201);
}) as APIGatewayProxyHandler;

/**
 * Update Account Handler
 */
export const update: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: accountSchemas.update })
)(async (event: any, user: AuthenticatedUser, validated: any) => {
    const accountId = event.pathParameters?.id!;
    const account = await accountService.updateAccount(user.userId, accountId, validated.body);
    return successResponse(account);
}) as APIGatewayProxyHandler;

/**
 * Delete Account Handler
 */
export const deleteAccount: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (event: any, user: AuthenticatedUser) => {
    const accountId = event.pathParameters?.id!;
    await accountService.deleteAccount(user.userId, accountId);
    return noContentResponse();
}) as APIGatewayProxyHandler;

import { APIGatewayProxyHandler } from 'aws-lambda';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { AccountRepository } from '../repositories/account.repository.js';
import { TransactionService } from '../services/transaction.service.js';
import { successResponse, noContentResponse } from '../utils/response.js';
import { withErrorHandler, compose } from '../middleware/error.middleware.js';
import { withAuth, AuthenticatedUser } from '../middleware/auth.middleware.js';
import { withValidation } from '../middleware/validation.middleware.js';
import { transactionSchemas } from '../middleware/transaction.validation.js';

// Initialize dependencies
const transactionRepository = new TransactionRepository();
const accountRepository = new AccountRepository();
const transactionService = new TransactionService(transactionRepository, accountRepository);

/**
 * List Transactions Handler
 */
export const list: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ query: transactionSchemas.query })
)(async (_event: any, user: AuthenticatedUser, validated: any) => {
    const result = await transactionService.listTransactions(user.userId, validated.query);
    return successResponse(result);
}) as APIGatewayProxyHandler;

/**
 * Create Transaction Handler
 */
export const create: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: transactionSchemas.create })
)(async (_event: any, user: AuthenticatedUser, validated: any) => {
    const transaction = await transactionService.createTransaction(user.userId, validated.body);
    return successResponse(transaction, 201);
}) as APIGatewayProxyHandler;

/**
 * Delete Transaction Handler
 */
export const deleteTransaction: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (event: any, user: AuthenticatedUser) => {
    // Note: for deletion, we need the full SK because it's a composite key
    const sk = event.queryStringParameters?.sk;
    if (!sk) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing "sk" query parameter' })
        };
    }

    await transactionService.deleteTransaction(user.userId, sk);
    return noContentResponse();
}) as APIGatewayProxyHandler;

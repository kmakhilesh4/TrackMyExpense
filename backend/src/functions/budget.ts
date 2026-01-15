import { APIGatewayProxyHandler } from 'aws-lambda';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { BudgetService } from '../services/budget.service.js';
import { successResponse, noContentResponse } from '../utils/response.js';
import { withErrorHandler, compose } from '../middleware/error.middleware.js';
import { withAuth, AuthenticatedUser } from '../middleware/auth.middleware.js';
import { withValidation } from '../middleware/validation.middleware.js';
import { budgetSchemas } from '../middleware/budget.validation.js';

// Initialize dependencies
const budgetRepository = new BudgetRepository();
const budgetService = new BudgetService(budgetRepository);

/**
 * List Budgets Handler
 */
export const list: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (_event: any, user: AuthenticatedUser) => {
    const budgets = await budgetService.listBudgets(user.userId);
    return successResponse(budgets);
}) as APIGatewayProxyHandler;

/**
 * Create Budget Handler
 */
export const create: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: budgetSchemas.create })
)(async (_event: any, user: AuthenticatedUser, validated: any) => {
    const budget = await budgetService.createBudget(user.userId, validated.body);
    return successResponse(budget, 201);
}) as APIGatewayProxyHandler;

/**
 * Update Budget Handler
 */
export const update: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: budgetSchemas.update })
)(async (event: any, user: AuthenticatedUser, validated: any) => {
    const budgetId = event.pathParameters?.id!;
    const budget = await budgetService.updateBudget(user.userId, budgetId, validated.body);
    return successResponse(budget);
}) as APIGatewayProxyHandler;

/**
 * Delete Budget Handler
 */
export const deleteBudget: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (event: any, user: AuthenticatedUser) => {
    const budgetId = event.pathParameters?.id!;
    await budgetService.deleteBudget(user.userId, budgetId);
    return noContentResponse();
}) as APIGatewayProxyHandler;

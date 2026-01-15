import { APIGatewayProxyHandler } from 'aws-lambda';
import { CategoryRepository } from '../repositories/category.repository.js';
import { CategoryService } from '../services/category.service.js';
import { successResponse, noContentResponse } from '../utils/response.js';
import { withErrorHandler, compose } from '../middleware/error.middleware.js';
import { withAuth, AuthenticatedUser } from '../middleware/auth.middleware.js';
import { withValidation } from '../middleware/validation.middleware.js';
import { categorySchemas } from '../middleware/category.validation.js';

// Initialize dependencies
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

/**
 * List Categories Handler
 */
export const list: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (_event: any, user: AuthenticatedUser) => {
    const categories = await categoryService.listCategories(user.userId);
    return successResponse(categories);
}) as APIGatewayProxyHandler;

/**
 * Create Category Handler
 */
export const create: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: categorySchemas.create })
)(async (_event: any, user: AuthenticatedUser, validated: any) => {
    const category = await categoryService.createCategory(user.userId, validated.body);
    return successResponse(category, 201);
}) as APIGatewayProxyHandler;

/**
 * Update Category Handler
 */
export const update: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth,
    withValidation({ body: categorySchemas.update })
)(async (event: any, user: AuthenticatedUser, validated: any) => {
    const categoryId = event.pathParameters?.id!;
    const category = await categoryService.updateCategory(user.userId, categoryId, validated.body);
    return successResponse(category);
}) as APIGatewayProxyHandler;

/**
 * Delete Category Handler
 */
export const deleteCategory: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (event: any, user: AuthenticatedUser) => {
    const categoryId = event.pathParameters?.id!;
    await categoryService.deleteCategory(user.userId, categoryId);
    return noContentResponse();
}) as APIGatewayProxyHandler;

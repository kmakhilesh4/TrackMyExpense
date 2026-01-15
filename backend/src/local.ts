// Load environment variables FIRST before any other imports
import './env.js';

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Import Lambda handlers AFTER env is loaded
import * as healthHandler from './functions/health.js';
import * as accountHandler from './functions/account.js';
import * as transactionHandler from './functions/transaction.js';
import * as categoryHandler from './functions/category.js';
import * as budgetHandler from './functions/budget.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Helper function to convert Lambda handler to Express handler
const lambdaToExpress = (handler: any) => {
    return async (req: Request, res: Response) => {
        try {
            const event = {
                httpMethod: req.method,
                path: req.path,
                pathParameters: req.params,
                queryStringParameters: req.query,
                headers: req.headers,
                body: req.body ? JSON.stringify(req.body) : null,
                requestContext: {
                    authorizer: req.headers.authorization ? {
                        claims: {
                            sub: 'local-user-id',
                            email: 'local@example.com'
                        }
                    } : undefined
                }
            };

            const context = {};
            const callback = () => { };

            const result = await handler(event, context, callback);

            res.status(result.statusCode || 200)
                .set(result.headers || {})
                .send(result.body ? JSON.parse(result.body) : {});
        } catch (error: any) {
            console.error('Handler error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Internal server error',
                statusCode: 500
            });
        }
    };
};

// Health check
app.get('/health', lambdaToExpress(healthHandler.handler));

// Account routes
app.get('/accounts', lambdaToExpress(accountHandler.list));
app.post('/accounts', lambdaToExpress(accountHandler.create));
app.patch('/accounts/:id', lambdaToExpress(accountHandler.update));
app.delete('/accounts/:id', lambdaToExpress(accountHandler.deleteAccount));

// Transaction routes
app.get('/transactions', lambdaToExpress(transactionHandler.list));
app.post('/transactions', lambdaToExpress(transactionHandler.create));
app.delete('/transactions', lambdaToExpress(transactionHandler.deleteTransaction));

// Category routes
app.get('/categories', lambdaToExpress(categoryHandler.list));
app.post('/categories', lambdaToExpress(categoryHandler.create));
app.patch('/categories/:id', lambdaToExpress(categoryHandler.update));
app.delete('/categories/:id', lambdaToExpress(categoryHandler.deleteCategory));

// Budget routes
app.get('/budgets', lambdaToExpress(budgetHandler.list));
app.post('/budgets', lambdaToExpress(budgetHandler.create));
app.patch('/budgets/:id', lambdaToExpress(budgetHandler.update));
app.delete('/budgets/:id', lambdaToExpress(budgetHandler.deleteBudget));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error('Express error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
        statusCode: 500
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  DynamoDB Table: ${process.env.DYNAMODB_TABLE_NAME}`);
    console.log(`🔐 Cognito User Pool: ${process.env.COGNITO_USER_POOL_ID}`);
});

export default app;

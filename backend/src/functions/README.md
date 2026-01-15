# Backend Directory Structure

This directory contains the Lambda functions and backend logic.

## Structure Overview

```
src/
├── functions/       # Lambda function handlers
│   ├── auth/        # Authentication functions
│   ├── accounts/    # Account CRUD operations
│   ├── transactions/# Transaction CRUD operations
│   ├── budgets/     # Budget management
│   └── analytics/   # Analytics and reports
├── services/        # Business logic layer
├── repositories/    # Data access layer (DynamoDB)
├── models/          # Data models and schemas
├── middleware/      # Auth, validation, error handling
├── utils/           # Helper functions
└── types/           # TypeScript type definitions
```

## Lambda Functions to be Created

### Authentication
- POST /auth/signup - User registration
- POST /auth/login - User login
- POST /auth/refresh - Refresh access token
- POST /auth/forgot-password - Password reset

### Accounts
- GET /accounts - List all accounts
- POST /accounts - Create account
- GET /accounts/:id - Get account details
- PUT /accounts/:id - Update account
- DELETE /accounts/:id - Delete account

### Transactions
- GET /transactions - List transactions (with filters)
- POST /transactions - Create transaction
- GET /transactions/:id - Get transaction details
- PUT /transactions/:id - Update transaction
- DELETE /transactions/:id - Delete transaction
- POST /transactions/:id/receipt - Upload receipt

### Categories
- GET /categories - List all categories
- POST /categories - Create custom category

### Budgets (Future)
- GET /budgets - List budgets
- POST /budgets - Create budget
- PUT /budgets/:id - Update budget
- DELETE /budgets/:id - Delete budget

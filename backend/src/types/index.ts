// Backend types

// DynamoDB entity types
export interface DynamoDBEntity {
    UserId: string;
    EntityType: string;
    createdAt: string;
    updatedAt?: string;
}

// User entity
export interface UserEntity extends DynamoDBEntity {
    email: string;
    fullName: string;
    avatarUrl?: string;
}

// Account entity
export interface AccountEntity extends DynamoDBEntity {
    accountName: string;
    accountType: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
    balance: number;
    currency: string;
    isActive: boolean;
}

// Transaction entity
export interface TransactionEntity extends DynamoDBEntity {
    accountId: string;
    categoryId: string;
    type: 'expense' | 'income';
    amount: number;
    description: string;
    receiptUrl?: string;
    transactionDate: string;
}

// Category entity
export interface CategoryEntity extends DynamoDBEntity {
    name: string;
    type: 'expense' | 'income';
    icon: string;
    color: string;
    isDefault: boolean;
}

// Budget entity
export interface BudgetEntity extends DynamoDBEntity {
    categoryId: string;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
}

// Lambda event types
export interface APIGatewayEvent {
    body: string;
    headers: Record<string, string>;
    pathParameters: Record<string, string> | null;
    queryStringParameters: Record<string, string> | null;
    requestContext: {
        authorizer?: {
            claims?: {
                sub: string;
                email: string;
            };
        };
    };
}

export interface APIGatewayResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
}

// Service response types
export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
}

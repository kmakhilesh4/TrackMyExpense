export interface DynamoDBEntity {
    UserId: string;
    EntityType: string;
    createdAt: string;
    updatedAt?: string;
}

export interface User extends DynamoDBEntity {
    email: string;
    fullName: string;
    avatarUrl?: string;
}

export interface Account extends DynamoDBEntity {
    accountName: string;
    accountType: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';
    balance: number;
    currency: string;
    isActive: boolean;
}

export interface Transaction extends DynamoDBEntity {
    accountId: string;
    categoryId: string;
    type: 'expense' | 'income';
    amount: number;
    description: string;
    receiptUrl?: string;
    transactionDate: string;
}

export interface Category extends DynamoDBEntity {
    name: string;
    type: 'expense' | 'income';
    icon: string;
    color: string;
    isDefault: boolean;
}

export interface Budget extends DynamoDBEntity {
    categoryId: string;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
}

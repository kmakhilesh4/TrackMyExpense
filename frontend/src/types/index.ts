// User types
export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// Account types
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';

export interface Account {
    id: string;
    userId: string;
    accountName: string;
    accountType: AccountType;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Transaction types
export type TransactionType = 'expense' | 'income';

export interface Transaction {
    id: string;
    userId: string;
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description: string;
    receiptUrl?: string;
    transactionDate: string;
    createdAt: string;
    updatedAt: string;
}

// Category types
export type CategoryType = 'expense' | 'income';

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
    isDefault: boolean;
}

// Budget types
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    fullName: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

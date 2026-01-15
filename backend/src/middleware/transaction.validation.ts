import { z } from 'zod';
import { commonSchemas } from './validation.middleware.js';

/**
 * Transaction validation schemas
 */
export const transactionSchemas = {
    create: z.object({
        accountId: commonSchemas.nonEmptyString,
        categoryId: commonSchemas.nonEmptyString,
        type: z.enum(['expense', 'income']),
        amount: commonSchemas.positiveNumber,
        description: commonSchemas.nonEmptyString,
        transactionDate: commonSchemas.isoDate,
        receiptUrl: z.string().url().optional(),
    }),
    update: z.object({
        accountId: commonSchemas.nonEmptyString.optional(),
        categoryId: commonSchemas.nonEmptyString.optional(),
        type: z.enum(['expense', 'income']).optional(),
        amount: commonSchemas.positiveNumber.optional(),
        description: commonSchemas.nonEmptyString.optional(),
        transactionDate: commonSchemas.isoDate.optional(),
        receiptUrl: z.string().url().optional(),
    }),
    query: z.object({
        accountId: z.string().optional(),
        categoryId: z.string().optional(),
        startDate: commonSchemas.isoDate.optional(),
        endDate: commonSchemas.isoDate.optional(),
        type: z.enum(['expense', 'income']).optional(),
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
        nextToken: z.string().optional(),
    }),
};

export type CreateTransactionInput = z.infer<typeof transactionSchemas.create>;
export type UpdateTransactionInput = z.infer<typeof transactionSchemas.update>;
export type TransactionQueryFilters = z.infer<typeof transactionSchemas.query>;

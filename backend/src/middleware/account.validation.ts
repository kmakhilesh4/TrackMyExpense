import { z } from 'zod';
import { commonSchemas } from './validation.middleware.js';

/**
 * Account validation schemas
 */
export const accountSchemas = {
    create: z.object({
        accountName: commonSchemas.nonEmptyString,
        accountType: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment']),
        balance: z.number().default(0),
        currency: z.string().length(3).default('INR'), // Default to INR since user is in ap-south-1
        isActive: z.boolean().optional().default(true),
    }),
    update: z.object({
        accountName: commonSchemas.nonEmptyString.optional(),
        accountType: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment']).optional(),
        balance: z.number().optional(),
        currency: z.string().length(3).optional(),
        isActive: z.boolean().optional(),
    }),
};

export type CreateAccountInput = z.infer<typeof accountSchemas.create>;
export type UpdateAccountInput = z.infer<typeof accountSchemas.update>;

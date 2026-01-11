import { z } from 'zod';
import { commonSchemas } from './validation.middleware.js';

/**
 * Budget validation schemas
 */
export const budgetSchemas = {
    create: z.object({
        categoryId: commonSchemas.nonEmptyString,
        amount: commonSchemas.positiveNumber,
        period: z.enum(['weekly', 'monthly', 'yearly']),
        startDate: commonSchemas.isoDate,
        endDate: commonSchemas.isoDate,
    }).refine(data => new Date(data.startDate) < new Date(data.endDate), {
        message: "End date must be after start date",
        path: ["endDate"]
    }),
    update: z.object({
        amount: commonSchemas.positiveNumber.optional(),
        period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
        startDate: commonSchemas.isoDate.optional(),
        endDate: commonSchemas.isoDate.optional(),
    }),
};

export type CreateBudgetInput = z.infer<typeof budgetSchemas.create>;
export type UpdateBudgetInput = z.infer<typeof budgetSchemas.update>;

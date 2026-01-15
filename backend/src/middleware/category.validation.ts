import { z } from 'zod';
import { commonSchemas } from './validation.middleware.js';

/**
 * Category validation schemas
 */
export const categorySchemas = {
    create: z.object({
        name: commonSchemas.nonEmptyString,
        type: z.enum(['expense', 'income']),
        icon: commonSchemas.nonEmptyString,
        color: commonSchemas.nonEmptyString,
        isDefault: z.boolean().optional().default(false),
    }),
    update: z.object({
        name: commonSchemas.nonEmptyString.optional(),
        type: z.enum(['expense', 'income']).optional(),
        icon: commonSchemas.nonEmptyString.optional(),
        color: commonSchemas.nonEmptyString.optional(),
        isDefault: z.boolean().optional(),
    }),
};

export type CreateCategoryInput = z.infer<typeof categorySchemas.create>;
export type UpdateCategoryInput = z.infer<typeof categorySchemas.update>;

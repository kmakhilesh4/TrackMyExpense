import {
    queryItems,
    putItem,
    getItem,
    updateItem,
    deleteItem
} from '../utils/dynamodb.js';
import { BudgetEntity } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Budget Repository
 * Handles DynamoDB interactions for Budgets
 * Key Pattern:
 * PK: USER#{userId}
 * SK: BUDGET#{budgetId}
 */
export class BudgetRepository {
    private readonly ENTITY_TYPE = 'BUDGET';

    /**
     * Get all budgets for a user
     */
    async list(userId: string): Promise<BudgetEntity[]> {
        const pk = `USER#${userId}`;
        const skPrefix = `${this.ENTITY_TYPE}#`;

        const result = await queryItems({
            keyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
            expressionAttributeValues: {
                ':pk': pk,
                ':skPrefix': skPrefix,
            },
        });

        return result.items as BudgetEntity[];
    }

    /**
     * Get budget by ID
     */
    async get(userId: string, budgetId: string): Promise<BudgetEntity | null> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${budgetId}`;

        const item = await getItem({ PK: pk, SK: sk });
        return (item as BudgetEntity) || null;
    }

    /**
     * Create a new budget
     */
    async create(userId: string, data: Omit<BudgetEntity, 'PK' | 'SK' | 'createdAt' | 'updatedAt'>): Promise<BudgetEntity> {
        const budgetId = uuidv4();
        const now = new Date().toISOString();

        const budget: BudgetEntity = {
            PK: `USER#${userId}`,
            SK: `${this.ENTITY_TYPE}#${budgetId}`,
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        await putItem(budget);
        return budget;
    }

    /**
     * Update an existing budget
     */
    async update(userId: string, budgetId: string, data: Partial<Omit<BudgetEntity, 'PK' | 'SK' | 'createdAt'>>): Promise<BudgetEntity> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${budgetId}`;
        const now = new Date().toISOString();

        let updateExpression = 'SET #updatedAt = :updatedAt';
        const expressionAttributeValues: Record<string, any> = {
            ':updatedAt': now,
        };
        const expressionAttributeNames: Record<string, string> = {
            '#updatedAt': 'updatedAt'
        };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updateExpression += `, #${key} = :${key}`;
                expressionAttributeValues[`:${key}`] = value;
                expressionAttributeNames[`#${key}`] = key;
            }
        });

        const result = await updateItem({
            key: { PK: pk, SK: sk },
            updateExpression,
            expressionAttributeValues,
            expressionAttributeNames,
        });

        return result as BudgetEntity;
    }

    /**
     * Delete a budget
     */
    async delete(userId: string, budgetId: string): Promise<void> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${budgetId}`;

        await deleteItem({ PK: pk, SK: sk });
    }
}

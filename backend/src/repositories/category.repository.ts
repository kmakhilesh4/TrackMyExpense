import {
    queryItems,
    putItem,
    getItem,
    updateItem,
    deleteItem
} from '../utils/dynamodb.js';
import { CategoryEntity } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Category Repository
 * Handles DynamoDB interactions for Categories
 * Key Pattern:
 * UserId: USER#{userId}
 * EntityType: CATEGORY#{categoryId}
 */
export class CategoryRepository {
    private readonly ENTITY_TYPE = 'CATEGORY';

    /**
     * Get all categories for a user
     */
    async list(userId: string): Promise<CategoryEntity[]> {
        const pk = `USER#${userId}`;
        const skPrefix = `${this.ENTITY_TYPE}#`;

        const result = await queryItems({
            keyConditionExpression: 'UserId = :userId AND begins_with(EntityType, :skPrefix)',
            expressionAttributeValues: {
                ':userId': pk,
                ':skPrefix': skPrefix,
            },
        });

        return result.items as CategoryEntity[];
    }

    /**
     * Get category by ID
     */
    async get(userId: string, categoryId: string): Promise<CategoryEntity | null> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${categoryId}`;

        const item = await getItem({ UserId: pk, EntityType: sk });
        return (item as CategoryEntity) || null;
    }

    /**
     * Create a new category
     */
    async create(userId: string, data: Omit<CategoryEntity, 'UserId' | 'EntityType' | 'createdAt' | 'updatedAt'>): Promise<CategoryEntity> {
        const categoryId = uuidv4();
        const now = new Date().toISOString();

        const category: CategoryEntity = {
            UserId: `USER#${userId}`,
            EntityType: `${this.ENTITY_TYPE}#${categoryId}`,
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        await putItem(category);
        return category;
    }

    /**
     * Update an existing category
     */
    async update(userId: string, categoryId: string, data: Partial<Omit<CategoryEntity, 'UserId' | 'EntityType' | 'createdAt'>>): Promise<CategoryEntity> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${categoryId}`;
        const now = new Date().toISOString();

        // Build update expression dynamically based on data
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
            key: { UserId: pk, EntityType: sk },
            updateExpression,
            expressionAttributeValues,
            expressionAttributeNames,
        });

        return result as CategoryEntity;
    }

    /**
     * Delete a category
     */
    async delete(userId: string, categoryId: string): Promise<void> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${categoryId}`;

        await deleteItem({ UserId: pk, EntityType: sk });
    }
}

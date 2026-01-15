import {
    queryItems,
    getItem,
    TABLE_NAME
} from '../utils/dynamodb.js';
import { TransactionEntity } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { TransactionQueryFilters } from '../middleware/transaction.validation.js';

/**
 * Transaction Repository
 * Handles DynamoDB interactions for Transactions
 * Key Pattern:
 * UserId: USER#{userId}
 * EntityType: TX#{transactionDate}#{transactionId}
 */
export class TransactionRepository {
    private readonly ENTITY_PREFIX = 'TX';

    /**
     * List transactions for a user with optional filters
     */
    async list(userId: string, filters: TransactionQueryFilters): Promise<{ items: TransactionEntity[], lastEvaluatedKey?: any }> {
        const pk = `USER#${userId}`;
        let skPrefix = `${this.ENTITY_PREFIX}#`;

        const expressionAttributeValues: Record<string, any> = {
            ':userId': pk
        };
        const expressionAttributeNames: Record<string, string> = {};

        let keyConditionExpression = 'UserId = :userId';

        // Filter by date range if provided
        if (filters.startDate && filters.endDate) {
            keyConditionExpression += ` AND EntityType BETWEEN :start AND :end`;
            expressionAttributeValues[':start'] = `${skPrefix}${filters.startDate}`;
            expressionAttributeValues[':end'] = `${skPrefix}${filters.endDate}Z`; // Z to ensure inclusive end of day
        } else if (filters.startDate) {
            keyConditionExpression += ` AND EntityType >= :start`;
            expressionAttributeValues[':start'] = `${skPrefix}${filters.startDate}`;
        } else if (filters.endDate) {
            keyConditionExpression += ` AND EntityType <= :end`;
            expressionAttributeValues[':end'] = `${skPrefix}${filters.endDate}Z`;
        } else {
            keyConditionExpression += ` AND begins_with(EntityType, :prefix)`;
            expressionAttributeValues[':prefix'] = skPrefix;
        }

        // Additional filters (Filtering on non-key attributes)
        const filterExpressions: string[] = [];
        if (filters.accountId) {
            filterExpressions.push('accountId = :accountId');
            expressionAttributeValues[':accountId'] = filters.accountId;
        }
        if (filters.categoryId) {
            filterExpressions.push('categoryId = :categoryId');
            expressionAttributeValues[':categoryId'] = filters.categoryId;
        }
        if (filters.type) {
            filterExpressions.push('#type = :type');
            expressionAttributeValues[':type'] = filters.type;
            expressionAttributeNames['#type'] = 'type';
        }

        // Since queryItems from dynamodb.ts doesn't support FilterExpression yet, 
        // we might need to update it or handle filtering in-memory for now if the result set is small.
        // For a more robust solution, I'll update queryItems to support filter expressions.

        const result = await queryItems({
            keyConditionExpression,
            expressionAttributeValues,
            expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
            limit: filters.limit,
            exclusiveStartKey: filters.nextToken as unknown as Record<string, any>,
            scanIndexForward: false, // Default to newest first
        });

        // Manual filtering for account/category/type if needed (if we don't update queryItems)
        let items = result.items as TransactionEntity[];
        if (filterExpressions.length > 0) {
            items = items.filter(item => {
                let match = true;
                if (filters.accountId && item.accountId !== filters.accountId) match = false;
                if (filters.categoryId && item.categoryId !== filters.categoryId) match = false;
                if (filters.type && item.type !== filters.type) match = false;
                return match;
            });
        }

        return {
            items,
            lastEvaluatedKey: result.lastEvaluatedKey
        };
    }

    /**
     * Get transaction by ID (requires both PK and SK)
     * Note: In this design, to get a single transaction by ID without knowing the date, 
     * we would need another GSI or look it up differently. 
     * For now, common use case is fetching after a list.
     */
    async get(userId: string, sk: string): Promise<TransactionEntity | null> {
        const pk = `USER#${userId}`;
        const item = await getItem({ UserId: pk, EntityType: sk });
        return (item as TransactionEntity) || null;
    }

    /**
     * Prepare Create Transaction Operation
     * Returns the object for TransactWriteItems
     */
    prepareCreate(userId: string, data: Omit<TransactionEntity, 'UserId' | 'EntityType' | 'createdAt' | 'updatedAt'>): { transaction: TransactionEntity, op: any } {
        const id = uuidv4();
        const now = new Date().toISOString();
        const transaction: TransactionEntity = {
            UserId: `USER#${userId}`,
            EntityType: `${this.ENTITY_PREFIX}#${data.transactionDate}#${id}`,
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        return {
            transaction,
            op: {
                Put: {
                    TableName: TABLE_NAME,
                    Item: transaction
                }
            }
        };
    }

    /**
     * Prepare Delete Transaction Operation
     */
    prepareDelete(userId: string, sk: string): any {
        return {
            Delete: {
                TableName: TABLE_NAME,
                Key: { UserId: `USER#${userId}`, EntityType: sk }
            }
        };
    }
}

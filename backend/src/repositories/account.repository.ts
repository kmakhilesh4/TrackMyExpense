import {
    queryItems,
    putItem,
    getItem,
    updateItem,
    deleteItem,
    TABLE_NAME
} from '../utils/dynamodb.js';
import { AccountEntity } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Account Repository
 * Handles DynamoDB interactions for Accounts
 * Key Pattern:
 * PK: USER#{userId}
 * SK: ACCOUNT#{accountId}
 */
export class AccountRepository {
    private readonly ENTITY_TYPE = 'ACCOUNT';

    /**
     * Get all accounts for a user
     */
    async list(userId: string): Promise<AccountEntity[]> {
        const pk = `USER#${userId}`;
        const skPrefix = `${this.ENTITY_TYPE}#`;

        const result = await queryItems({
            keyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
            expressionAttributeValues: {
                ':pk': pk,
                ':skPrefix': skPrefix,
            },
        });

        return result.items as AccountEntity[];
    }

    /**
     * Get account by ID
     */
    async get(userId: string, accountId: string): Promise<AccountEntity | null> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${accountId}`;

        const item = await getItem({ PK: pk, SK: sk });
        return (item as AccountEntity) || null;
    }

    /**
     * Create a new account
     */
    async create(userId: string, data: Omit<AccountEntity, 'PK' | 'SK' | 'createdAt' | 'updatedAt'>): Promise<AccountEntity> {
        const accountId = uuidv4();
        const now = new Date().toISOString();

        const account: AccountEntity = {
            PK: `USER#${userId}`,
            SK: `${this.ENTITY_TYPE}#${accountId}`,
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        await putItem(account);
        return account;
    }

    /**
     * Update an existing account
     */
    async update(userId: string, accountId: string, data: Partial<Omit<AccountEntity, 'PK' | 'SK' | 'createdAt'>>): Promise<AccountEntity> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${accountId}`;
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

        return result as AccountEntity;
    }

    /**
     * Prepare Update Balance Operation
     * Used for atomic updates in transactions
     */
    prepareUpdateBalance(userId: string, accountId: string, amount: number): any {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${accountId}`;
        const now = new Date().toISOString();

        return {
            Update: {
                TableName: TABLE_NAME,
                Key: { PK: pk, SK: sk },
                UpdateExpression: 'SET balance = balance + :amount, #updatedAt = :now',
                ExpressionAttributeValues: {
                    ':amount': amount,
                    ':now': now
                },
                ExpressionAttributeNames: {
                    '#updatedAt': 'updatedAt'
                }
            }
        };
    }

    /**
     * Delete an account
     */
    async delete(userId: string, accountId: string): Promise<void> {
        const pk = `USER#${userId}`;
        const sk = `${this.ENTITY_TYPE}#${accountId}`;

        await deleteItem({ PK: pk, SK: sk });
    }
}

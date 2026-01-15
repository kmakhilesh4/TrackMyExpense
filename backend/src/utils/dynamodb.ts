import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    BatchWriteCommand,
    BatchGetCommand,
    TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

// Create DynamoDB client
// AWS SDK will automatically use credentials from:
// 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
// 2. AWS credentials file (~/.aws/credentials)
// 3. IAM role (when running on AWS)
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
});

// Create Document client with marshalling options
export const dynamoDb = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
    },
    unmarshallOptions: {
        wrapNumbers: false,
    },
});

// Table name from environment variable
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'TrackMyExpense-dev';

/**
 * Put item into DynamoDB
 */
export async function putItem(item: Record<string, any>) {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
    });

    return await dynamoDb.send(command);
}

/**
 * Get item from DynamoDB
 */
export async function getItem(key: Record<string, any>) {
    const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: key,
    });

    const result = await dynamoDb.send(command);
    return result.Item;
}

/**
 * Query items from DynamoDB
 */
export async function queryItems(params: {
    keyConditionExpression: string;
    expressionAttributeValues: Record<string, any>;
    expressionAttributeNames?: Record<string, string>;
    indexName?: string;
    limit?: number;
    scanIndexForward?: boolean;
    exclusiveStartKey?: Record<string, any>;
}) {
    const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ExpressionAttributeNames: params.expressionAttributeNames,
        IndexName: params.indexName,
        Limit: params.limit,
        ScanIndexForward: params.scanIndexForward,
        ExclusiveStartKey: params.exclusiveStartKey,
    });

    const result = await dynamoDb.send(command);
    return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
    };
}

/**
 * Update item in DynamoDB
 */
export async function updateItem(params: {
    key: Record<string, any>;
    updateExpression: string;
    expressionAttributeValues: Record<string, any>;
    expressionAttributeNames?: Record<string, string>;
    conditionExpression?: string;
}) {
    const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: params.key,
        UpdateExpression: params.updateExpression,
        ExpressionAttributeValues: params.expressionAttributeValues,
        ExpressionAttributeNames: params.expressionAttributeNames,
        ConditionExpression: params.conditionExpression,
        ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoDb.send(command);
    return result.Attributes;
}

/**
 * Delete item from DynamoDB
 */
export async function deleteItem(key: Record<string, any>) {
    const command = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: key,
    });

    return await dynamoDb.send(command);
}

/**
 * Batch write items (put or delete)
 */
export async function batchWriteItems(items: Array<{ PutRequest?: { Item: any }; DeleteRequest?: { Key: any } }>) {
    const command = new BatchWriteCommand({
        RequestItems: {
            [TABLE_NAME]: items,
        },
    });

    return await dynamoDb.send(command);
}

/**
 * Batch get items
 */
export async function batchGetItems(keys: Array<Record<string, any>>) {
    const command = new BatchGetCommand({
        RequestItems: {
            [TABLE_NAME]: {
                Keys: keys,
            },
        },
    });

    const result = await dynamoDb.send(command);
    return result.Responses?.[TABLE_NAME] || [];
}
/**
 * Transactional write items (atomic updates across multiple items)
 */
export async function transactWriteItems(items: any[]) {
    const command = new TransactWriteCommand({
        TransactItems: items,
    });

    return await dynamoDb.send(command);
}

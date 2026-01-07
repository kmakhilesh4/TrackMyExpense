import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const ENDPOINT = process.env.DYNAMODB_ENDPOINT; // For local development

const client = new DynamoDBClient({
    region: REGION,
    ...(ENDPOINT && { endpoint: ENDPOINT }),
});

// Create a DynamoDB Document client
export const dynamoDb = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
        wrapNumbers: false,
    },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'TrackMyExpense';

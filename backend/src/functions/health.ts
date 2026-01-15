import { APIGatewayProxyHandler } from 'aws-lambda';
import { successResponse } from '../utils/response.js';
import { dynamoDb, TABLE_NAME } from '../utils/dynamodb.js';
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import logger from '../utils/logger.js';

/**
 * Health check handler to verify API and database connectivity
 */
export const handler: APIGatewayProxyHandler = async (_event) => {
    logger.info('Health check triggered');

    try {
        // Verify DynamoDB connectivity by describing the table
        const command = new DescribeTableCommand({ TableName: TABLE_NAME });
        const tableInfo = await dynamoDb.send(command);

        const healthInfo = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: tableInfo.Table?.TableStatus === 'ACTIVE' ? 'connected' : 'degraded',
                tableName: TABLE_NAME,
            },
            aws: {
                region: process.env.AWS_REGION || 'ap-south-1',
            }
        };

        return successResponse(healthInfo);
    } catch (error) {
        logger.error('Health check failed', { error });

        const errorInfo = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            database: {
                status: 'disconnected',
                tableName: TABLE_NAME,
            }
        };

        // Even if unhealthy, we return a successful response with status 'unhealthy'
        // unless there's a catastrophic error in the response utility itself.
        return successResponse(errorInfo, 503);
    }
};

import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { successResponse, errorResponse } from '../utils/response.js';
import { withErrorHandler, compose } from '../middleware/error.middleware.js';
import { withAuth, AuthenticatedUser } from '../middleware/auth.middleware.js';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const BUCKET_NAME = process.env.S3_RECEIPTS_BUCKET || '';
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || '';

/**
 * Upload Profile Picture
 */
export const upload: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (event: any, user: AuthenticatedUser) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { fileName, fileType, fileData } = body;

        if (!fileName || !fileType || !fileData) {
            return errorResponse('Missing required fields', 400);
        }

        // Validate file type (only allow images)
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!ALLOWED_TYPES.includes(fileType.toLowerCase())) {
            return errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', 400);
        }

        // Validate base64 data format
        if (!fileData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/i)) {
            return errorResponse('Invalid image data format', 400);
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

        // Validate file size (max 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (buffer.length > MAX_FILE_SIZE) {
            return errorResponse('File size exceeds 5MB limit', 400);
        }

        // Derive safe extension from validated MIME type
        const extensionMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
        };
        const extension = extensionMap[fileType.toLowerCase()] || 'jpg';

        // Generate unique key with user ID for isolation
        const key = `public/profile-pictures/${user.userId}-${Date.now()}.${extension}`;

        // Upload to S3 (private - no public access)
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: fileType.toLowerCase(),
            CacheControl: 'private, max-age=31536000',
            ContentDisposition: 'inline',
        }));

        // Generate signed URL (valid for 1 hour) for immediate display
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        // Store key in DynamoDB (not URL, we'll generate signed URLs on demand)
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                UserId: `USER#${user.userId}`,
                EntityType: 'PROFILE_PICTURE',
                userId: user.userId,
                pictureKey: key,
                updatedAt: new Date().toISOString(),
            },
        }));

        console.log('Profile picture uploaded successfully', { userId: user.userId, key, size: buffer.length });

        return successResponse({
            key,
            url: signedUrl, // Return signed URL for immediate display
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return errorResponse('Failed to upload profile picture', 500);
    }
}) as APIGatewayProxyHandler;

/**
 * Delete Profile Picture
 */
export const deleteProfilePicture: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (event: any, user: AuthenticatedUser) => {
    try {
        const { key } = JSON.parse(event.body || '{}');

        if (!key) {
            return errorResponse('Missing S3 key', 400);
        }

        // Validate key format (must be in profile-pictures folder)
        if (!key.startsWith('public/profile-pictures/')) {
            return errorResponse('Invalid key format', 400);
        }

        // Verify the key belongs to this user (critical security check)
        if (!key.includes(user.userId)) {
            console.warn('Unauthorized delete attempt', { userId: user.userId, key });
            return errorResponse('Unauthorized', 403);
        }

        // Delete from S3
        await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        }));

        // Delete from DynamoDB
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                UserId: `USER#${user.userId}`,
                EntityType: 'PROFILE_PICTURE',
            },
        }));

        console.log('Profile picture deleted successfully', { userId: user.userId, key });

        return successResponse({ message: 'Profile picture deleted' });
    } catch (error: any) {
        console.error('Delete error:', error);
        return errorResponse('Failed to delete profile picture', 500);
    }
}) as APIGatewayProxyHandler;

/**
 * Get Profile Picture URL
 */
export const getUrl: APIGatewayProxyHandler = compose(
    withErrorHandler,
    withAuth
)(async (_event: any, user: AuthenticatedUser) => {
    try {
        // Get profile picture key from DynamoDB
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                UserId: `USER#${user.userId}`,
                EntityType: 'PROFILE_PICTURE',
            },
        }));

        if (!result.Item || !result.Item.pictureKey) {
            return successResponse({ url: null, key: null });
        }

        // Generate signed URL (valid for 1 hour)
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: result.Item.pictureKey,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return successResponse({ 
            url: signedUrl,
            key: result.Item.pictureKey,
        });
    } catch (error: any) {
        console.error('Get URL error:', error);
        return errorResponse('Failed to get profile picture URL', 500);
    }
}) as APIGatewayProxyHandler;

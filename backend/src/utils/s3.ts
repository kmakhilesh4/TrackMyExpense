import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
});

// Bucket name from environment variable
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET_NAME || '';

/**
 * Generate presigned URL for uploading a receipt
 */
export async function generateUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
    expiresIn: number = 300 // 5 minutes
): Promise<string> {
    const key = `receipts/${userId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: RECEIPTS_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return url;
}

/**
 * Generate presigned URL for downloading a receipt
 */
export async function generateDownloadUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: RECEIPTS_BUCKET,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return url;
}

/**
 * Upload file directly to S3 (for server-side uploads)
 */
export async function uploadFile(
    key: string,
    body: Buffer,
    contentType: string
): Promise<void> {
    const command = new PutObjectCommand({
        Bucket: RECEIPTS_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    await s3Client.send(command);
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: RECEIPTS_BUCKET,
        Key: key,
    });

    await s3Client.send(command);
}

/**
 * Get S3 object key from URL
 */
export function getKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
}

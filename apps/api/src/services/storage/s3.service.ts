import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../../utils/logger';

const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET ?? 'forgeitup-generations';
const SIGNED_URL_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export const storageService = {
  /**
   * Upload a buffer to S3 and return a signed download URL.
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType = 'application/zip',
  ): Promise<string> {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      }),
    );

    logger.info({ key }, 'File uploaded to S3');

    // Return signed URL valid for 7 days
    const { url } = await this.getSignedUrl(key);
    return url;
  },

  /**
   * Get a signed download URL for an existing S3 object.
   */
  async getSignedUrl(key: string): Promise<{ url: string; expiresAt: string }> {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_EXPIRY });
    const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString();

    return { url, expiresAt };
  },

  /**
   * Delete an object from S3.
   */
  async deleteObject(key: string): Promise<void> {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    logger.info({ key }, 'File deleted from S3');
  },
};

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { config } from '@/config/env';
import https from 'https';

export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = config.minio.bucket || 'ibisapp';
    this.publicUrl = config.minio.publicUrl || 'http://localhost:9000';
    
    this.client = new S3Client({
      endpoint: config.minio.endpoint,
      region: config.minio.region || 'us-east-1',
      credentials: {
        accessKeyId: config.minio.accessKey || '',
        secretAccessKey: config.minio.secretKey || '',
      },
      forcePathStyle: true, // Required for MinIO
      requestHandler: new NodeHttpHandler({
        httpsAgent: new https.Agent({
          rejectUnauthorized: config.minio.sslVerify,
        }),
      }),
    });
  }

  async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    const buffer = await file.arrayBuffer();
    const extension = file.name.split('.').pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${extension}`;

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ACL: 'public-read', // Ensure file is publicly readable if bucket policy allows
    }));

    return `${this.publicUrl}/${this.bucket}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract key from URL
      // Expected URL format: https://.../bucket/folder/filename.ext
      const urlParts = fileUrl.split(`${this.bucket}/`);
      if (urlParts.length !== 2) return;
      
      const key = urlParts[1];

      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw, just log
    }
  }
}

export const storageService = new StorageService();

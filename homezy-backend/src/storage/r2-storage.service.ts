import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicDomain: string;

  constructor(private config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.config.get<string>('R2_BUCKET_NAME', 'homezy-uploads');
    this.publicDomain = this.config.get<string>('R2_PUBLIC_DOMAIN', 'https://uploads.homezy.in');

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('Cloudflare R2 storage client initialized successfully');
    } else {
      this.logger.warn('R2 credentials not provided in env - running in local simulation mode');
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'uploads',
  ): Promise<{ fileUrl: string; key: string }> {
    const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

    if (this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
      const fileUrl = `${this.publicDomain.replace(/\/+$/, '')}/${key}`;
      return { fileUrl, key };
    }

    const fileUrl = `https://uploads.homezy.in/${key}`;
    return { fileUrl, key };
  }

  async getPresignedUploadUrl(
    filename: string,
    mimeType: string,
    folder = 'uploads',
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimeType,
      });
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      const fileUrl = `${this.publicDomain.replace(/\/+$/, '')}/${key}`;
      return { uploadUrl, fileUrl, key };
    }

    return {
      uploadUrl: `https://mock-upload.homezy.in/${key}`,
      fileUrl: `https://uploads.homezy.in/${key}`,
      key,
    };
  }
}

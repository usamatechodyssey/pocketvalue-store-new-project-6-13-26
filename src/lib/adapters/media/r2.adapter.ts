// src/lib/adapters/media/r2.adapter.ts

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { IMediaAdapter, MediaUploadOptions, MediaUploadResult } from './types';
import { MediaProvider } from './types';

export class CloudflareR2Adapter implements IMediaAdapter {
  private client: S3Client;
  private bucket: string;
  private publicDomain: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicDomain) {
      throw new Error(
        'Missing Cloudflare R2 environment variables. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN'
      );
    }

    this.bucket = bucket;
    this.publicDomain = publicDomain;

    // ✅ S3 Client for Cloudflare R2
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Generate a unique file key (path) for R2
   */
  private generateKey(folder: string, mimeType: string): string {
    // Determine file extension
    let extension = 'webp'; // default
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
    else if (mimeType.includes('png')) extension = 'png';
    else if (mimeType.includes('gif')) extension = 'gif';
    else if (mimeType.includes('svg')) extension = 'svg';
    else if (mimeType.includes('webp')) extension = 'webp';

    const timestamp = Date.now();
    const uuid = crypto.randomUUID().slice(0, 8);
    const sanitizedFolder = folder.replace(/\s+/g, '-').toLowerCase();

    return `${sanitizedFolder}/${timestamp}-${uuid}.${extension}`;
  }

  /**
   * Upload a file from a Buffer to Cloudflare R2
   */
  async upload(buffer: Buffer, options: MediaUploadOptions): Promise<MediaUploadResult> {
    try {
      const mimeType = options.metadata?.mimeType as string || 'image/webp';
      const key = this.generateKey(options.folder, mimeType);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable', // ✅ 1 year cache
      });

      await this.client.send(command);

      const url = `${this.publicDomain}/${key}`;

      return {
        url,
        id: key, // S3 object key is the unique ID
        provider: MediaProvider.R2,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Cloudflare R2 upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Upload a file from an external URL to Cloudflare R2
   * ⚠️ WARNING: This will download the file to Vercel server memory.
   * For bulk operations (>50 files), consider using ImgBB's uploadFromUrl or a queue.
   */
  async uploadFromUrl(url: string, options: MediaUploadOptions): Promise<MediaUploadResult> {
    try {
      // 1. Download the file from the external URL
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000), // 15-second timeout to avoid hanging
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get('content-type') || 'image/webp';

      // 2. Upload the buffer to R2 using the existing upload method
      return this.upload(buffer, {
        ...options,
        metadata: { ...options.metadata, mimeType },
      });
    } catch (error) {
      console.error('R2 uploadFromUrl error:', error);
      throw new Error(`Cloudflare R2 upload from URL failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a file from Cloudflare R2 using its object key
   */
  async delete(id: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: id,
      });

      await this.client.send(command);
      console.log(`🗑️ R2: Successfully deleted image with key: ${id}`);
    } catch (error) {
      // ❌ Do not throw on delete failure — logging is sufficient
      console.error(`R2 delete failed for ${id}:`, error instanceof Error ? error.message : String(error));
    }
  }
}
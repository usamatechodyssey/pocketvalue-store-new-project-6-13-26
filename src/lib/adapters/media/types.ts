// src/lib/adapters/media/types.ts

/**
 * @description Media providers supported by the system
 */
export enum MediaProvider {
    IMGBB = 'imgbb',
    R2 = 'cloudflare-r2',
  }
  
  /**
   * @description Options for uploading a media file
   */
  export interface MediaUploadOptions {
    /** Folder path in the provider (e.g., "products", "categories", "banners") */
    folder: string;
    /** Optional: Override file name (default: auto-generated) */
    fileName?: string;
    /** Optional: Additional metadata for the provider */
    metadata?: Record<string, string | number | boolean>;
  }
  
  /**
   * @description Result of a successful upload
   */
  export interface MediaUploadResult {
    /** Publicly accessible URL of the uploaded file */
    url: string;
    /** Unique identifier for the file in the provider (used for deletion) */
    id: string;
    /** Which provider was used */
    provider: MediaProvider;
  }
  
  /**
   * @description Adapter interface for media providers (ImgBB, Cloudflare R2, etc.)
   * 
   * All adapters must implement this contract.
   * This is a backend-only interface. Frontend receives mapped data via productMapper.ts
   */
  export interface IMediaAdapter {
    /**
     * Upload a file from a Buffer
     * @param buffer - File data as Buffer
     * @param options - Upload options (folder, etc.)
     * @returns Upload result with URL and ID
     */
    upload(buffer: Buffer, options: MediaUploadOptions): Promise<MediaUploadResult>;
  
    /**
     * Upload a file from an external URL
     * @param url - External URL of the file
     * @param options - Upload options (folder, etc.)
     * @returns Upload result with URL and ID
     */
    uploadFromUrl(url: string, options: MediaUploadOptions): Promise<MediaUploadResult>;
  
    /**
     * Delete a file from the provider
     * @param id - Unique identifier of the file (returned from upload)
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: string): Promise<void>;
  }
  
  /**
   * @description Factory configuration for selecting the active provider
   * 
   * Stored in Settings collection / environment variables
   */
  export interface MediaProviderConfig {
    /** Primary provider to use for uploads */
    primary: MediaProvider;
    /** Backup provider (fallback if primary fails) */
    backup?: MediaProvider;
    /** Whether to upload to both providers simultaneously */
    dualUpload?: boolean;
  }
  
  /**
   * @description Health check result for a provider
   */
  export interface MediaProviderHealth {
    provider: MediaProvider;
    isHealthy: boolean;
    latencyMs: number;
    error?: string;
  }
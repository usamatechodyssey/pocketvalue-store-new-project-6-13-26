// // src/lib/adapters/media/imgbb.adapter.ts

// import type { IMediaAdapter, MediaUploadOptions, MediaUploadResult } from './types';
// import { MediaProvider } from './types';

// interface ImgBBUploadResponse {
//   data: {
//     id: string;
//     title: string;
//     url_viewer: string;
//     url: string;
//     display_url: string;
//     width: string;
//     height: string;
//     size: string;
//     time: string;
//     expiration: string;
//     image: {
//       filename: string;
//       name: string;
//       mime: string;
//       extension: string;
//       url: string;
//     };
//     thumb: {
//       filename: string;
//       name: string;
//       mime: string;
//       extension: string;
//       url: string;
//     };
//     medium: {
//       filename: string;
//       name: string;
//       mime: string;
//       extension: string;
//       url: string;
//     };
//     delete_url: string;
//   };
//   success: boolean;
//   status: number;
// }

// export class ImgBBAdapter implements IMediaAdapter {
//   private apiKey: string;
//   private baseUrl = 'https://api.imgbb.com/1';

//   constructor(apiKey: string) {
//     if (!apiKey) {
//       throw new Error('ImgBB API key is required. Set IMGBB_API_KEY in environment variables.');
//     }
//     this.apiKey = apiKey;
//   }

//   /**
//    * Upload a file from a Buffer
//    */
//   async upload(buffer: Buffer, options: MediaUploadOptions): Promise<MediaUploadResult> {
//     try {
//       const formData = new FormData();
      
//       // ✅ FIX: Convert Buffer to Uint8Array for BlobPart type safety
//       const uint8Array = new Uint8Array(buffer);
//       const blob = new Blob([uint8Array]);
      
//       formData.append('image', blob, options.fileName || 'upload.jpg');
//       formData.append('expiration', '0');
      
//       if (options.fileName) {
//         formData.append('name', options.fileName);
//       }

//       const response = await fetch(`${this.baseUrl}/upload?key=${this.apiKey}`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`ImgBB upload failed (${response.status}): ${errorText}`);
//       }

//       const result = (await response.json()) as ImgBBUploadResponse;

//       if (!result.success) {
//         throw new Error(`ImgBB upload failed: ${result.status || 'Unknown error'}`);
//       }

//       // ✅ Extract delete hash from delete_url
//       const deleteHash = result.data.delete_url.split('/').pop() || result.data.id;

//       return {
//         url: result.data.url,
//         id: deleteHash,
//         provider: MediaProvider.IMGBB,
//       };
//     } catch (error) {
//       console.error('ImgBB upload error:', error);
//       throw new Error(`ImgBB upload failed: ${error instanceof Error ? error.message : String(error)}`);
//     }
//   }

//   /**
//    * Upload a file from an external URL (ImgBB fetches it directly)
//    * ⚡ Vercel CPU load = 0. ImgBB handles the download.
//    */
//   async uploadFromUrl(url: string, options: MediaUploadOptions): Promise<MediaUploadResult> {
//     try {
//       const formData = new FormData();
//       formData.append('image', url);
//       formData.append('expiration', '0');
      
//       if (options.fileName) {
//         formData.append('name', options.fileName);
//       }

//       const response = await fetch(`${this.baseUrl}/upload?key=${this.apiKey}`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`ImgBB upload from URL failed (${response.status}): ${errorText}`);
//       }

//       const result = (await response.json()) as ImgBBUploadResponse;

//       if (!result.success) {
//         throw new Error(`ImgBB upload from URL failed: ${result.status || 'Unknown error'}`);
//       }

//       const deleteHash = result.data.delete_url.split('/').pop() || result.data.id;

//       return {
//         url: result.data.url,
//         id: deleteHash,
//         provider: MediaProvider.IMGBB,
//       };
//     } catch (error) {
//       console.error('ImgBB uploadFromUrl error:', error);
//       throw new Error(`ImgBB upload from URL failed: ${error instanceof Error ? error.message : String(error)}`);
//     }
//   }

//   /**
//    * Delete an image from ImgBB using the delete hash
//    */
//   async delete(id: string): Promise<void> {
//     try {
//       const response = await fetch(`${this.baseUrl}/delete/${id}?key=${this.apiKey}`, {
//         method: 'GET',
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.warn(`ImgBB delete failed (${response.status}): ${errorText}`);
//         return;
//       }

//       const result = await response.json();
      
//       if (result.success !== true) {
//         console.warn(`ImgBB delete returned success: false. Message: ${result.message || 'Unknown'}`);
//       } else {
//         console.log(`🗑️ ImgBB: Successfully deleted image with hash: ${id}`);
//       }
//     } catch (error) {
//       console.error(`ImgBB delete failed for ${id}:`, error instanceof Error ? error.message : String(error));
//     }
//   }
// }
// src/lib/adapters/media/imgbb.adapter.ts

import type { IMediaAdapter, MediaUploadOptions, MediaUploadResult } from './types';
import { MediaProvider } from './types';
import https from 'https';

// ✅ ENTERPRISE FIX: Custom HTTPS Agent with longer timeout
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  timeout: 60000, // ✅ 60 seconds
});

interface ImgBBUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export class ImgBBAdapter implements IMediaAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.imgbb.com/1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('ImgBB API key is required. Set IMGBB_API_KEY in environment variables.');
    }
    this.apiKey = apiKey;
  }

  /**
   * Upload a file from a Buffer with retry on timeout
   */
  async upload(buffer: Buffer, options: MediaUploadOptions): Promise<MediaUploadResult> {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const formData = new FormData();
        formData.append('key', this.apiKey);

        const uint8Array = new Uint8Array(buffer);
        const blob = new Blob([uint8Array], {
          type: options.metadata?.mimeType as string || 'image/jpeg',
        });

        formData.append('image', blob, options.fileName || 'upload.jpg');
        formData.append('expiration', '0');

        if (options.fileName) {
          formData.append('name', options.fileName);
        }

        // ✅ Remove AbortSignal.timeout – rely on agent timeout
        const response = await fetch(`${this.baseUrl}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive',
          },
          // @ts-ignore
          agent: httpsAgent,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`ImgBB upload failed (${response.status}): ${errorText}`);
        }

        const result = (await response.json()) as ImgBBUploadResponse;

        if (!result.success) {
          throw new Error(`ImgBB upload failed: ${result.status || 'Unknown error'}`);
        }

        const deleteHash = result.data.delete_url.split('/').pop() || result.data.id;

        return {
          url: result.data.url,
          id: deleteHash,
          provider: MediaProvider.IMGBB,
        };
      } catch (error) {
        const isTimeout = error instanceof Error &&
          (error.message.includes('timeout') || error.message.includes('aborted'));

        if (isTimeout && attempt < maxRetries) {
          console.warn(`⏳ ImgBB timeout, retrying... (attempt ${attempt + 1})`);
          attempt++;
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        throw error;
      }
    }

    throw new Error('ImgBB upload failed after retries.');
  }

  /**
   * Upload a file from an external URL
   */
  async uploadFromUrl(url: string, options: MediaUploadOptions): Promise<MediaUploadResult> {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const formData = new FormData();
        formData.append('key', this.apiKey);
        formData.append('image', url);
        formData.append('expiration', '0');

        if (options.fileName) {
          formData.append('name', options.fileName);
        }

        const response = await fetch(`${this.baseUrl}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive',
          },
          // @ts-ignore
          agent: httpsAgent,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`ImgBB upload from URL failed (${response.status}): ${errorText}`);
        }

        const result = (await response.json()) as ImgBBUploadResponse;

        if (!result.success) {
          throw new Error(`ImgBB upload from URL failed: ${result.status || 'Unknown error'}`);
        }

        const deleteHash = result.data.delete_url.split('/').pop() || result.data.id;

        return {
          url: result.data.url,
          id: deleteHash,
          provider: MediaProvider.IMGBB,
        };
      } catch (error) {
        const isTimeout = error instanceof Error &&
          (error.message.includes('timeout') || error.message.includes('aborted'));

        if (isTimeout && attempt < maxRetries) {
          console.warn(`⏳ ImgBB timeout (URL), retrying... (attempt ${attempt + 1})`);
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        throw error;
      }
    }

    throw new Error('ImgBB upload from URL failed after retries.');
  }

  /**
   * Delete an image
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/delete/${id}?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        // @ts-ignore
        agent: httpsAgent,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`ImgBB delete failed (${response.status}): ${errorText}`);
        return;
      }

      const result = await response.json();
      if (result.success !== true) {
        console.warn(`ImgBB delete failed: ${result.message || 'Unknown'}`);
      } else {
        console.log(`🗑️ ImgBB: Deleted image: ${id}`);
      }
    } catch (error) {
      console.error(`ImgBB delete failed for ${id}:`, error);
    }
  }
}
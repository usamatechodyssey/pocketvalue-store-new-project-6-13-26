
// src/lib/adapters/media/factory.ts

import type { IMediaAdapter } from './types';
import { MediaProvider } from './types';
import { ImgBBAdapter } from './imgbb.adapter';
import { CloudflareR2Adapter } from './r2.adapter';
import { getCachedSettings } from '@/app/shared/lib/cache/settings';

// ================================================================
// 🛠️ HELPER: Check if R2 environment variables are available
// ================================================================
const hasR2Env = (): boolean => {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_DOMAIN
  );
};

const hasImgBBEnv = (): boolean => {
  return !!process.env.IMGBB_API_KEY;
};

// ================================================================
// 🛠️ HELPER: Create adapter instances
// ================================================================
function createImgBBAdapter(): ImgBBAdapter | null {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ IMGBB_API_KEY not set. ImgBB adapter unavailable.');
    return null;
  }
  return new ImgBBAdapter(apiKey);
}

function createR2Adapter(): CloudflareR2Adapter | null {
  if (!hasR2Env()) {
    console.warn('⚠️ R2 environment variables missing. R2 adapter unavailable.');
    return null;
  }
  return new CloudflareR2Adapter();
}

// ================================================================
// 🧠 HELPER: Get available adapters based on provider selection
// ================================================================
function getAvailableAdaptersForProvider(
  provider: 'global' | 'imgbb' | 'r2' | 'both',
  dualUpload: boolean,
  globalPrimary: MediaProvider
): { adapters: IMediaAdapter[]; primary: IMediaAdapter | null } {
  const adapters: IMediaAdapter[] = [];
  let primaryAdapter: IMediaAdapter | null = null;

  const imgbb = createImgBBAdapter();
  const r2 = createR2Adapter();

  // Helper to add adapter and set primary if matches
  const addAdapter = (adapter: IMediaAdapter | null, providerName: MediaProvider) => {
    if (!adapter) return;
    adapters.push(adapter);
    if (globalPrimary === providerName || (!primaryAdapter && adapters.length === 1)) {
      primaryAdapter = adapter;
    }
  };

  switch (provider) {
    case 'imgbb':
      addAdapter(imgbb, MediaProvider.IMGBB);
      break;

    case 'r2':
      addAdapter(r2, MediaProvider.R2);
      break;

    case 'both':
      // If dualUpload is true, upload to both
      if (dualUpload) {
        addAdapter(imgbb, MediaProvider.IMGBB);
        addAdapter(r2, MediaProvider.R2);
      } else {
        // Fallback: use global primary
        const fallbackProvider = globalPrimary === MediaProvider.R2 ? MediaProvider.R2 : MediaProvider.IMGBB;
        const fallbackAdapter = fallbackProvider === MediaProvider.R2 ? r2 : imgbb;
        addAdapter(fallbackAdapter, fallbackProvider);
        console.warn(`⚠️ 'both' selected but dualUpload is false. Falling back to primary: ${fallbackProvider}`);
      }
      break;

    case 'global':
    default:
      // Use global settings
      if (dualUpload) {
        addAdapter(imgbb, MediaProvider.IMGBB);
        addAdapter(r2, MediaProvider.R2);
      } else {
        const primary = globalPrimary === MediaProvider.R2 ? MediaProvider.R2 : MediaProvider.IMGBB;
        const adapter = primary === MediaProvider.R2 ? r2 : imgbb;
        addAdapter(adapter, primary);
      }
      break;
  }

  // If no adapters found, throw error
  if (adapters.length === 0) {
    throw new Error('No media adapters available. Please check your environment variables.');
  }

  // If primaryAdapter is null, set it to the first available
  if (!primaryAdapter) {
    primaryAdapter = adapters[0];
  }

  return { adapters, primary: primaryAdapter };
}

// ================================================================
// 🚀 EXPORTED FUNCTIONS
// ================================================================

/**
 * @description Get media adapters for a specific product
 * @param product - Optional product document (must contain storageProvider and primaryProvider)
 * @returns Object with adapters array and primary adapter
 */
export async function getMediaAdaptersForProduct(
  product?: any
): Promise<{ adapters: IMediaAdapter[]; primary: IMediaAdapter }> {
  // 1. Get global settings
  const settings = await getCachedSettings();
  const globalPrimary = (settings?.mediaProvider as MediaProvider) || MediaProvider.IMGBB;
  const globalDualUpload = settings?.mediaDualUpload || false;

  // 2. Determine product-specific provider
  let provider: 'global' | 'imgbb' | 'r2' | 'both' = 'global';
  let primaryProvider: 'imgbb' | 'r2' = 'imgbb';

  if (product && product.storageProvider) {
    provider = product.storageProvider;
  }
  if (product && product.primaryProvider) {
    primaryProvider = product.primaryProvider;
  }

  // If provider is 'global', use global settings
  if (provider === 'global') {
    const result = getAvailableAdaptersForProvider(
      globalDualUpload ? 'both' : 'global',
      globalDualUpload,
      globalPrimary
    );
    return { adapters: result.adapters, primary: result.primary! };
  }

  // For 'imgbb', 'r2', 'both' — use product settings
  if (provider === 'both') {
    // Force dual upload regardless of global setting
    const result = getAvailableAdaptersForProvider(
      'both',
      true, // force dual
      primaryProvider === 'imgbb' ? MediaProvider.IMGBB : MediaProvider.R2
    );
    return { adapters: result.adapters, primary: result.primary! };
  }

  // Single provider (imgbb or r2)
  const result = getAvailableAdaptersForProvider(
    provider,
    false,
    provider === 'imgbb' ? MediaProvider.IMGBB : MediaProvider.R2
  );
  return { adapters: result.adapters, primary: result.primary! };
}

/**
 * @description Get all media adapters (respects global settings)
 * Used for bulk operations where product context is not available
 */
export async function getMediaAdapters(): Promise<IMediaAdapter[]> {
  const settings = await getCachedSettings();
  const globalPrimary = (settings?.mediaProvider as MediaProvider) || MediaProvider.IMGBB;
  const globalDualUpload = settings?.mediaDualUpload || false;

  const result = getAvailableAdaptersForProvider(
    globalDualUpload ? 'both' : 'global',
    globalDualUpload,
    globalPrimary
  );
  return result.adapters;
}

/**
 * @description Get single primary media adapter (respects global settings)
 * Used for delete operations or single uploads where product context is not available
 */
export async function getMediaAdapter(): Promise<IMediaAdapter> {
  const settings = await getCachedSettings();
  const globalPrimary = (settings?.mediaProvider as MediaProvider) || MediaProvider.IMGBB;
  const globalDualUpload = settings?.mediaDualUpload || false;

  const result = getAvailableAdaptersForProvider(
    globalDualUpload ? 'both' : 'global',
    globalDualUpload,
    globalPrimary
  );
  return result.primary!;
}

/**
 * @description Get primary adapter for a specific product
 * @param product - Optional product document
 * @returns Primary media adapter for upload/delete
 */
export async function getPrimaryAdapterForProduct(
  product?: any
): Promise<IMediaAdapter> {
  const result = await getMediaAdaptersForProduct(product);
  return result.primary;
}
import { fetchGlobalSettingsAction } from "@/app/features/admin/inventory-cms/actions/globalSettingsActions";
import { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

/**
 * 🔥 Shared cached settings utility
 * 
 * @description Direct wrapper around fetchGlobalSettingsAction.
 *              fetchGlobalSettingsAction already uses Redis cache with 24h TTL.
 *              This utility provides a single import point for all pages.
 *              No extra unstable_cache layer is needed (would be redundant).
 * 
 * @returns Promise<GlobalSettings>
 */
export const getCachedSettings = async (): Promise<GlobalSettings> => {
  return await fetchGlobalSettingsAction();
};
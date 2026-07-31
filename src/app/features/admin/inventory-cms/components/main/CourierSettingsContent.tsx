// src/features/admin/inventory-cms/components/main/CourierSettingsContent.tsx
"use client";

import { useState, useEffect, useTransition, memo } from 'react';
import { toast } from 'react-hot-toast';
import {
  getCourierProvidersFromMongo,
  updateCourierProvidersInMongo,
} from "@/app/features/admin/inventory-cms/actions/mongoCourierSettingsActions";
import { Loader2, Truck, CheckCircle, XCircle } from 'lucide-react';
import { ICourierProvider } from "@/models/Setting";

// ================================================================
// 📦 REUSABLE COMPONENTS (Mirroring Payment Settings)
// ================================================================

const TextInput = memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="text"
    {...props}
    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50 text-sm"
  />
));
TextInput.displayName = 'TextInput';

const FormField = memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="md:col-span-2">{children}</div>
  </div>
));
FormField.displayName = 'FormField';

// ================================================================
// 🧩 COURIER EDITOR COMPONENT
// ================================================================

const CourierEditor = memo(({
  courier,
  index,
  onCourierChange,
  isPending,
  isDefaultLocked,
}: {
  courier: ICourierProvider;
  index: number;
  onCourierChange: (index: number, field: string, value: string | boolean) => void;
  isPending: boolean;
  isDefaultLocked: boolean;
}) => {
  const safeCredentials = courier.credentials || {};
  const isManual = courier.key === 'manual';

  // Which credential fields to show for each courier
  const getCredentialFields = (key: string): { label: string; field: string; placeholder: string; type?: string }[] => {
    switch (key) {
      case 'tcs':
        return [
          { label: 'API Key', field: 'tcsApiKey', placeholder: 'Enter TCS API Key' },
          { label: 'Secret Key', field: 'tcsSecret', placeholder: 'Enter TCS Secret' },
          { label: 'Merchant ID', field: 'tcsMerchantId', placeholder: 'Enter TCS Merchant ID' },
        ];
      case 'leopards':
        return [
          { label: 'API Key', field: 'leopardsApiKey', placeholder: 'Enter Leopards API Key' },
          { label: 'Secret Key', field: 'leopardsSecret', placeholder: 'Enter Leopards Secret' },
        ];
      case 'postex':
        return [
          { label: 'API Key', field: 'postExApiKey', placeholder: 'Enter PostEx API Key' },
          { label: 'Secret Key', field: 'postExSecret', placeholder: 'Enter PostEx Secret' },
          { label: 'Merchant ID', field: 'postExMerchantId', placeholder: 'Enter PostEx Merchant ID' },
        ];
      case 'trax':
        return [
          { label: 'API Key', field: 'traxApiKey', placeholder: 'Enter Trax API Key' },
          { label: 'Secret Key', field: 'traxSecret', placeholder: 'Enter Trax Secret' },
        ];
      case 'manual':
        return [];
      default:
        return [];
    }
  };

  const credentialFields = getCredentialFields(courier.key);

  return (
    <div className="p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Truck size={18} className="text-brand-primary" />
          {courier.name}
          {courier.isDefault && (
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full font-normal flex items-center gap-1">
              <CheckCircle size={12} /> Default
            </span>
          )}
          {isManual && (
            <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full font-normal">
              Fallback
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          {!isManual && (
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                {courier.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={courier.enabled}
                  onChange={(e) => onCourierChange(index, 'enabled', e.target.checked)}
                  disabled={isPending}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </div>
            </label>
          )}
          {!isManual && !isDefaultLocked && (
            <button
              type="button"
              onClick={() => onCourierChange(index, 'isDefault', true)}
              disabled={isPending || courier.isDefault}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                courier.isDefault
                  ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
            >
              {courier.isDefault ? 'Default' : 'Set as Default'}
            </button>
          )}
          {isManual && (
            <span className="text-xs text-gray-400 italic">
              Always available as fallback
            </span>
          )}
        </div>
      </div>

      {/* Manual courier: no credentials needed */}
      {isManual && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-500" />
            Manual entry mode — Admin can manually enter tracking IDs. No API credentials required.
          </p>
        </div>
      )}

      {courier.enabled && !isManual && credentialFields.length > 0 && (
        <div className="mt-4 space-y-3 pl-0 sm:pl-8">
          {credentialFields.map(({ label, field, placeholder }) => {
            const value = safeCredentials[field] || '';
            return (
              <FormField key={field} label={label}>
                <TextInput
                  type="text"
                  value={value as string}
                  onChange={(e) =>
                    onCourierChange(index, `credentials.${field}`, e.target.value)
                  }
                  placeholder={placeholder}
                  disabled={isPending}
                />
              </FormField>
            );
          })}
        </div>
      )}

      {courier.enabled && !isManual && credentialFields.length === 0 && (
        <div className="mt-2 text-sm text-gray-500 italic">
          No additional credentials required for this courier.
        </div>
      )}
    </div>
  );
});
CourierEditor.displayName = 'CourierEditor';

// ================================================================
// 🏠 MAIN COMPONENT
// ================================================================

export default function CourierSettingsContent() {
  const [couriers, setCouriers] = useState<ICourierProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial data
  useEffect(() => {
    const fetchCouriers = async () => {
      setIsLoading(true);
      try {
        const data = await getCourierProvidersFromMongo();
        setCouriers(data);
      } catch (error) {
        console.error('Failed to fetch courier settings:', error);
        toast.error('Failed to load courier settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCouriers();
  }, []);

  const handleCourierChange = (index: number, field: string, value: string | boolean) => {
    setCouriers((prev) => {
      const updated = [...prev];
      const courierToUpdate = { ...updated[index] };

      // If setting as default, unset others
      if (field === 'isDefault' && value === true) {
        updated.forEach((c, i) => {
          if (i !== index) {
            updated[i] = { ...updated[i], isDefault: false };
          }
        });
      }

      const path = field.split('.');

      if (path.length > 1) {
        if (!courierToUpdate.credentials) {
          courierToUpdate.credentials = {};
        }
        (courierToUpdate.credentials as any)[path[1]] = value;
      } else {
        (courierToUpdate as any)[path[0]] = value;
      }

      updated[index] = courierToUpdate;
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const loadingToast = toast.loading("Saving courier settings...");

      try {
        const result = await updateCourierProvidersInMongo(couriers);

        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success(result.message);
          setHasChanges(false);
          // Refresh data to reflect changes
          const freshData = await getCourierProvidersFromMongo();
          setCouriers(freshData);
        } else {
          toast.error(result.message || "An unknown error occurred while saving.");
        }
      } catch (error: any) {
        toast.dismiss(loadingToast);
        toast.error(error.message || "Failed to save courier settings.");
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const freshData = await getCourierProvidersFromMongo();
      setCouriers(freshData);
      setHasChanges(false);
      toast.success("Settings reset to last saved state.");
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Check if manual is the only enabled courier
  const enabledCouriers = couriers.filter((c) => c.enabled === true);
  const isDefaultLocked = enabledCouriers.length === 1 && enabledCouriers[0]?.key === 'manual';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Truck size={22} className="text-brand-primary" />
            Courier Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure your courier providers, API credentials, and set a default courier.
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Manual Entry is always available as a fallback option.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={isPending || !hasChanges}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[120px]"
          >
            {isPending && <Loader2 className="animate-spin" size={18} />}
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {couriers.length === 0 ? (
            <div className="text-center p-8 text-gray-500 italic">
              No courier providers configured. Please add some to your database.
            </div>
          ) : (
            couriers.map((courier, index) => (
              <CourierEditor
                key={courier.key}
                courier={courier}
                index={index}
                onCourierChange={handleCourierChange}
                isPending={isPending}
                isDefaultLocked={isDefaultLocked}
              />
            ))
          )}
        </div>

        {/* Status Summary */}
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Status Summary:
            </span>
            {couriers.map((c) => (
              <span
                key={c.key}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  c.enabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {c.enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {c.name}
                {c.isDefault && (
                  <span className="ml-0.5 text-[10px] font-bold text-brand-primary">(Default)</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 💀 LOADING SKELETON
// ================================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border-b dark:border-gray-700 last:border-b-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="mt-4 space-y-3 pl-0 sm:pl-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="md:col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="md:col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
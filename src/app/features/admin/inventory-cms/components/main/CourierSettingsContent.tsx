// 📂 src/app/features/admin/inventory-cms/components/main/CourierSettingsContent.tsx (CYBER-HUD HARDENED)

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
// 📦 REUSABLE COMPONENTS (Cyber-HUD Standard)
// ================================================================

const TextInput = memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="text"
    {...props}
    className="w-full p-2.5 text-xs font-semibold font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all disabled:opacity-50"
  />
));
TextInput.displayName = 'TextInput';

const FormField = memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">{label}</label>
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
    <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 last:border-b-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-150 flex items-center gap-2 font-mono">
          <Truck size={16} className="text-brand-primary" />
          {courier.name}
          {courier.isDefault && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={10} /> Default
            </span>
          )}
          {isManual && (
            <span className="text-[9px] bg-zinc-100 text-zinc-500 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Fallback
            </span>
          )}
        </h3>
        
        <div className="flex items-center gap-3 flex-wrap">
          {!isManual && (
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
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
                <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-zinc-300 dark:after:border-zinc-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </div>
            </label>
          )}
          {!isManual && !isDefaultLocked && (
            <button
              type="button"
              onClick={() => onCourierChange(index, 'isDefault', true)}
              disabled={isPending || courier.isDefault}
              className={`text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full transition-colors cursor-pointer ${
                courier.isDefault
                  ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed border border-zinc-250 dark:border-zinc-800'
                  : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-500/20'
              }`}
            >
              {courier.isDefault ? 'Default' : 'Set as Default'}
            </button>
          )}
          {isManual && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">
              Always available as fallback
            </span>
          )}
        </div>
      </div>

      {/* Manual courier fallback info */}
      {isManual && (
        <div className="mt-2 p-3 bg-blue-500/10 dark:bg-blue-950/20 rounded-xl border border-blue-500/20">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-mono leading-relaxed flex items-center gap-2">
            <CheckCircle size={14} className="text-blue-500 shrink-0" />
            Manual entry mode — Admin can manually enter tracking IDs. No API credentials required.
          </p>
        </div>
      )}

      {courier.enabled && !isManual && credentialFields.length > 0 && (
        <div className="mt-4 space-y-3 pl-0 sm:pl-8 border-l border-zinc-100 dark:border-zinc-850">
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
        <div className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 italic font-mono">
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

  const enabledCouriers = couriers.filter((c) => c.enabled === true);
  const isDefaultLocked = enabledCouriers.length === 1 && enabledCouriers[0]?.key === 'manual';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 leading-none">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider font-mono flex items-center gap-2">
            <Truck size={16} className="text-brand-primary" />
            Courier Settings
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Configure your courier providers, API credentials, and set a default courier.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase font-mono tracking-wider animate-pulse">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={isPending || !hasChanges}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs shadow-brand-primary/10 hover:bg-brand-primary/95 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-30 cursor-pointer"
          >
            {isPending && <Loader2 className="animate-spin" size={14} />}
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
          {couriers.length === 0 ? (
            <div className="text-center p-8 text-xs text-zinc-500 font-mono italic">
              No courier providers configured. Please seed some to your database.
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
        <div className="mt-6 pt-4 border-t border-zinc-150 dark:border-zinc-850">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
              Status Summary:
            </span>
            {couriers.map((c) => (
              <span
                key={c.key}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  c.enabled
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {c.enabled ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {c.name}
                {c.isDefault && (
                  <span className="ml-0.5 text-[9px] font-black text-brand-primary">(Default)</span>
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
          <div className="h-6 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border-b border-zinc-150 dark:border-zinc-850 last:border-b-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            </div>
            <div className="mt-4 space-y-3 pl-0 sm:pl-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <div className="h-4 w-20 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                <div className="md:col-span-2 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                <div className="md:col-span-2 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
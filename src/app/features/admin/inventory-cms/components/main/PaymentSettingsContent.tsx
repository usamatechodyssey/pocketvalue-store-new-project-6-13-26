// src/app/components/admin/PaymentSettingsContent.tsx
"use client";

import { useState, useEffect, useTransition, memo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getPaymentGatewaysFromMongo, 
  updatePaymentGatewaysInMongo 
} from "@/app/features/admin/inventory-cms/actions/mongoPaymentSettingsActions"; // ✅ New Server Actions
import { Loader2 } from 'lucide-react';
import { IGateway } from "@/models/Setting"; // ✅ Importing the IGateway interface for type safety
// --- Reusable, Memoized Input Component ---
const TextInput = memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      type="text"
      {...props}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
    />
));
TextInput.displayName = 'TextInput';

// --- Reusable FormField Layout Component ---
const FormField = memo(({ label, children }: {label:string, children:React.ReactNode}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
));
FormField.displayName = 'FormField';

// --- Memoized Child Component for a single Gateway ---
const GatewayEditor = memo(({ gateway, index, onGatewayChange, isPending }: {
  gateway: IGateway;
  index: number;
  onGatewayChange: (index: number, field: string, value: string | boolean) => void;
  isPending: boolean;
}) => {
  
  const safeCredentials = gateway.credentials || {};
  const hasCredentials = Object.keys(safeCredentials).length > 0;

  return (
    <div className="p-4 border-b dark:border-gray-700 last:border-b-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{gateway.name}</h3>
        <label className="flex items-center cursor-pointer">
          <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">{gateway.enabled ? 'Enabled' : 'Disabled'}</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={gateway.enabled}
              onChange={e => onGatewayChange(index, 'enabled', e.target.checked)}
              disabled={isPending}
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </div>
        </label>
      </div>

      {gateway.enabled && (
        <div className="space-y-3">
          {hasCredentials ? (
            Object.entries(safeCredentials).map(([key, value]) => (
              <FormField key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>
                <TextInput
                  value={value as string}
                  onChange={(e) => onGatewayChange(index, `credentials.${key}`, e.target.value)}
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`}
                  disabled={isPending}
                />
              </FormField>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              No additional settings required for this payment method.
            </p>
          )}
        </div>
      )}
    </div>
  );
});
GatewayEditor.displayName = 'GatewayEditor';

// === Main Component ===
export default function PaymentSettingsContent() {
  const [paymentGateways, setPaymentGateways] = useState<IGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load initial data
  useEffect(() => {
    const fetchGateways = async () => {
      setIsLoading(true);
      const gateways = await getPaymentGatewaysFromMongo();
      setPaymentGateways(gateways);
      setIsLoading(false);
    };
    fetchGateways();
  }, []); // Empty dependency array means run once on mount

  const handleGatewayChange = (index: number, field: string, value: string | boolean) => {
    setPaymentGateways(prevGateways => {
        const updatedGateways = [...prevGateways];
        const gatewayToUpdate = { ...updatedGateways[index] };
        
        // Ensure credentials object exists before updating
        if (!gatewayToUpdate.credentials) {
            gatewayToUpdate.credentials = {};
        }

        const path = field.split('.');

        if (path.length > 1) { // Updating a nested credential field
            // Type assertion for nested object
            (gatewayToUpdate.credentials as any)[path[1]] = value;
        } else { // Updating a top-level field like 'enabled'
            (gatewayToUpdate as any)[path[0]] = value;
        }
        updatedGateways[index] = gatewayToUpdate;
        return updatedGateways;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      toast.loading("Saving payment gateway settings...");
      const result = await updatePaymentGatewaysInMongo(paymentGateways);
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "An unknown error occurred while saving.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
            <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Payment Gateway Settings</h2>
      <p className="text-sm text-gray-500 mt-1">Configure your online payment methods and their credentials.</p>
      
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paymentGateways.length === 0 ? (
            <div className="text-center p-8 text-gray-500 italic">
              No payment gateways configured. Please add some to your MongoDB.
            </div>
          ) : (
            paymentGateways.map((gw, index) => (
              <GatewayEditor
                key={gw.key}
                gateway={gw}
                index={index}
                onGatewayChange={handleGatewayChange}
                isPending={isPending}
              />
            ))
          )}
        </div>
        
        <div className="flex justify-end pt-6 border-t dark:border-gray-700 mt-8">
            <button onClick={handleSave} disabled={isPending} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {isPending && <Loader2 className="animate-spin" size={20}/>}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}
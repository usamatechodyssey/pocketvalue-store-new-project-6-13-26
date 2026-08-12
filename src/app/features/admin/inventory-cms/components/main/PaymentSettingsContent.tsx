// 📂 src/features/admin/inventory-cms/components/main/PaymentSettingsContent.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useEffect, useTransition, memo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getPaymentGatewaysFromMongo, 
  updatePaymentGatewaysInMongo 
} from "@/app/features/admin/inventory-cms/actions/mongoPaymentSettingsActions"; 
import { Loader2, Landmark } from 'lucide-react';
import { IGateway } from "@/models/Setting"; 

// --- Reusable, Memoized Input Component (Cyber-HUD Standard) ---
const TextInput = memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      type="text"
      {...props}
      className="w-full p-2.5 text-xs font-semibold font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all disabled:opacity-50"
    />
));
TextInput.displayName = 'TextInput';

// --- Reusable FormField Layout Component ---
const FormField = memo(({ label, children }: {label:string, children:React.ReactNode}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center font-sans">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">{label}</label>
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
    <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 last:border-b-0 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-100 font-mono">{gateway.name}</h3>
        <label className="flex items-center cursor-pointer">
          <span className="mr-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
            {gateway.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={gateway.enabled}
              onChange={e => onGatewayChange(index, 'enabled', e.target.checked)}
              disabled={isPending}
            />
            <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-zinc-300 dark:after:border-zinc-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </div>
        </label>
      </div>

      {gateway.enabled && (
        <div className="space-y-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
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
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono italic">
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
  }, []);

  const handleGatewayChange = (index: number, field: string, value: string | boolean) => {
    setPaymentGateways(prevGateways => {
        const updatedGateways = [...prevGateways];
        const gatewayToUpdate = { ...updatedGateways[index] };
        
        if (!gatewayToUpdate.credentials) {
            gatewayToUpdate.credentials = {};
        }

        const path = field.split('.');

        if (path.length > 1) { 
            (gatewayToUpdate.credentials as any)[path[1]] = value;
        } else { 
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
        <div className="h-6 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
            <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
            <div className="h-4 w-1/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="h-4 w-20 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                <div className="col-span-2 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                <div className="col-span-2 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
            <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 animate-in fade-in duration-300'>
      <div className="space-y-1 pb-4 border-b border-zinc-150 dark:border-zinc-850">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider font-mono flex items-center gap-2">
          <Landmark size={16} className="text-brand-primary" /> Payment Gateway Settings
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Configure your online payment methods and their secure credentials.</p>
      </div>
      
      <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
          {paymentGateways.length === 0 ? (
            <div className="text-center p-8 text-xs text-zinc-500 font-mono italic">
              No payment gateways configured. Please seed some to your MongoDB settings collection.
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
        
        <div className="flex justify-end pt-6 border-t border-zinc-150 dark:border-zinc-850 mt-8">
            <button 
              onClick={handleSave} 
              disabled={isPending} 
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10"
            >
              {isPending && <Loader2 className="animate-spin" size={14}/>}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}
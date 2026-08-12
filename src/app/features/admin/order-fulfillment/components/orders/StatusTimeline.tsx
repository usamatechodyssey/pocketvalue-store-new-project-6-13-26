// 📂 src/app/features/admin/order-fulfillment/components/orders/StatusTimeline.tsx (CYBER-HUD HARDENED)

"use client";

import { Check, XCircle } from 'lucide-react';
import { 
  ADMIN_TIMELINE_STEPS, 
  getAdminTimelineStep, 
  isAdminTerminalStatus 
} from '@/app/shared/utils/adminOrderDisplayUtils';

interface StatusTimelineProps {
  status: string;
}

export default function StatusTimeline({ status }: StatusTimelineProps) {
  // ✅ Check if terminal status
  if (isAdminTerminalStatus(status)) {
    let icon = XCircle;
    let bgColor = 'bg-red-500/10 dark:bg-red-950/20';
    let textColor = 'text-red-700 dark:text-red-400';
    let borderColor = 'border-red-200 dark:border-red-900/30';
    let label = status;

    if (status === 'Completed') {
      icon = Check;
      bgColor = 'bg-emerald-500/10 dark:bg-emerald-950/20';
      textColor = 'text-emerald-700 dark:text-emerald-400';
      borderColor = 'border-emerald-200 dark:border-emerald-900/30';
    }

    const IconComponent = icon;
    return (
      <div className={`p-4 ${bgColor} ${textColor} border ${borderColor} rounded-2xl flex items-center justify-center gap-3 font-mono font-bold text-xs uppercase tracking-wider`}>
        <IconComponent size={18} className="stroke-[2.5px]" /> Order is {label}
      </div>
    );
  }

  // ✅ Get timeline step for this status
  const { step, index: currentStepIndex } = getAdminTimelineStep(status);
  const totalSteps = ADMIN_TIMELINE_STEPS.length;

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-4 h-0.5 w-full bg-zinc-200 dark:bg-zinc-800 z-0">
          {/* Progress Bar Fill */}
          <div 
            className="h-full bg-brand-primary transition-all duration-500" 
            style={{ 
              width: currentStepIndex >= 0 ? `${Math.max(0, (currentStepIndex / (totalSteps - 1)) * 100)}%` : '0%' 
            }} 
          />
        </div>
        
        {/* Timeline Steps */}
        {ADMIN_TIMELINE_STEPS.map((s, index) => {
          const isActive = currentStepIndex >= index && currentStepIndex !== -1;
          const IconComponent = s.icon;
          return (
            <div key={s.name} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive 
                  ? 'bg-brand-primary border-brand-primary text-white shadow-xs' 
                  : 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-400'
              }`}>
                {isActive ? <Check size={16} className="stroke-[2.5px]" /> : <IconComponent size={14} />}
              </div>
              <span className={`mt-2 text-[9px] font-bold font-mono uppercase tracking-wider ${
                isActive ? 'text-brand-primary' : 'text-zinc-400 dark:text-zinc-600'
              }`}>
                {s.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
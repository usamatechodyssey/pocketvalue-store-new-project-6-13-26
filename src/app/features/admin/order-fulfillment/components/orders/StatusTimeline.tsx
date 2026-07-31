"use client";

import { Check,  XCircle } from 'lucide-react';
// ✅ Import from centralized utility
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
    let bgColor = 'bg-red-50 dark:bg-red-900/20';
    let textColor = 'text-red-700 dark:text-red-300';
    let borderColor = 'border-red-100 dark:border-red-800';
    let label = status;

    if (status === 'Completed') {
      icon = Check;
      bgColor = 'bg-green-50 dark:bg-green-900/20';
      textColor = 'text-green-700 dark:text-green-300';
      borderColor = 'border-green-100 dark:border-green-800';
    }

    const IconComponent = icon;
    return (
      <div className={`p-4 ${bgColor} ${textColor} border ${borderColor} rounded-lg flex items-center justify-center gap-3 font-bold text-sm`}>
        <IconComponent size={20} /> Order is <span className="uppercase">{label}</span>
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
        <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200 dark:bg-gray-700 z-0">
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
                  ? 'bg-brand-primary border-brand-primary text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {isActive ? <Check size={18} /> : <IconComponent size={16} />}
              </div>
              <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                isActive ? 'text-brand-primary' : 'text-gray-400'
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
"use client";

import { Check } from "lucide-react";
import { memo, useId } from "react";

interface CheckboxRowProps {
    label: string;
    checked: boolean;
    onChange: () => void;
}

// === MEMOIZED FOR PERFORMANCE ===
const FilterCheckboxRow = memo(function CheckboxRow({ 
    label, 
    checked, 
    onChange 
}: CheckboxRowProps) {
    // ✅ FIX: Generate unique ID for accessibility
    const id = useId();

    return (
        <label 
            htmlFor={id} // ✅ Explicit association
            className="flex items-center gap-3 cursor-pointer group py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 
                ${checked 
                    ? "bg-brand-primary border-brand-primary shadow-sm" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-brand-primary"
                }`}
            >
                {checked && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
            <input 
                id={id} // ✅ Unique ID for screen readers
                type="checkbox" 
                checked={checked} 
                onChange={onChange} 
                className="hidden" 
            />
            <span className={`text-sm transition-colors ${checked ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                {label}
            </span>
        </label>
    );
});

export default FilterCheckboxRow;
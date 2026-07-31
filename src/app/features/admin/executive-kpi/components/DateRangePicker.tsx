"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  format, subDays, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameDay, isWithinInterval, 
  addMonths, subMonths, parseISO, startOfYear 
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Check, Clock, Filter } from 'lucide-react';

// ✅ ENTERPRISE FIX: DYNAMIC PRESETS (Koi hardcoded date nahi, sab runtime calculate hote hain)
const PRESET_RANGES = [
  { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ start: subDays(new Date(), 1), end: subDays(new Date(), 1) }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'Year to Date', getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
];

export default function AnalyticsDateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);

  // --- STATE CONTROLLERS (100% Dynamic — No static seed) ---
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState('Today');
  
  // ✅ FIX: Start with null, real value set in useEffect (Client-side only)
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const [tempEnd, setTempEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isCompare, setIsCompare] = useState(false);

  // --- HYDRATION & DYNAMIC INITIALIZATION ---
  useEffect(() => {
    setMounted(true);

    const startStr = searchParams.get('startDate');
    const endStr = searchParams.get('endDate');
    const compareStr = searchParams.get('compare');
    const labelStr = searchParams.get('rangeLabel');

    // ✅ FULLY DYNAMIC: Agar URL mein nahi hai toh CURRENT DATE use karein
    const localStart = startStr ? parseISO(startStr) : new Date();
    const localEnd = endStr ? parseISO(endStr) : new Date();

    setTempStart(localStart);
    setTempEnd(localEnd);
    setCurrentMonth(startOfMonth(localStart));
    setIsCompare(compareStr === 'true');

    if (labelStr) {
      setActiveLabel(labelStr);
    } else if (startStr && endStr) {
      setActiveLabel('Custom');
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchParams]);

  // --- RENDERING SKELETON PLACEHOLDER DURING SSR ---
  if (!mounted || !tempStart || !tempEnd || !currentMonth) {
    return (
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm opacity-60 animate-pulse">
        <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary">
          <Calendar size={16} strokeWidth={2.5}/>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Timeframe</p>
          <p className="text-xs font-bold dark:text-white leading-none">Loading...</p>
        </div>
      </div>
    );
  }

  // --- CALENDAR DATA COMPILERS (Client Side Only) ---
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startDayOfWeek = startOfMonth(currentMonth).getDay();

  const paddingDays: Date[] = [];
  const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    paddingDays.push(subDays(prevMonthEnd, i));
  }

  const handleDayClick = (day: Date) => {
    if (isSameDay(tempStart, tempEnd)) {
      setTempStart(day);
      setTempEnd(day);
    } else if (day < tempStart) {
      setTempStart(day);
    } else {
      setTempEnd(day);
      setActiveLabel('Custom');
    }
  };

  const handlePresetSelect = (label: string, start: Date, end: Date) => {
    setTempStart(start);
    setTempEnd(end);
    setActiveLabel(label);
    setCurrentMonth(startOfMonth(start));
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', format(tempStart, 'yyyy-MM-dd'));
    params.set('endDate', format(tempEnd, 'yyyy-MM-dd'));
    params.set('compare', String(isCompare));
    params.set('rangeLabel', activeLabel);
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const isSelected = (day: Date) => isSameDay(day, tempStart) || isSameDay(day, tempEnd);
  const isInRange = (day: Date) => {
    if (isSameDay(tempStart, tempEnd)) return false;
    return isWithinInterval(day, { start: tempStart, end: tempEnd });
  };

  return (
    <div className="relative" ref={modalRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:scale-110 transition-transform">
          <Calendar size={16} strokeWidth={2.5}/>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Timeframe</p>
          <p className="text-xs font-bold dark:text-white leading-none">
            {activeLabel} {isCompare && <span className="text-[9px] text-green-500 font-black ml-1">COMPARE</span>}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-150 max-w-[95vw] bg-white dark:bg-[#070708] border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-2xl z-9999 grid grid-cols-12 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* PRESETS */}
          <div className="col-span-4 border-r dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <Clock size={12} className="text-brand-primary" /> Presets
            </div>
            {PRESET_RANGES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const { start, end } = preset.getValue();
                  handlePresetSelect(preset.label, start, end);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group/btn ${
                  activeLabel === preset.label 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {preset.label}
                {activeLabel === preset.label && <Check size={12} />}
              </button>
            ))}
          </div>

          {/* CALENDAR */}
          <div className="col-span-8 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black dark:text-white uppercase tracking-wider">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center flex-1">
              {paddingDays.map((day, i) => (
                <div key={`pad-${i}`} className="p-2 text-xs text-zinc-300 dark:text-zinc-700 font-medium opacity-30">
                  {format(day, 'd')}
                </div>
              ))}
              {daysInMonth.map((day) => {
                const selected = isSelected(day);
                const ranged = isInRange(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`p-2 text-xs font-bold rounded-lg transition-all relative ${
                      selected 
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105 z-10' 
                        : ranged 
                          ? 'bg-brand-primary/10 text-brand-primary rounded-none' 
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-zinc-800 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isCompare}
                  onChange={(e) => setIsCompare(e.target.checked)}
                  className="h-4 w-4 rounded-md border-zinc-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Compare Period</span>
              </label>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  className="px-6 py-2 bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-all"
                >
                  Apply
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
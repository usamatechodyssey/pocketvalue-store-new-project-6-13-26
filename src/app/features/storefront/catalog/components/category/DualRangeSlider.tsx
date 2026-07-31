
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PriceRangeProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: string, max: string) => void;
}

export default function DualRangeSlider({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
}: PriceRangeProps) {
  const [minVal, setMinVal] = useState(currentMin);
  const [maxVal, setMaxVal] = useState(currentMax);
  const minValRef = useRef(currentMin);
  const maxValRef = useRef(currentMax);
  const range = useRef<HTMLDivElement>(null);

  // ✅ FIX: Guard against division by zero
  const rangeDiff = max - min;
  const getPercent = useCallback(
    (value: number) => {
      if (rangeDiff === 0) return 50; // Fallback if min === max
      return Math.round(((value - min) / rangeDiff) * 100);
    },
    [min, max, rangeDiff]
  );

  // ✅ FIX: Clamp helper
  const clamp = (value: number, minVal: number, maxVal: number) =>
    Math.min(Math.max(value, minVal), maxVal);

  // Sync state whenever props change (Crucial for reset functionality)
  useEffect(() => {
    setMinVal(currentMin);
    minValRef.current = currentMin;
    setMaxVal(currentMax);
    maxValRef.current = currentMax;
  }, [currentMin, currentMax]);

  // Update visual bar (when min changes)
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Update visual bar (when max changes)
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // ✅ FIX: Centralized change handler to avoid duplication
  const handleChange = useCallback(() => {
    const clampedMin = clamp(minVal, min, max - 1);
    const clampedMax = clamp(maxVal, min + 1, max);
    onChange(clampedMin.toString(), clampedMax.toString());
  }, [minVal, maxVal, min, max, onChange]);

  return (
    <div className="pt-6 pb-2 px-2">
      <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
        <div
          ref={range}
          className="absolute h-1 bg-brand-primary rounded-full z-10"
        />

        {/* ✅ FIX 1: Dynamic aria-valuemin/max for accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={maxVal - 1} // ✅ Dynamic max for min thumb
          aria-valuenow={minVal}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
            minValRef.current = value;
          }}
          onMouseUp={handleChange}
          onTouchEnd={handleChange}
          className="thumb thumb--left"
          style={{ zIndex: minVal > max - 100 ? "5" : "3" }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          aria-label="Maximum price"
          aria-valuemin={minVal + 1} // ✅ Dynamic min for max thumb
          aria-valuemax={max}
          aria-valuenow={maxVal}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
            maxValRef.current = value;
          }}
          onMouseUp={handleChange}
          onTouchEnd={handleChange}
          className="thumb thumb--right"
          style={{ zIndex: "4" }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="grow">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Min
          </span>
          <div className="relative mt-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              Rs:
            </span>
            <input
              type="number"
              value={minVal}
              aria-label="Minimum price input"
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) {
                  const clamped = clamp(val, min, max - 1);
                  setMinVal(clamped);
                  minValRef.current = clamped;
                }
              }}
              onBlur={handleChange}
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>
        <div className="grow">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Max
          </span>
          <div className="relative mt-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              Rs:
            </span>
            <input
              type="number"
              value={maxVal}
              aria-label="Maximum price input"
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) {
                  const clamped = clamp(val, min + 1, max);
                  setMaxVal(clamped);
                  maxValRef.current = clamped;
                }
              }}
              onBlur={handleChange}
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ✅ FIX: Added accessibility note for screen readers */}
      <p className="sr-only" role="status" aria-live="polite">
        Price range selected: Rs. {minVal} to Rs. {maxVal}
      </p>

      {/* ✅ FIX 2: CSS variable instead of hardcoded color */}
      <style jsx global>{`
        .thumb {
          -webkit-appearance: none;
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
        }
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: white;
          border: 2px solid var(--brand-primary, #ff8f32);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          margin-top: 1px;
        }
        .thumb::-moz-range-thumb {
          pointer-events: all;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: white;
          border: 2px solid var(--brand-primary, #ff8f32);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
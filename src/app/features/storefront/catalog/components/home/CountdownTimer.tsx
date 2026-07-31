
"use client";

import { useState, useEffect } from "react";

const calculateTimeLeft = (endDate: string) => {
  const difference = new Date(endDate).getTime() - new Date().getTime();

  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, "0"),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, "0"),
      minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, "0"),
      seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, "0"),
    };
  }
  return { days: "00", hours: "00", minutes: "00", seconds: "00" };
};

// 🔥 FIX: Fixed Width & Height for boxes to prevent layout shift (Jitter)
const TimeBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="relative flex items-center justify-center 
      bg-gray-50 text-gray-900 border border-gray-200 
      dark:bg-white/10 dark:text-white dark:border-white/10 dark:backdrop-blur-md
      rounded-lg shadow-sm
      w-16 h-8 md:w-11 md:h-6 lg:w-18" 
    >
      {/* tabular-nums ensures numbers like '1' and '0' take same space */}
      <span className="text-sm md:text-lg font-bold font-mono leading-none tabular-nums">
        {value}
      </span>
    </div>

    <span className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">
      {label}
    </span>
  </div>
);

export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: "00", hours: "00", minutes: "00", seconds: "00",
  });

  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, [endDate]);

  return (
    <div className="flex items-start gap-1.5 md:gap-2">
      <TimeBox value={timeLeft.days} label="Days" />
      <span className="text-gray-400 dark:text-gray-600 font-bold mt-2 text-xs md:text-sm">:</span>
      <TimeBox value={timeLeft.hours} label="Hrs" />
      <span className="text-gray-400 dark:text-gray-600 font-bold mt-2 text-xs md:text-sm">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" />
      <span className="text-gray-400 dark:text-gray-600 font-bold mt-2 text-xs md:text-sm">:</span>
      <TimeBox value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
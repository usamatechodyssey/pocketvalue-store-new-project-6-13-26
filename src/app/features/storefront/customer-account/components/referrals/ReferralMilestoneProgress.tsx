"use client";

import React from "react";
import { Award, Trophy } from "lucide-react";

// ✅ ENTERPRISE TYPES: Strict & Flexible
interface Milestone {
  requiredConversions?: number;
  requiredSpend?: number;
  rewardLabel: string;
}

interface ReferralMilestoneProgressProps {
  conversions: number; // Raw metric value (referred purchases or lifetime spend total)
  milestones: Milestone[];
  type: "referral" | "vip"; // Switch to resolve target variables
}

export default function ReferralMilestoneProgress({
  conversions,
  milestones,
  type,
}: ReferralMilestoneProgressProps) {
  
  // 🛡️ 1. SAFETY CHECK: If milestones array is empty, show a clean placeholder
  const sortedMilestones = [...milestones]
    .map((m) => {
      const target = type === "referral" ? m.requiredConversions || 0 : m.requiredConversions || 0;
      return { ...m, target };
    })
    .sort((a, b) => a.target - b.target)
    .filter((m) => m.target > 0); // ✅ Remove zero-target milestones

  // 2. If no valid milestones exist, render a graceful empty state
  if (sortedMilestones.length === 0) {
    return (
      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700/30 rounded-xl">
        <div className="flex justify-between items-center text-xs mb-3">
          <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            {type === "referral" ? <Award size={14} className="text-brand-primary" /> : <Trophy size={14} className="text-amber-500" />}
            No tiers configured yet.
          </span>
        </div>
        {/* Static dashed placeholder for visual consistency */}
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gray-300 dark:bg-gray-600 rounded-full w-0" />
        </div>
        <p className="text-[10px] text-gray-400 italic mt-2">
          {type === "referral" ? "Admin has not set up referral milestones." : "Admin has not set up VIP shopping tiers."}
        </p>
      </div>
    );
  }

  // 3. Locate the upcoming next milestone
  const nextMilestone = sortedMilestones.find((m) => conversions < m.target);
  const lastUnlockedMilestone = [...sortedMilestones]
    .reverse()
    .find((m) => conversions >= m.target);

  let progressPercent = 0;
  let progressText = "";
  let nextMilestoneLabel = "";

  if (nextMilestone) {
    const prevTarget = lastUnlockedMilestone ? lastUnlockedMilestone.target : 0;
    const nextTarget = nextMilestone.target;
    const range = nextTarget - prevTarget;

    // ✅ ENTERPRISE FIX: Zero-division guard
    if (range > 0) {
      const currentProgressInRange = conversions - prevTarget;
      progressPercent = Math.min(100, Math.max(0, (currentProgressInRange / range) * 100));
    } else {
      progressPercent = 0;
    }

    // Dynamic label formatting
    const label = nextMilestone.rewardLabel || `Milestone at ${nextTarget}`;
    if (type === "referral") {
      progressText = `${conversions} / ${nextTarget} purchases`;
      nextMilestoneLabel = `Next Milestone: ${label}`;
    } else {
      progressText = `Rs. ${conversions.toLocaleString()} / Rs. ${nextTarget.toLocaleString()}`;
      nextMilestoneLabel = `Next VIP Tier: ${label}`;
    }
  } else if (sortedMilestones.length > 0) {
    // All milestones unlocked
    progressPercent = 100;
    progressText = type === "referral" ? "All Milestones Unlocked! 🎉" : "Ultimate VIP Club Achieved! 🏆";
    const lastMilestone = sortedMilestones[sortedMilestones.length - 1];
    nextMilestoneLabel = lastMilestone?.rewardLabel 
      ? `${lastMilestone.rewardLabel} (Achieved!)` 
      : (type === "referral" ? "Ultimate Loyalty Level" : "Maximum VIP Club Standing");
  }

  return (
    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700/30 rounded-xl space-y-4">
      
      {/* 1. TOP HEADER INFOBAR */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          {type === "referral" ? (
            <Award size={14} className="text-brand-primary" />
          ) : (
            <Trophy size={14} className="text-amber-500 animate-pulse" />
          )}
          {nextMilestoneLabel || "Track your progress"}
        </span>
        <span className="font-mono font-bold text-gray-500 text-[11px]">{progressText}</span>
      </div>

      {/* 2. 🎮 APP-STYLE STEPPER NODES GAME-MAP */}
      <div className="relative flex justify-between items-center py-2 px-1 max-w-full overflow-hidden select-none">
        
        {/* Connector Track Line (Backdrop) */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[3px] bg-gray-100 dark:bg-gray-750 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-primary to-brand-primary-hover rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stepper Level Nodes Mapping */}
        {sortedMilestones.map((m, idx) => {
          const target = m.target;
          const isUnlocked = conversions >= target;
          const isActive = nextMilestone && target === nextMilestone.target;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group/node">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] font-black transition-all duration-500 shadow-sm ${
                  isUnlocked
                    ? "bg-brand-primary border-brand-primary text-white shadow-brand-primary/10 scale-105"
                    : isActive
                      ? "bg-white dark:bg-gray-800 border-brand-primary text-brand-primary animate-deep-breath scale-110"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-50"
                }`}
              >
                {isUnlocked ? "✓" : idx + 1}
              </div>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-2 max-w-[70px] truncate text-center block">
                {type === "referral" 
                  ? `${target} refs` 
                  : `Rs. ${target >= 1000 ? (target / 1000).toFixed(1) + "k" : target}`
                }
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. BASE STATUS PROGRESS LINE (FALLBACK) */}
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-linear-to-r from-brand-primary to-brand-primary-hover rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
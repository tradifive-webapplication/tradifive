/* From Uiverse.io by Smit-Prajapati - https://uiverse.io/Smit-Prajapati/popular-wasp-54 */
/* MIT License, Copyright (c) Smit-Prajapati (Smit Prajapati) */
import React from "react";

interface TradeSlotBlobCheckboxProps {
  checked: boolean;
  interactive?: boolean;
  onChange?: (checked: boolean) => void;
  title?: string;
  compact?: boolean;
}

export const TradeSlotBlobCheckbox: React.FC<TradeSlotBlobCheckboxProps> = ({
  checked,
  interactive = false,
  onChange,
  title,
  compact = false,
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      readOnly={!interactive}
      onChange={(e) => {
        if (interactive && onChange) {
          onChange(e.target.checked);
        }
      }}
      title={title}
      aria-label={title || (checked ? "Completed trade slot" : "Remaining trade slot")}
      style={
        compact
          ? { width: 18, minWidth: 18, height: 18 }
          : undefined
      }
      className={`uiverse-trade-blob-checkbox ${
        interactive ? "cursor-pointer hover:scale-105" : "cursor-default"
      }`}
    />
  );
};

interface TradeSlotsBlobStripProps {
  total: number;
  completed: number;
  interactive?: boolean;
  onSelectCount?: (count: number) => void;
  compact?: boolean;
}

export const TradeSlotsBlobStrip: React.FC<TradeSlotsBlobStripProps> = ({
  total,
  completed,
  interactive = false,
  onSelectCount,
  compact = false,
}) => {
  const safeTotal = Math.max(1, Math.min(20, Math.round(total)));
  const safeDone = Math.max(0, Math.min(safeTotal, Math.round(completed)));
  const remaining = Math.max(0, safeTotal - safeDone);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 py-1.5 px-1">
        {Array.from({ length: safeTotal }).map((_, idx) => {
          const isCompleted = idx < safeDone;
          return (
            <TradeSlotBlobCheckbox
              key={`trade-slot-${idx}`}
              checked={isCompleted}
              interactive={interactive}
              compact={compact || safeTotal > 10}
              title={`Trade #${idx + 1}: ${isCompleted ? "Completed" : "Remaining"}`}
              onChange={() => {
                if (!interactive || !onSelectCount) return;
                // Clicking an already-last completed slot unchecks it back one step
                const nextCount = idx + 1 === safeDone ? idx : idx + 1;
                onSelectCount(nextCount);
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold">
        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 tabular-nums">
          <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#FFD43B] to-[#FF6600]" />
          <span>{safeDone} Completed</span>
        </span>
        <span className="text-slate-400 dark:text-neutral-500 tabular-nums">
          {safeTotal} Selected
        </span>
        <span className="inline-flex items-center gap-1.5 text-orange-600 dark:text-orange-400 tabular-nums">
          <span className="w-2 h-2 rounded-full border-[1.5px] border-[#FF6600]" />
          <span>{remaining} Remaining</span>
        </span>
      </div>
    </div>
  );
};

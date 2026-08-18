"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type OptionState = "idle" | "eliminated" | "correct" | "wrong" | "missed";

interface OptionTileProps {
  label: string;
  index: number;
  state: OptionState;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * One answer choice.
 *
 * Five states, because the reveal has to say more than right/wrong: the choice
 * the player picked and got right (`correct`), the choice they picked and got
 * wrong (`wrong`), the answer they *should* have picked shown alongside their
 * miss (`missed`), a choice removed by 50/50 (`eliminated`), and untouched.
 *
 * Every state pairs colour with a glyph or an opacity change — colour alone
 * would leave a colour-blind player unable to read the reveal.
 */
export function OptionTile({ label, index, state, disabled, onSelect }: OptionTileProps) {
  const letter = String.fromCharCode(65 + index);
  const interactive = state === "idle" && !disabled;

  return (
    <motion.button
      type="button"
      disabled={disabled || state === "eliminated"}
      onClick={onSelect}
      whileHover={interactive ? { scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      aria-label={`${letter}. ${label}`}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        state === "idle" &&
          "border-transparent bg-surface-container hover:border-primary/50 hover:bg-surface-container-high",
        state === "eliminated" && "border-transparent bg-surface-container opacity-30",
        state === "correct" && "border-primary bg-primary/10",
        state === "wrong" && "border-error bg-error/10",
        state === "missed" && "border-primary/60 bg-primary/5",
        disabled && state === "idle" && "opacity-70",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          state === "correct" && "bg-primary text-on-primary",
          state === "missed" && "bg-primary/70 text-on-primary",
          state === "wrong" && "bg-error text-on-error",
          (state === "idle" || state === "eliminated") &&
            "bg-surface-container-highest text-primary",
        )}
        aria-hidden="true"
      >
        {state === "correct" || state === "missed" ? (
          <Check className="h-4 w-4" />
        ) : state === "wrong" ? (
          <X className="h-4 w-4" />
        ) : (
          letter
        )}
      </span>

      <span className="min-w-0 flex-1 whitespace-normal font-medium text-on-surface">{label}</span>
    </motion.button>
  );
}

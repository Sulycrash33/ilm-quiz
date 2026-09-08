"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { useLanguage } from "@/contexts/LanguageContext";
import { openEarnedChest, type EarnedChest } from "@/app/(app)/rewards/actions";
import type { Translations } from "@/lib/i18n";

const CHEST_NAME_KEYS: Record<string, keyof Translations> = {
  bronze: "chestBronze",
  silver: "chestSilver",
  gold: "chestGold",
  diamond: "chestDiamond",
};

/**
 * The chests this player has earned and not opened.
 *
 * ── Why it is on this page and not on `/rewards` ──────────────────────────
 * It was on `/rewards`, between the seven day coin ladder and the free spin,
 * and the owner's objection to that was exact: *"you can't just check daily
 * reward and see it there."* Everything on that screen is something you get
 * for showing up. An earned chest sitting among them reads as one more
 * handout, which is precisely the distinction migration 0058 spent a whole
 * change establishing — gifts pay coins, study pays rank — and putting the
 * chest there quietly undid it in the player's head even though the database
 * was right.
 *
 * Here, it sits with the trophies and badges: things that had to be earned.
 *
 * ── Why there is no range printed ─────────────────────────────────────────
 * Nobody knows what is inside, this component included. `open_chest_rpc` rolls
 * the contents server side at the moment of opening. The old paid chest
 * printed "20-60 coins" over a payout that was always exactly 40, which is the
 * one thing worse than a gamble: a gamble that is also a lie.
 *
 * ── Why the chest is removed only after the server says so ────────────────
 * An optimistic removal would hide a refusal, and a refusal is exactly what a
 * second tap is meant to get. The row is claimed with `where opened_at is
 * null`, so two taps race and one loses; this shows the loser's error rather
 * than pretending it won.
 */
export function EarnedChestShelf({ chests: initial }: { chests: EarnedChest[] }) {
  const { t } = useLanguage();
  const [chests, setChests] = useState<EarnedChest[]>(initial);
  const [pending, startTransition] = useTransition();
  const [opening, setOpening] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Nothing earned yet renders nothing at all. A permanent "you have no
  // chests" panel on the page a player opens to see what they *have* is a
  // reminder of absence, and this page already has an empty state of its own.
  if (chests.length === 0 && !message) return null;

  const open = (chest: EarnedChest) => {
    setOpening(chest.id);
    startTransition(async () => {
      const result = await openEarnedChest(chest.id);
      if (result.success) {
        setChests((list) => list.filter((c) => c.id !== chest.id));
        setMessage(
          t("chestOpenedMsg", {
            tier: CHEST_NAME_KEYS[chest.tier] ? t(CHEST_NAME_KEYS[chest.tier]) : chest.tier,
            coins: result.coinsAwarded ?? 0,
            xp: result.xpAwarded ?? 0,
          })
        );
      } else {
        setMessage(result.error ?? t("chestErrorMsg"));
      }
      setOpening(null);
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-8 p-6"
      aria-label={t("mysteryChests")}
    >
      <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{t("mysteryChests")}</h2>

      {message && (
        <p role="status" aria-live="polite" className="mb-4 text-sm text-on-surface-variant">
          {message}
        </p>
      )}

      {chests.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {chests.map((chest) => (
            <PremiumCard key={chest.id} className="p-3 text-center">
              <p className="text-3xl" aria-hidden="true">🎁</p>
              <p className="font-bold text-on-surface">
                {CHEST_NAME_KEYS[chest.tier] ? t(CHEST_NAME_KEYS[chest.tier]) : chest.tier}
              </p>
              <PremiumButton
                variant="secondary"
                size="sm"
                onClick={() => open(chest)}
                disabled={pending && opening === chest.id}
              >
                {pending && opening === chest.id ? t("openingLabel") : t("openChestLabel")}
              </PremiumButton>
            </PremiumCard>
          ))}
        </div>
      )}
    </motion.section>
  );
}

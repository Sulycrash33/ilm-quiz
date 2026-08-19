"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Repeat2, ChevronRight } from "lucide-react";
import { getReviewStatus, type ReviewStatus } from "@/app/(app)/review/actions";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The review prompt on the home screen.
 *
 * Deliberately says what is waiting rather than applying pressure — "14 due for
 * review" is a fact the player can act on, where a guilt notification is a
 * manipulation. It also renders nothing at all when nothing is due, so an
 * empty queue reads as finished rather than as a nagging empty state.
 */
export function ReviewCallout() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ReviewStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReviewStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        // A failed count is not worth surfacing; the card simply stays hidden.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status || status.due === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        href="/review"
        className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary"
          aria-hidden="true"
        >
          <Repeat2 className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-on-surface">
            {t("reviewCta", { count: status.due })}
          </span>
          <span className="block text-xs text-on-surface-variant">{t("reviewIntro")}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

interface QuestionCardProps {
  text: string;
  /** Changes per question so the card animates in on each stage. */
  questionId: string;
}

/**
 * The question itself, set in the display serif on a raised surface with the
 * eight-point star motif bleeding out of the bottom corner — the shape the
 * Stitch reference uses to mark "this is the thing you're answering".
 *
 * The star is decorative and deliberately low-contrast; it sits behind the
 * text at low opacity so it never competes with reading.
 */
export function QuestionCard({ text, questionId }: QuestionCardProps) {
  return (
    <motion.div
      key={questionId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl bg-surface-container p-6 sm:p-8"
    >
      <svg
        className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-primary/10"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Eight-point star: two overlaid squares, the classic khatim motif. */}
        <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
      </svg>

      <h2 className="relative font-headline text-2xl leading-snug text-on-surface sm:text-3xl">
        {text}
      </h2>
    </motion.div>
  );
}

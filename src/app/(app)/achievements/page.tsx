"use client";

import { AchievementSystem } from "@/components/achievement-system";
import { IslamicPattern } from "@/components/islamic-pattern";
import { Suspense } from "react";

// Add loading component for suspense
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
  </div>
);

export default function AchievementsPage() {
  return (
    <main
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50"
      aria-label="Achievements Page"
    >
      {/* Add semantic sectioning */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Improve background pattern handling */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <IslamicPattern />
        </div>
        
        {/* Add suspense for better loading state */}
        <Suspense fallback={<LoadingFallback />}>
          <AchievementSystem />
        </Suspense>
      </section>
    </main>
  );
}

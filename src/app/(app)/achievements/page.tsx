"use client";

import { AchievementSystem } from "@/components/achievement-system";
import { Suspense } from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
  </div>
);

export default function AchievementsPage() {
  return (
    <main
      className="min-h-screen"
      aria-label="Achievements Page"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex items-center justify-between mb-8">
            <Button asChild variant="ghost">
              <Link href="/home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-center">
                <h1 id="achievements-heading" className="text-3xl font-bold text-primary">
                    Achievements & Challenges
                </h1>
                <p className="text-muted-foreground">Track your progress and earn rewards</p>
            </div>
            <div className="w-40" /> {/* Spacer */}
        </header>

        <Suspense fallback={<LoadingFallback />}>
          <AchievementSystem />
        </Suspense>
      </div>
    </main>
  );
}
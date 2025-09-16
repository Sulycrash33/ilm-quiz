
import { Leaderboard } from "@/components/leaderboard";
import { Suspense } from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl">
        {/* Header */}
        <header className="w-full flex items-center justify-between mb-8">
           <Button asChild variant="ghost">
              <Link href="/home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Community Leaderboard
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              See who is leading the quest for knowledge
            </p>
          </div>
           <div className="w-40" /> {/* Spacer */}
        </header>

        {/* Leaderboard Content with Suspense for Loading */}
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
        >
          <div className="w-full bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
            <Leaderboard />
          </div>
        </Suspense>
      </div>
    </main>
  );
}


import { Leaderboard } from "@/components/leaderboard";
import { IslamicPattern } from "@/components/islamic-pattern";
import { Suspense } from "react";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      {/* Background Islamic Pattern */}
      <IslamicPattern className="absolute inset-0 z-0 opacity-10" />
      
      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="w-full max-w-4xl mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800 tracking-tight">
            Community Leaderboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Top contributors making a difference
          </p>
        </header>

        {/* Leaderboard Content with Suspense for Loading */}
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          }
        >
          <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
            <Leaderboard />
          </div>
        </Suspense>
      </div>

      {/* Footer (Optional) */}
      <footer className="relative z-10 mt-8 py-4 text-center text-gray-500 text-sm">
        <p>Updated in real-time • Powered by xAI</p>
      </footer>
    </main>
  );
}

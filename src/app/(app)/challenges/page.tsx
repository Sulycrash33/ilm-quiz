
"use client";

import { GameModes } from "@/components/game/GameModes";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GameModesPage() {
  return (
    <main className="min-h-screen">
      <motion.div
        className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <header className="flex items-center justify-between mb-8">
            <Button asChild variant="ghost">
              <Link href="/home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-center">
                <h1 id="gamemodes-heading" className="text-3xl font-bold font-headline text-primary">
                    Game Modes
                </h1>
                <p className="text-muted-foreground">Choose your path to knowledge</p>
            </div>
            <div className="w-40" /> {/* Spacer */}
        </header>
        
        <section aria-labelledby="gamemodes-heading">
          <GameModes />
        </section>
      </motion.div>
    </main>
  );
}

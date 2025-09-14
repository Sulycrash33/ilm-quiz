import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy } from "lucide-react";

export function HomeActions() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Button asChild className="h-20 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xl font-bold shadow-lg flex items-center justify-start p-6">
        <Link href="/quiz">
          <BookOpen className="mr-4 h-8 w-8" />
          Start New Quiz
        </Link>
      </Button>
      <Button asChild variant="secondary" className="h-20 rounded-lg text-secondary-foreground text-xl font-bold shadow-lg flex items-center justify-start p-6">
        <Link href="/challenges">
          <Trophy className="mr-4 h-8 w-8" />
          Daily Challenge
        </Link>
      </Button>
    </div>
  );
}

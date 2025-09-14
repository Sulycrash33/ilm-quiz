import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function ChallengesPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4 h-screen flex items-center justify-center">
      <Card className="w-full text-center">
        <CardHeader>
          <Trophy className="mx-auto h-12 w-12 text-accent" />
          <CardTitle className="text-3xl font-bold mt-4">Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section is coming soon! Get ready for daily challenges, themed tournaments, and friend duels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

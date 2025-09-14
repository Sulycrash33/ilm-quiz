import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Sparkles } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl p-4 h-screen flex items-center justify-center">
      <Card className="w-full text-center">
        <CardHeader>
          <User className="mx-auto h-12 w-12 text-accent" />
          <CardTitle className="text-3xl font-bold mt-4">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Avatar customization <Sparkles className="inline-block h-4 w-4 text-accent" />, detailed stats, and achievement badges will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

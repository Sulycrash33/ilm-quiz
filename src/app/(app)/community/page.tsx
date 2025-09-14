import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-2xl p-4 h-screen flex items-center justify-center">
      <Card className="w-full text-center">
        <CardHeader>
          <Users className="mx-auto h-12 w-12 text-accent" />
          <CardTitle className="text-3xl font-bold mt-4">Community</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Study groups, forums, and leaderboards are under construction. Stay tuned to connect with other seekers of knowledge!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

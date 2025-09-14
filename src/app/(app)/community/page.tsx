
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Trophy, Star, Hammer } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <header className="mb-8 text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Community Hub</h1>
        <p className="text-muted-foreground text-lg">
          Connect, learn, and grow with other knowledge seekers.
        </p>
      </header>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="forum">
            <MessageSquare className="h-4 w-4 mr-2" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="mentorship">
            <Star className="h-4 w-4 mr-2" />
            Mentorship
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="groups">
            <ComingSoon
              title="Study Groups"
              description="Join or create study groups to learn with others. This feature is currently being built."
              icon={Users}
            />
          </TabsContent>
          <TabsContent value="forum">
            <ComingSoon
              title="Community Forum"
              description="Ask questions, share insights, and engage in discussions. The forum is under construction."
              icon={MessageSquare}
            />
          </TabsContent>
          <TabsContent value="challenges">
            <ComingSoon
              title="Community Challenges"
              description="Compete with friends and the community in special challenges. Coming soon!"
              icon={Trophy}
            />
          </TabsContent>
          <TabsContent value="mentorship">
            <ComingSoon
              title="Mentorship Program"
              description="Find a mentor or become one to guide others. We are finalizing the details for this program."
              icon={Star}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ComingSoon({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) {
    return (
        <Card className="w-full text-center border-2 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                    <Hammer className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold mt-4">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground max-w-md mx-auto">
                    {description} Stay tuned to connect with other seekers of knowledge!
                </p>
                <div className="mt-6 flex justify-center items-center gap-2">
                    <Icon className="h-5 w-5 text-accent"/>
                    <p className="font-semibold text-accent">Feature Under Construction</p>
                </div>
            </CardContent>
        </Card>
    )
}

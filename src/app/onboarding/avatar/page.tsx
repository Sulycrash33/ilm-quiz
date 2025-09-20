"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { IslamicBackground } from "@/components/layout/IslamicBackground"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const avatars = {
  male: [
    { id: "m-child", name: "Young Boy", src: "https://picsum.photos/seed/m-child/200", age: "child" },
    { id: "m-teen", name: "Teenage Boy", src: "https://picsum.photos/seed/m-teen/200", age: "teen" },
    { id: "m-adult", name: "Adult Man", src: "https://picsum.photos/seed/m-adult/200", age: "adult" },
    { id: "m-elder", name: "Elderly Man", src: "https://picsum.photos/seed/m-elder/200", age: "elder" },
  ],
  female: [
    { id: "f-child", name: "Young Girl", src: "https://picsum.photos/seed/f-child/200", age: "child" },
    { id: "f-teen", name: "Teenage Girl", src: "https://picsum.photos/seed/f-teen/200", age: "teen" },
    { id: "f-adult", name: "Adult Woman", src: "https://picsum.photos/seed/f-adult/200", age: "adult" },
    { id: "f-elder", name: "Elderly Woman", src: "https://picsum.photos/seed/f-elder/200", age: "elder" },
  ],
}

export default function AvatarSelectionPage() {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  const handleSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    // In a real app, you'd save this to state management or a cookie
    console.log("Selected avatar:", avatarId)
    setTimeout(() => router.push("/onboarding/name"), 300)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <IslamicBackground />
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost">
          <Link href="/onboarding/age">
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="z-10 w-full max-w-2xl">
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold">Choose Your Avatar</CardTitle>
            <CardDescription>Select an avatar that represents you.</CardDescription>
            <Progress value={66} className="w-2/3 mx-auto" />
            <div className="text-sm text-muted-foreground">Step 2 of 3</div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="female" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="female">Female</TabsTrigger>
                <TabsTrigger value="male">Male</TabsTrigger>
              </TabsList>
              <TabsContent value="female" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {avatars.female.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={cn(
                        "flex flex-col items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition-all",
                        selectedAvatar === avatar.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
                      )}
                      onClick={() => handleSelect(avatar.id)}
                      role="button"
                    >
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-center">{avatar.name}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="male" className="mt-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {avatars.male.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={cn(
                        "flex flex-col items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition-all",
                        selectedAvatar === avatar.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
                      )}
                      onClick={() => handleSelect(avatar.id)}
                      role="button"
                    >
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-center">{avatar.name}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
         <div className="text-center mt-6">
            <Button variant="outline" onClick={() => router.push("/onboarding/name")}>
                Skip <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </div>
    </div>
  )
}

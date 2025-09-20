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
  female: [
    { id: "f-1", name: "Aisha", src: "https://avatar.iran.liara.run/public/girl?username=aisha" },
    { id: "f-2", name: "Fatima", src: "https://avatar.iran.liara.run/public/girl?username=fatima" },
    { id: "f-3", name: "Zainab", src: "https://avatar.iran.liara.run/public/girl?username=zainab" },
    { id: "f-4", name: "Khadija", src: "https://avatar.iran.liara.run/public/girl?username=khadija" },
    { id: "f-5", name: "Maryam", src: "https://avatar.iran.liara.run/public/girl?username=maryam" },
    { id: "f-6", name: "Hafsa", src: "https://avatar.iran.liara.run/public/girl?username=hafsa" },
    { id: "f-7", name: "Sumayyah", src: "https://avatar.iran.liara.run/public/girl?username=sumayyah" },
    { id: "f-8", name: "Nusaiba", src: "https://avatar.iran.liara.run/public/girl?username=nusaiba" },
  ],
  male: [
    { id: "m-1", name: "Omar", src: "https://avatar.iran.liara.run/public/boy?username=omar" },
    { id: "m-2", name: "Ali", src: "https://avatar.iran.liara.run/public/boy?username=ali" },
    { id: "m-3", name: "Yusuf", src: "https://avatar.iran.liara.run/public/boy?username=yusuf" },
    { id: "m-4", name: "Bilal", src: "https://avatar.iran.liara.run/public/boy?username=bilal" },
    { id: "m-5", name: "Khalid", src: "https://avatar.iran.liara.run/public/boy?username=khalid" },
    { id: "m-6", name: "Hassan", src: "https://avatar.iran.liara.run/public/boy?username=hassan" },
    { id: "m-7", name: "Ibrahim", src: "https://avatar.iran.liara.run/public/boy?username=ibrahim" },
    { id: "m-8", name: "Salim", src: "https://avatar.iran.liara.run/public/boy?username=salim" },
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
                      aria-label={`Select avatar: ${avatar.name}`}
                    >
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-center text-sm">{avatar.name}</span>
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
                      aria-label={`Select avatar: ${avatar.name}`}
                    >
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-center text-sm">{avatar.name}</span>
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

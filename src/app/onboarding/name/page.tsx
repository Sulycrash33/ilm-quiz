"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check } from "lucide-react"
import { NamesOfAllahBackdrop } from "@/components/layout/NamesOfAllahBackdrop"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/LanguageContext"
import { saveOnboardingSelection } from "@/lib/onboarding-storage"

export default function NameSelectionPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [name, setName] = useState("")

  const handleContinue = (guestFallback = false) => {
    saveOnboardingSelection({ name: name.trim() || (guestFallback ? "Guest Learner" : name) })
    // No account exists yet at this point - onboarding data has nowhere to
    // live until signup. Hand off to account creation instead of /home,
    // which real auth now correctly blocks for anonymous visitors.
    router.push("/signup")
  }

  return (
    <div dir={dir} className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4">
      <NamesOfAllahBackdrop />
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost">
          <Link href="/onboarding/avatar">
            <ArrowLeft className="h-6 w-6 mr-2" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <div className="z-10 w-full max-w-md">
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold">{t("whatShouldWeCallYou")}</CardTitle>
            <CardDescription>{t("enterNameForProfile")}</CardDescription>
            <Progress value={100} className="w-2/3 mx-auto" />
            <div className="text-sm text-muted-foreground">{t("stepOf", { current: 3, total: 3 })}</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="sr-only">{t("nameLabel")}</Label>
              <Input
                id="name"
                placeholder={t("enterYourName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg h-12"
              />
            </div>
            <Button
              size="lg"
              className="w-full h-12"
              onClick={() => handleContinue()}
              disabled={!name.trim()}
            >
              {t("finishSetup")} <Check className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
         <div className="text-center mt-6">
            <Button variant="link" onClick={() => handleContinue(true)}>
                {t("continueWithGuestName")}
            </Button>
        </div>
      </div>
    </div>
  )
}

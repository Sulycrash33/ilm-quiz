"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { NamesOfAllahBackdrop } from "@/components/layout/NamesOfAllahBackdrop"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { saveOnboardingSelection } from "@/lib/onboarding-storage"
import { useLanguage } from "@/contexts/LanguageContext"
import { AVATARS, AvatarArt, type AvatarGender } from "@/components/avatars/avatar-art"

/**
 * Avatar picker.
 *
 * The previous version fetched every tile from avatar.iran.liara.run. That
 * service had stopped responding, so the grid rendered as fallback letters —
 * the "boring" screen was actually a broken one. These are local SVGs, so the
 * page has no network dependency at all now.
 *
 * What is stored also changed. It used to save the full remote URL into
 * `profiles.avatar_id`; it now saves a short stable id like "f-1". Anything
 * still holding an old URL renders the fallback mark rather than a broken
 * image.
 */
export default function AvatarSelectionPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected(id)
    saveOnboardingSelection({ avatarUrl: id })
    setTimeout(() => router.push("/onboarding/name"), 280)
  }

  const grid = (gender: AvatarGender) => (
    <div className="grid grid-cols-4 gap-3 sm:gap-5">
      {AVATARS.filter((a) => a.gender === gender).map((avatar) => {
        const isSelected = selected === avatar.id
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => handleSelect(avatar.id)}
            aria-pressed={isSelected}
            title={`${avatar.letterName} — ${avatar.style}`}
            className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-transparent hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <span className="relative block overflow-hidden rounded-full ring-1 ring-primary/15">
              <AvatarArt id={avatar.id} className="h-16 w-16 sm:h-20 sm:w-20" />
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Check className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="flex flex-col items-center text-center leading-tight">
              <span dir="rtl" lang="ar" className="text-base font-semibold text-primary">
                {avatar.letter}
              </span>
              <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant">
                {avatar.letterName}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div dir={dir} className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4">
      <NamesOfAllahBackdrop />
      <div className="absolute left-4 top-4 z-20">
        <Button asChild variant="ghost">
          <Link href="/onboarding/age">
            <ArrowLeft className="mr-2 h-6 w-6" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <div className="z-10 w-full max-w-2xl">
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-bold">{t("chooseYourAvatar")}</CardTitle>
            <CardDescription>{t("chooseYourAvatarDesc")}</CardDescription>
            <Progress value={66} className="mx-auto w-2/3" />
            <div className="text-sm text-muted-foreground">{t("stepOf", { current: 2, total: 3 })}</div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="female" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="female">{t("female")}</TabsTrigger>
                <TabsTrigger value="male">{t("male")}</TabsTrigger>
              </TabsList>
              <TabsContent value="female" className="mt-6">
                {grid("female")}
              </TabsContent>
              <TabsContent value="male" className="mt-6">
                {grid("male")}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push("/onboarding/name")}>
            {t("skip")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

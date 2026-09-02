"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { OnboardingBackdrop } from "@/components/layout/OnboardingBackdrop"
import { Progress } from "@/components/ui/progress"
import { saveOnboardingSelection } from "@/lib/onboarding-storage"
import { useLanguage } from "@/contexts/LanguageContext"
import type { Translations } from "@/lib/i18n"
import { SoundToggle } from "@/components/profile/SoundToggle"

/**
 * `value` is what gets persisted to the profile and must stay stable in
 * English across every locale — only `labelKey`/`descKey` are translated.
 * Numeric ranges render as-is; the two non-numeric labels get a key.
 */
const ageRanges: { value: string; labelKey?: keyof Translations; descKey: keyof Translations }[] = [
  { value: "Under 13", labelKey: "ageUnder13", descKey: "youngLearner" },
  { value: "13-17", descKey: "teenSeeker" },
  { value: "18-25", descKey: "youngAdult" },
  { value: "26-40", descKey: "adultScholar" },
  { value: "41-60", descKey: "experiencedLearner" },
  { value: "60+", descKey: "wiseElder" },
]

export default function AgeSelectionPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()

  const handleSelect = (ageRange: string) => {
    saveOnboardingSelection({ ageRange })
    router.push("/onboarding/avatar")
  }

  return (
    <div dir={dir} className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4">
      {/* Sound is off by default, so the only way to turn it on was to find
          the profile — after onboarding has already started playing cues. */}
      <div className="absolute top-4 right-4 z-20">
        <SoundToggle compact />
      </div>
      <OnboardingBackdrop />
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost">
          <Link href="/onboarding/sound">
            <ArrowLeft className="h-6 w-6 mr-2" />
            {t("back")}
          </Link>
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 sm:space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold">{t("selectYourAge")}</CardTitle>
            <CardDescription>{t("selectYourAgeDesc")}</CardDescription>
            <Progress value={33} className="w-2/3 mx-auto" />
            <div className="text-sm text-muted-foreground">{t("stepOf", { current: 1, total: 3 })}</div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {ageRanges.map((age) => (
              <Button
                key={age.value}
                variant="outline"
                className="h-20 sm:h-24 transform text-lg transition-transform hover:scale-105 hover:bg-muted/80 flex-col"
                onClick={() => handleSelect(age.value)}
              >
                <span className="text-xl sm:text-2xl font-bold">{age.labelKey ? t(age.labelKey) : age.value}</span>
                <span className="text-sm font-normal text-muted-foreground">{t(age.descKey)}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
        <div className="text-center mt-4 sm:mt-6">
            <Button variant="outline" onClick={() => router.push("/onboarding/avatar")}>
                {t("skip")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </div>
    </div>
  )
}

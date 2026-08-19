"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { IslamicBackground } from "@/components/layout/IslamicBackground"
import { Progress } from "@/components/ui/progress"
import { saveOnboardingSelection } from "@/lib/onboarding-storage"

const ageRanges = [
  { range: "Under 13", description: "Young learner" },
  { range: "13-17", description: "Teen seeker" },
  { range: "18-25", description: "Young adult" },
  { range: "26-40", description: "Adult scholar" },
  { range: "41-60", description: "Experienced learner" },
  { range: "60+", description: "Wise elder" },
]

export default function AgeSelectionPage() {
  const router = useRouter()

  const handleSelect = (ageRange: string) => {
    saveOnboardingSelection({ ageRange })
    router.push("/onboarding/avatar")
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4">
      <IslamicBackground />
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost">
          <Link href="/language">
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="z-10 w-full max-w-2xl">
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 sm:space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Select Your Age</CardTitle>
            <CardDescription>This helps us personalize your learning journey.</CardDescription>
            <Progress value={33} className="w-2/3 mx-auto" />
            <div className="text-sm text-muted-foreground">Step 1 of 3</div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {ageRanges.map((age) => (
              <Button
                key={age.range}
                variant="outline"
                className="h-20 sm:h-24 transform text-lg transition-transform hover:scale-105 hover:bg-muted/80 flex-col"
                onClick={() => handleSelect(age.range)}
              >
                <span className="text-xl sm:text-2xl font-bold">{age.range}</span>
                <span className="text-sm font-normal text-muted-foreground">{age.description}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
        <div className="text-center mt-4 sm:mt-6">
            <Button variant="outline" onClick={() => router.push("/onboarding/avatar")}>
                Skip <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </div>
    </div>
  )
}

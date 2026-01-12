import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IslamicBackground } from '@/components/layout/IslamicBackground';
import { MosqueIcon } from '@/components/icons/MosqueIcon';

const languages = [
  { name: 'English', href: '/onboarding/age', dir: 'ltr', code: 'gb' },
  { name: 'Hausa', href: '/onboarding/age', dir: 'ltr', code: 'ng' },
  { name: 'العربية', href: '/onboarding/age', dir: 'rtl', font: "'Amiri', serif", code: 'sa' },
  { name: 'Français', href: '/onboarding/age', dir: 'ltr', code: 'fr' },
  { name: 'Kiswahili', href: '/onboarding/age', dir: 'ltr', code: 'tz' },
];

export default function LanguageSelectionPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <IslamicBackground />
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </div>
      <div className="z-10 w-full max-w-md">
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MosqueIcon className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold" style={{ fontFamily: "'Amiri', serif" }}>
              Select a Language
            </CardTitle>
            <CardDescription>Choose your preferred language to continue.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            {languages.map((lang) => (
              <Button
                key={lang.name}
                asChild
                size="lg"
                variant="outline"
                className="h-16 transform text-lg transition-transform hover:scale-105 hover:bg-muted/80"
                style={{ direction: lang.dir as 'ltr' | 'rtl', fontFamily: lang.font }}
              >
                <Link href={lang.href} className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-6 w-8 overflow-hidden rounded-sm">
                        <Image
                            src={`https://flagcdn.com/${lang.code}.svg`}
                            alt={`${lang.name} flag`}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <span>{lang.name}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

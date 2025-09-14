import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, ArrowRight } from 'lucide-react';

const languages = [
  { name: 'Hausa', href: '/login', dir: 'ltr' },
  { name: 'Arabic', href: '/login', dir: 'rtl', font: "'Amiri', serif" },
  { name: 'French', href: '/login', dir: 'ltr' },
  { name: 'Swahili', href: '/login', dir: 'ltr' },
];

export default function LanguageSelectionPage() {
  return (
    <div className="container mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Select a Language</CardTitle>
          <CardDescription>Choose your preferred language to continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          {languages.map((lang) => (
            <Button
              key={lang.name}
              asChild
              size="lg"
              variant="outline"
              className="h-16 text-lg justify-between"
              style={{ direction: lang.dir as 'ltr' | 'rtl', fontFamily: lang.font }}
            >
              <Link href={lang.href}>
                <span>{lang.name}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

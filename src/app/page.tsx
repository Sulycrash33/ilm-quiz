import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IslamicBackground } from '@/components/layout/IslamicBackground';
import { MosqueIcon } from '@/components/icons/MosqueIcon';

export default function WelcomePage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-center">
      <IslamicBackground />
      <div className="z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 text-primary">
          <MosqueIcon className="h-12 w-12" />
          <h1 className="text-5xl font-bold tracking-tight font-headline">IlmHunt</h1>
        </div>
        <p style={{ fontFamily: "'Amiri', serif" }} className="text-4xl text-foreground/80">
          ٱلسَّلَامُ عَلَيْكُمْ
        </p>
        <p className="max-w-md text-lg text-muted-foreground">
          Embark on a journey to deepen your knowledge and strengthen your faith.
        </p>
        <Button asChild size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-lg font-bold shadow-lg transition-transform hover:scale-105">
          <Link href="/language">Begin Your Quest</Link>
        </Button>
      </div>
    </div>
  );
}

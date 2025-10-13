import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MosqueIcon } from '@/components/icons/MosqueIcon';
import { ArrowLeft } from 'lucide-react';
import { IslamicBackground } from '@/components/layout/IslamicBackground';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <IslamicBackground />
       <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost" size="icon">
          <Link href="/language">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </div>
      <div className="z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <MosqueIcon className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold mt-4 font-headline">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your quest.</p>
        </div>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@ilmhunt.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button asChild className="w-full">
                <Link href="/home">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

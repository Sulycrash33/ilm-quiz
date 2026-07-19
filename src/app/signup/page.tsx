"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MosqueIcon } from "@/components/icons/MosqueIcon";
import { ArrowLeft, Loader2 } from "lucide-react";
import { IslamicBackground } from "@/components/layout/IslamicBackground";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOnboardingSelections, clearOnboardingSelections } from "@/lib/onboarding-storage";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the person came through onboarding (age -> avatar -> name), prefill
  // the name they already chose instead of asking again.
  useEffect(() => {
    const selections = getOnboardingSelections();
    if (selections.name) setUsername(selections.name);
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both password fields are identical.",
      });
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: username },
      },
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Couldn't create account",
        description: error.message,
      });
      return;
    }

    // If email confirmation is required, Supabase returns a user but no
    // active session yet - send them to check their inbox instead of /home.
    if (data.user && !data.session) {
      toast({
        title: "Check your email",
        description: "We've sent a confirmation link to finish creating your account.",
      });
      router.push("/login");
      return;
    }

    // Apply the age/avatar chosen during onboarding to the real profile
    // row now that an account actually exists to attach it to.
    const selections = getOnboardingSelections();
    if (data.user && (selections.ageRange || selections.avatarUrl)) {
      await supabase
        .from("profiles")
        .update({
          ...(selections.ageRange ? { age_range: selections.ageRange } : {}),
          ...(selections.avatarUrl ? { avatar_id: selections.avatarUrl } : {}),
        })
        .eq("id", data.user.id);
    }
    clearOnboardingSelections();

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <IslamicBackground />
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost" size="icon">
          <Link href="/login">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </div>
      <div className="z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <MosqueIcon className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4 font-headline">Create an Account</h1>
          <p className="text-muted-foreground">Begin your quest for knowledge.</p>
        </div>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@ilmhunt.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { IlmHuntMark } from "@/components/icons/IlmHuntMark";
import { Loader2 } from "lucide-react";
import { NamesOfAllahBackdrop } from "@/components/layout/NamesOfAllahBackdrop";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

/** Matches the `minLength={6}` the signup form already enforces. */
const MIN_PASSWORD = 6;

type Stage = "checking" | "ready" | "invalid";

/**
 * Where the emailed reset link lands.
 *
 * The client is `createBrowserClient` from `@supabase/ssr`, which uses PKCE,
 * so the link arrives as `?code=...` and has to be exchanged for a session
 * before `updateUser` will be allowed to set a password. supabase-js does that
 * exchange itself when it detects the code, so this waits for a session to
 * appear rather than racing it — an exchange started here as well would spend
 * the single-use code twice, and the second attempt is the one that fails.
 *
 * An expired or reused link produces no session, which is the `invalid` stage:
 * a dead end with a way out, rather than a password form that cannot save.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let live = true;

    // Supabase fires PASSWORD_RECOVERY once it has turned the link into a
    // session. Subscribing before the first check avoids missing the event
    // when the exchange finishes between the two.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live && session) setStage("ready");
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!live) return;
      if (data.session) {
        setStage("ready");
        return;
      }
      // No session yet and no code to wait for means the page was opened
      // directly rather than from a link.
      const url = new URL(window.location.href);
      const hasCode = url.searchParams.has("code") || window.location.hash.includes("access_token");
      if (!hasCode) {
        setStage("invalid");
        return;
      }
      // Give the exchange a moment to land, then treat silence as a dead link.
      setTimeout(() => {
        if (!live) return;
        void supabase.auth.getSession().then(({ data: after }) => {
          if (live && !after.session) setStage("invalid");
        });
      }, 4000);
    })();

    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < MIN_PASSWORD) {
      toast({ variant: "destructive", title: t("passwordTooShort") });
      return;
    }
    if (password !== confirm) {
      toast({ variant: "destructive", title: t("passwordsDoNotMatch") });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: t("couldntUpdatePassword"),
        description: error.message,
      });
      return;
    }

    toast({ title: t("passwordUpdatedTitle"), description: t("passwordUpdatedBody") });
    // The recovery session is a real session, so there is nowhere to sign in
    // to: the player is already in.
    router.push("/home");
    router.refresh();
  }

  return (
    <div dir={dir} className="relative flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <NamesOfAllahBackdrop />

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-24 w-20 items-end justify-center overflow-hidden rounded-t-full border border-primary/25 bg-gradient-to-b from-primary/10 to-transparent">
            <div className="absolute inset-x-0 top-0 flex h-full items-center justify-center">
              <IlmHuntMark className="h-10 w-10 text-primary" />
            </div>
            <div className="mb-2 h-px w-8 bg-primary/40" />
          </div>
          <h1 className="mt-5 font-headline text-3xl font-bold">
            {stage === "invalid" ? t("resetLinkInvalidTitle") : t("newPasswordTitle")}
          </h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            {stage === "checking" && (
              <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t("checkingResetLink")}
              </p>
            )}

            {stage === "invalid" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">{t("resetLinkInvalidBody")}</p>
                <Button asChild className="w-full">
                  <Link href="/forgot-password">{t("requestNewResetLink")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">{t("backToSignIn")}</Link>
                </Button>
              </div>
            )}

            {stage === "ready" && (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <p className="text-sm text-muted-foreground">{t("newPasswordIntro")}</p>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("newPasswordLabel")}</Label>
                  <PasswordInput
                    id="new-password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("confirmPasswordLabel")}</Label>
                  <PasswordInput
                    id="confirm-password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t("savePassword")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

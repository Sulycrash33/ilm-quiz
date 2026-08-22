"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Trophy, Users, User, Gift, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MosqueIcon } from "@/components/icons/MosqueIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Translations } from "@/lib/i18n";

const navItems: { href: string; icon: React.ElementType; labelKey: keyof Translations }[] = [
  { href: "/home", icon: MosqueIcon, labelKey: "home" },
  { href: "/quiz", icon: BookOpen, labelKey: "quiz" },
  { href: "/challenges", icon: Zap, labelKey: "gameModes" },
  { href: "/community", icon: Users, labelKey: "community" },
  { href: "/profile", icon: User, labelKey: "profile" },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { t, dir } = useLanguage();

  return (
    <nav dir={dir} className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/80 backdrop-blur-sm md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 font-medium">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group inline-flex flex-col items-center justify-center px-5 hover:bg-muted",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="mb-1 h-6 w-6" />
              <span className="text-xs font-semibold">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

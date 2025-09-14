"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Trophy, Users, User, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { MosqueIcon } from "@/components/icons/MosqueIcon";

const navItems = [
  { href: "/home", icon: MosqueIcon, label: "Home" },
  { href: "/quiz", icon: BookOpen, label: "Quiz" },
  { href: "/challenges", icon: Gift, label: "Rewards" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/80 backdrop-blur-sm md:hidden">
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
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

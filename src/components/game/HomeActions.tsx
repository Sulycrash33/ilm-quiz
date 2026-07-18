"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Users, Play, ShoppingCart, Star, Zap } from "lucide-react";

export function HomeActions() {
  const actions = [
    { href: "/quiz", label: "Quick Quiz", icon: Play },
    { href: "/challenges", label: "Game Modes", icon: Zap },
    { href: "/achievements", label: "Achievements", icon: Star },
    { href: "/community", label: "Community", icon: Users },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/store", label: "Store", icon: ShoppingCart },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
       {actions.map((action) => (
         <Button
            key={action.href}
            asChild
            size="lg"
            variant="outline"
            className="h-20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-primary border-primary/30 hover:bg-primary/10"
        >
            <Link href={action.href}>
                <div className="flex flex-col items-center gap-2">
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm font-semibold">{action.label}</span>
                </div>
            </Link>
        </Button>
       ))}
    </div>
  );
}

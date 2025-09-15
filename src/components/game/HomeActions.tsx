"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Users, User, Gift, Play, ShoppingCart, Star } from "lucide-react";

export function HomeActions() {
  const actions = [
    { href: "/quiz", label: "Quick Quiz", icon: Play, color: "bg-primary text-primary-foreground", hover: "hover:bg-primary/90" },
    { href: "/achievements", label: "Achievements", icon: Star, color: "text-primary", borderColor: "border-primary", hover: "hover:bg-primary/10" },
    { href: "/community", label: "Community", icon: Users, color: "text-primary", borderColor: "border-primary", hover: "hover:bg-primary/10" },
    { href: "/profile", label: "Profile", icon: User, color: "text-primary", borderColor: "border-primary", hover: "hover:bg-primary/10" },
    { href: "/store", label: "Store", icon: ShoppingCart, color: "text-primary", borderColor: "border-primary", hover: "hover:bg-primary/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
       {actions.map((action, index) => (
         <Button
            key={action.href}
            asChild
            size="lg"
            variant={index === 0 ? 'default' : 'outline'}
            className={`h-20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${action.color} ${action.borderColor || ''} ${action.hover}`}
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

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Users, Play, ShoppingCart, Star, Zap } from "lucide-react";

export function HomeActions() {
  const actions = [
    { href: "/quiz", label: "Quick Quiz", icon: Play, color: "text-red-500", borderColor: "border-red-300", hover: "hover:bg-red-50" },
    { href: "/challenges", label: "Game Modes", icon: Zap, color: "text-orange-500", borderColor: "border-orange-300", hover: "hover:bg-orange-50" },
    { href: "/achievements", label: "Achievements", icon: Star, color: "text-yellow-500", borderColor: "border-yellow-300", hover: "hover:bg-yellow-50" },
    { href: "/community", label: "Community", icon: Users, color: "text-green-500", borderColor: "border-green-300", hover: "hover:bg-green-50" },
    { href: "/profile", label: "Profile", icon: User, color: "text-blue-500", borderColor: "border-blue-300", hover: "hover:bg-blue-50" },
    { href: "/store", label: "Store", icon: ShoppingCart, color: "text-purple-500", borderColor: "border-purple-300", hover: "hover:bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
       {actions.map((action) => (
         <Button
            key={action.href}
            asChild
            size="lg"
            variant="outline"
            className={`h-20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${action.color} ${action.borderColor} ${action.hover}`}
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

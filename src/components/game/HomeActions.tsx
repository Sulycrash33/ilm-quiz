import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Users, User, Coins, Play, Gift, ShoppingCart } from "lucide-react";

export function HomeActions() {
  const actions = [
    { href: "/quiz", label: "Quick Quiz", icon: Play, color: "bg-primary text-primary-foreground", hover: "hover:bg-primary/90" },
    { href: "/challenges", label: "Rewards", icon: Gift, color: "text-yellow-700", borderColor: "border-yellow-300", hover: "hover:bg-yellow-50" },
    { href: "/store", label: "Store", icon: ShoppingCart, color: "text-blue-700", borderColor: "border-blue-300", hover: "hover:bg-blue-50" },
    { href: "/profile", label: "Profile", icon: User, color: "text-purple-700", borderColor: "border-purple-300", hover: "hover:bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       {actions.map(action => (
         <Button
            key={action.href}
            asChild
            size="lg"
            variant={action.color.startsWith('bg-') ? 'default' : 'outline'}
            className={`h-20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-transparent ${action.color} ${action.borderColor || ''} ${action.hover}`}
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

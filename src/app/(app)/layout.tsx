import { IslamicBackground } from "@/components/layout/IslamicBackground";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-background bg-gradient-to-br from-background via-secondary/50 to-accent/20">
      <IslamicBackground />
      <main className="relative z-10 pb-20 md:pb-0">{children}</main>
      <BottomNavBar />
    </div>
  );
}

import { ReactNode } from "react";
import { BottomNav } from "@/components/ui/BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={showNav ? "pb-20" : ""}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}

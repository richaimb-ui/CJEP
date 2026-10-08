"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, orgName = "COMITÉ JOSEPH", user }: { children: React.ReactNode, orgName?: string, user?: any }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#f8f9fc] md:bg-background font-sans">
      {/* Sidebar (Desktop Only) */}
      <div className="hidden md:block">
        <Sidebar onClose={() => {}} orgName={orgName} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden pb-16 md:pb-0">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

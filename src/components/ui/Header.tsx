"use client";

import { User as UserIcon, Bell, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";

export function Header({ user }: { user?: any }) {
  const firstName = user?.firstName || "";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Non connecté";
  const userRole = user?.role || "Visiteur";

  return (
    <header className="px-6 md:px-6 bg-transparent md:bg-background md:border-b border-border flex items-center justify-between sticky top-0 z-10 w-full pt-6 md:pt-0 pb-2">
      {/* Mobile view */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <p className="text-[15px] text-gray-500 font-medium tracking-tight">Salut,</p>
              <p className="text-[15px] font-semibold text-gray-900 tracking-tight">{firstName}</p>
            </>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-primary flex items-center gap-1">
              <LogIn className="w-4 h-4" /> Se connecter
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-orange-200/50">
              <span className="text-orange-500 text-[10px]">👑</span> {userRole}
            </div>
          )}
          {user && (
            <form action={signOutAction}>
              <button type="submit" className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Déconnexion">
                <LogOut className="w-[20px] h-[20px]" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex flex-1 items-center justify-end gap-4">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <form action={signOutAction} className="ml-2">
              <button 
                type="submit" 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}

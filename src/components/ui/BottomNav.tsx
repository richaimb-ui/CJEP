"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { GraduationCap, FileText, Settings, Grid } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainLinks = [
    { name: "Accueil", href: "/tableau-de-bord", icon: Home },
    { name: "Contributeurs", href: "/contributeurs", icon: Users },
    { name: "Entrées", href: "/entrees", icon: ArrowDownRight },
    { name: "Dépenses", href: "/depenses", icon: ArrowUpRight },
  ];

  const moreLinks = [
    { name: "Étudiants", href: "/etudiants", icon: GraduationCap },
    { name: "Matrice", href: "/cotisations", icon: Grid },
    { name: "Rapports", href: "/rapports", icon: FileText },
    { name: "Paramètres", href: "/parametres", icon: Settings },
  ];

  return (
    <>
      {/* Overlay for More Menu */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Bottom Sheet */}
      {/* More Menu Bottom Sheet */}
      <div className={`fixed bottom-[76px] left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 z-40 md:hidden transform transition-all duration-300 ease-out ${isMoreOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"}`}>
        <div className="p-5 grid grid-cols-4 gap-y-6 gap-x-2">
          {moreLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center gap-2 rounded-2xl transition-all ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className={`p-3.5 rounded-[18px] ${isActive ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                  <Icon className="w-[22px] h-[22px] stroke-[1.8]" />
                </div>
                <span className="text-[11px] font-semibold tracking-tight text-center">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 px-6 py-2 pb-safe md:hidden flex justify-between items-center">
        {mainLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`relative flex flex-col items-center p-2 pt-3 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-600 rounded-b-full"></div>
              )}
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-blue-600/20 stroke-[1.8]" : "stroke-[1.8]"}`} />
            </Link>
          );
        })}
        
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`relative flex flex-col items-center p-2 pt-3 transition-colors ${
            isMoreOpen ? "text-blue-600" : "text-gray-400 hover:text-gray-900"
          }`}
        >
          {isMoreOpen && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-600 rounded-b-full"></div>
          )}
          <div className="relative">
            <MoreHorizontal className="w-6 h-6 mb-1 stroke-[1.8]" />
            <div className="absolute top-0 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></div>
          </div>
        </button>
      </div>
    </>
  );
}

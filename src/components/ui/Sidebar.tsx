"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, 
  Users, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Moon, 
  Menu,
  ChevronDown,
  Grid
} from "lucide-react";
import Image from "next/image";

export function Sidebar({ onClose, orgName = "COMITÉ JOSEPH" }: { onClose?: () => void, orgName?: string }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/tableau-de-bord", icon: Home },
    { name: "Contributeurs", href: "/contributeurs", icon: Users, children: true },
    { name: "Cotisations", href: "/cotisations", icon: Grid },
    { name: "Étudiants", href: "/etudiants", icon: UserPlus, children: true },
    { name: "Entrées", href: "/entrees", icon: TrendingUp, children: true },
    { name: "Dépenses", href: "/depenses", icon: TrendingDown, children: true },
    { name: "Rapports", href: "/rapports", icon: TrendingUp, badge: "2", children: true },
    { name: "Paramètres", href: "/parametres", icon: Settings, children: true },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col transition-colors duration-200">
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <Image src="/Logo%20C.jpg" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-primary">COMITÉ JOSEPH</span>
        </Link>
      </div>

      <div className="px-4 py-2">
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {orgName}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-primary-light text-primary font-bold" 
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-foreground"}`} />
                <span className="text-sm">{item.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.children && (
                  <ChevronDown className={`w-4 h-4 ${isActive ? "text-primary" : "text-gray-400"}`} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <Moon className="w-5 h-5 text-gray-400" />
          <span>Mode Sombre</span>
        </button>
      </div>
    </aside>
  );
}

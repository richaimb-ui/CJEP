import Link from "next/link";
import { LayoutDashboard, Users, User, CreditCard, Banknote, ListTodo, FileText, Settings, LogOut, Search, Bell, HelpCircle } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-border h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-white font-bold">C</span>
        </div>
        <span className="text-xl font-bold text-primary">CJEP</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Général</h3>
          <nav className="space-y-1">
            <Link href="/tableau-de-bord" className="flex items-center gap-3 px-2 py-2 rounded-md bg-secondary text-primary font-medium">
              <LayoutDashboard className="w-4 h-4" />
              Accueil
            </Link>
            <Link href="/cotisations" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
              <CreditCard className="w-4 h-4" />
              Cotisations
            </Link>
            <Link href="/entrees" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
              <Banknote className="w-4 h-4" />
              Entrées
            </Link>
            <Link href="/depenses" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
              <ListTodo className="w-4 h-4" />
              Dépenses
            </Link>
          </nav>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Administration</h3>
          <nav className="space-y-1">
            <Link href="/membres" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
              <Users className="w-4 h-4" />
              Membres
            </Link>
            <Link href="/etudiants" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
              <User className="w-4 h-4" />
              Étudiants
            </Link>
            <Link href="/rapports" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
              <FileText className="w-4 h-4" />
              Rapports
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Compte</h3>
        <nav className="space-y-1">
          <Link href="/parametres" className="flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Settings className="w-4 h-4" />
            Paramètres
          </Link>
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </nav>
      </div>
    </aside>
  );
}

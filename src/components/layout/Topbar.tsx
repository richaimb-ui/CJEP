import { Search, Bell, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Accueil</span>
        <span className="mx-2">/</span>
        <span className="text-primary font-medium">Tableau de bord</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
          Signaler un bug <HelpCircle className="w-3 h-3" />
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-white text-xs">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

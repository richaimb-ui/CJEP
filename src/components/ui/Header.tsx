import { Search, Plus, Calculator, FileText, Download, User as UserIcon, MoreHorizontal, Menu } from "lucide-react";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 px-4 md:px-6 bg-background border-b border-border flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="flex-1 flex items-center gap-4">
        <button 
          className="p-2 text-gray-500 hover:text-foreground md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>


      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            <UserIcon className="w-5 h-5 text-gray-500" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold truncate max-w-[120px]">Daniel Morales</p>
            <p className="text-xs text-gray-500">Superadmin</p>
          </div>
        </div>

        <button className="hidden sm:block p-1 text-gray-400 hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

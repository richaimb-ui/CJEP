import { User as UserIcon, Bell, ChevronDown } from "lucide-react";

export function Header({ user }: { user?: any }) {
  const firstName = user?.firstName || "Aimé Richard";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Aimé Richard BOKO";
  const userRole = user?.role || "Super Admin";

  return (
    <header className="px-6 md:px-6 bg-transparent md:bg-background md:border-b border-border flex items-center justify-between sticky top-0 z-10 w-full pt-6 md:pt-0 pb-2">
      {/* Mobile view (Zarapay style) */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <p className="text-[15px] text-gray-500 font-medium tracking-tight">Salut,</p>
          <p className="text-[15px] font-semibold text-gray-900 tracking-tight">{firstName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-orange-200/50">
            <span className="text-orange-500 text-[10px]">👑</span> {userRole}
          </div>
          <button className="relative p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
            <Bell className="w-[22px] h-[22px] stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8f9fc]"></span>
          </button>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
        </div>
      </div>
    </header>
  );
}

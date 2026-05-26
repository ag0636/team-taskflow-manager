import { FiBell, FiMenu, FiSearch } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

export default function TopNavbar() {
  const { user } = useAuth();
  const initials = user?.full_name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <button className="rounded-2xl border border-white/10 p-3 text-slate-300 lg:hidden">
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="hidden max-w-md flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-slate-400 sm:flex">
          <FiSearch className="h-5 w-5" />
          <span className="text-sm">Search projects, teammates, tasks</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <FiBell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-sm font-bold text-slate-950">
              {initials || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.full_name || "User"}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role || "member"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

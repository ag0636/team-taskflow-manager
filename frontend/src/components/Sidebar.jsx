import { FiCheckSquare, FiGrid, FiLogOut, FiUsers } from "react-icons/fi";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { label: "Projects", to: "/dashboard", icon: FiUsers },
  { label: "Tasks", to: "/dashboard", icon: FiCheckSquare },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/25">
            <FiCheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Team Task</p>
            <p className="text-xs text-slate-400">Manager workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-5 w-5 text-cyan-300 transition group-hover:scale-110" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-rose-300/40 hover:bg-rose-400/10 hover:text-rose-100"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

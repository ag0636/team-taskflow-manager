import { Outlet } from "react-router-dom";

import AnimatedBackground from "../components/AnimatedBackground";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function DashboardLayout() {
  return (
    <div className="relative min-h-screen text-white">
      <AnimatedBackground />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

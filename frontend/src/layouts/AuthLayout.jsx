import { Outlet } from "react-router-dom";

import AnimatedBackground from "../components/AnimatedBackground";

export default function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <AnimatedBackground />
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_460px]">
        <div className="hidden lg:block">
          <p className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
            FastAPI powered collaboration
          </p>
          <h1 className="max-w-2xl text-6xl font-semibold tracking-tight text-white">
            Plan projects with a team interface that feels sharp.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Sign in to manage projects, assign tasks, and keep the team moving with a focused dashboard.
          </p>
        </div>
        <Outlet />
      </section>
    </main>
  );
}

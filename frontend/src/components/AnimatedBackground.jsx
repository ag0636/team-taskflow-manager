export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.18),transparent_28%),linear-gradient(135deg,#020617_0%,#07111f_45%,#041525_100%)]" />
      <div className="absolute left-[-20%] top-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[560px] w-[560px] rounded-full bg-blue-600/10 blur-3xl animate-pulse [animation-delay:900ms]" />
      <div className="absolute inset-0 bg-grid opacity-[0.16]" />
    </div>
  );
}

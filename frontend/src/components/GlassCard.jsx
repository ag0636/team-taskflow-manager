export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`border border-white/10 bg-white/[0.07] shadow-2xl shadow-cyan-950/30 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

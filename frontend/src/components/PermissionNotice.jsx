export default function PermissionNotice({ children, className = "" }) {
  return (
    <p
      className={`rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-slate-400 ${className}`}
    >
      {children}
    </p>
  );
}

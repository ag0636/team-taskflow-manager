import { FiSearch, FiX } from "react-icons/fi";

export default function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search",
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/80 focus:ring-4 focus:ring-cyan-400/10"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <FiX className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

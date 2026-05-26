import { TASK_STATUS_FILTERS } from "../../utils/filters";
import { statusInactiveStyles, statusStyles } from "../../utils/taskDisplay";

export default function TaskStatusFilterBar({ value, onChange, className = "" }) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="group"
      aria-label="Filter tasks by status"
    >
      {TASK_STATUS_FILTERS.map((option) => {
        const isActive = value === option.value;
        const statusStyle = option.value === "all" ? null : statusStyles[option.value];

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              isActive
                ? option.value === "all"
                  ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/20"
                  : `${statusStyle} ring-1 ring-white/10`
                : statusInactiveStyles
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

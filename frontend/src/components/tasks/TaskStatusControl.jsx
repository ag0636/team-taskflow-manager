import { FiLoader } from "react-icons/fi";

import { statusInactiveStyles, statusStyles, TASK_STATUSES } from "../../utils/taskDisplay";

export default function TaskStatusControl({ status, onChange, updating = false, disabled = false }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Task status">
      {updating ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
          <FiLoader className="h-3 w-3 animate-spin text-cyan-200" />
          Saving
        </span>
      ) : null}
      {TASK_STATUSES.map((option) => {
        const isActive = status === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled || updating || isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition disabled:cursor-default ${
              isActive
                ? `${statusStyles[option.value] || statusStyles.todo} ring-1 ring-white/10`
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

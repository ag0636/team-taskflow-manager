export const priorityStyles = {
  high: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  medium: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  low: "border-white/10 bg-white/[0.06] text-slate-300",
};

export const TASK_STATUSES = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const statusStyles = {
  todo: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  in_progress: "border-blue-300/35 bg-blue-400/15 text-blue-100",
  done: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100",
};

export const statusInactiveStyles =
  "border-white/10 bg-transparent text-slate-500 hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-300";

export function formatLabel(value) {
  if (!value) {
    return "";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDueDate(dueDate) {
  if (!dueDate) {
    return "No due date";
  }

  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toDateInputValue(dueDate) {
  if (!dueDate) {
    return "";
  }

  const date = new Date(dueDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

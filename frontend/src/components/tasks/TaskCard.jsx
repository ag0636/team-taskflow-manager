import { motion } from "framer-motion";
import { FiCalendar, FiEdit2, FiFolder, FiTrash2, FiUser } from "react-icons/fi";

import { formatDueDate, formatLabel, priorityStyles } from "../../utils/taskDisplay";
import TaskStatusControl from "./TaskStatusControl";

export default function TaskCard({
  task,
  index = 0,
  compact = false,
  onEdit,
  onDelete,
  onStatusChange,
  statusUpdating = false,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ x: 4 }}
      className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white">{task.title}</h3>
          {!compact && task.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{task.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority] || priorityStyles.medium}`}
          >
            {formatLabel(task.priority)}
          </span>
          <div className="flex items-center gap-1">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit ${task.title}`}
                className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete ${task.title}`}
                className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-300/10 hover:text-rose-100"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {onStatusChange ? (
          <TaskStatusControl
            status={task.status}
            onChange={(nextStatus) => onStatusChange(task, nextStatus)}
            updating={statusUpdating}
          />
        ) : null}
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <FiCalendar className="h-3.5 w-3.5 text-cyan-200" />
          {formatDueDate(task.due_date)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <FiFolder className="h-4 w-4 text-cyan-200" />
          {task.projectName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiUser className="h-4 w-4 text-cyan-200" />
          {task.assigneeName}
        </span>
      </div>
    </motion.article>
  );
}

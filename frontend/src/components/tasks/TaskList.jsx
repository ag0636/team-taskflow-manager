import { FiInbox, FiPlus } from "react-icons/fi";

import FilterEmptyState from "../filters/FilterEmptyState";
import { getTaskPermissions } from "../../utils/projectPermissions";
import TaskCard from "./TaskCard";

export default function TaskList({
  tasks,
  loading,
  onCreateClick,
  onEdit,
  onDelete,
  onStatusChange,
  isStatusUpdating,
  projectRoles = {},
  canCreate = true,
  compact = false,
  isFiltered = false,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (!tasks.length && isFiltered) {
    return (
      <FilterEmptyState
        title="No matching tasks"
        description="Adjust your search or status filter to find tasks in this list."
      />
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/5 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
          <FiInbox className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">No tasks yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Create a task in one of your projects to start tracking work with your team.
        </p>
        {onCreateClick && canCreate ? (
          <button
            type="button"
            onClick={onCreateClick}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            <FiPlus className="h-5 w-5" />
            Create task
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => {
        const { canDelete, canFullEdit, canUpdateStatus } = getTaskPermissions(task, projectRoles);

        return (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            compact={compact}
            onEdit={canFullEdit ? onEdit : undefined}
            onDelete={canDelete ? onDelete : undefined}
            onStatusChange={canUpdateStatus ? onStatusChange : undefined}
            statusUpdating={isStatusUpdating?.(task.id) ?? false}
          />
        );
      })}
    </div>
  );
}

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiFolder, FiPlus } from "react-icons/fi";

import SearchField from "../components/filters/SearchField";
import TaskStatusFilterBar from "../components/filters/TaskStatusFilterBar";
import PermissionNotice from "../components/PermissionNotice";
import GlassCard from "../components/GlassCard";
import ProjectMemberList from "../components/projects/ProjectMemberList";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";
import TaskList from "../components/tasks/TaskList";
import TaskModal from "../components/tasks/TaskModal";
import { useAuth } from "../context/AuthContext";
import useProjectDetail from "../hooks/useProjectDetail";
import useTasks from "../hooks/useTasks";
import { notifyDashboardSummaryRefresh } from "../utils/dashboardEvents";
import { filterTasks, TASK_STATUS_FILTER_ALL } from "../utils/filters";
import {
  canCreateTask,
  canManageProjectMembers,
  getTaskPermissions,
  inferProjectRole,
} from "../utils/projectPermissions";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const { user } = useAuth();
  const { project, members, loading: projectLoading, notFound } = useProjectDetail(id);
  const {
    tasks,
    loading: tasksLoading,
    creating: creatingTask,
    updating: updatingTask,
    deleting,
    addTask,
    editTask,
    removeTask,
    updateTaskStatus,
    isStatusUpdating,
  } = useTasks(project ? [project] : [], user);

  const userRole = useMemo(() => {
    if (!project) {
      return null;
    }

    return inferProjectRole(project, user?.id, members, tasks);
  }, [project, user?.id, members, tasks]);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState(TASK_STATUS_FILTER_ALL);

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project_id === projectId),
    [tasks, projectId],
  );

  const filteredProjectTasks = useMemo(
    () => filterTasks(projectTasks, { searchQuery: taskSearch, statusFilter: taskStatusFilter }),
    [projectTasks, taskSearch, taskStatusFilter],
  );

  const isTaskFiltered =
    taskSearch.trim().length > 0 || taskStatusFilter !== TASK_STATUS_FILTER_ALL;

  const projectRoles = useMemo(
    () => (project && userRole ? { [project.id]: userRole } : {}),
    [project, userRole],
  );

  const canCreate = canCreateTask(userRole);
  const canManageMembers = canManageProjectMembers(userRole);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    if (!getTaskPermissions(task, projectRoles).canFullEdit) {
      return;
    }

    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (payload, taskId) => {
    if (taskId) {
      await editTask(taskId, payload);
    } else {
      await addTask({ ...payload, project_id: projectId });
    }
    notifyDashboardSummaryRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) {
      return;
    }

    await removeTask(deletingTask.id);
    setDeletingTask(null);
    notifyDashboardSummaryRefresh();
  };

  const handleStatusChange = async (task, nextStatus) => {
    try {
      await updateTaskStatus(task.id, nextStatus);
      notifyDashboardSummaryRefresh();
    } catch {
      // Error toast handled in hook.
    }
  };

  const taskModalSaving = editingTask ? updatingTask : creatingTask;
  const tasksSectionLoading = Boolean(project) && tasksLoading;

  if (notFound) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <GlassCard className="rounded-[2rem] p-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Project not found</h1>
          <p className="mt-3 text-sm text-slate-400">
            This project does not exist or you do not have access to it.
          </p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-7xl"
    >
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {projectLoading ? (
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
            <div className="h-64 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]" />
          </div>
        </div>
      ) : (
        <>
          <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                <FiFolder className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Project</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {project.name}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  {project.description || "No description yet."}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <GlassCard className="rounded-[2rem] p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Members</h2>
                <p className="text-sm text-slate-400">People with access to this project.</p>
              </div>
              <ProjectMemberList
                members={members}
                loading={projectLoading}
                canManageMembers={canManageMembers}
              />
            </GlassCard>

            <GlassCard className="rounded-[2rem] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Tasks</h2>
                  <p className="text-sm text-slate-400">Work tracked in this project.</p>
                </div>
                {canCreate ? (
                  <button
                    type="button"
                    onClick={openCreateTask}
                    disabled={!project}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiPlus className="h-5 w-5" />
                    Create Task
                  </button>
                ) : null}
              </div>

              {!canCreate ? (
                <PermissionNotice className="mb-4">
                  You can update task status on assigned work. Creating or deleting tasks requires owner
                  or manager access.
                </PermissionNotice>
              ) : null}

              <div className="mb-4 space-y-3">
                <SearchField
                  value={taskSearch}
                  onChange={setTaskSearch}
                  placeholder="Search tasks in this project..."
                  ariaLabel="Search project tasks"
                />
                <TaskStatusFilterBar value={taskStatusFilter} onChange={setTaskStatusFilter} />
              </div>

              <TaskList
                tasks={filteredProjectTasks}
                loading={tasksSectionLoading}
                onCreateClick={canCreate ? openCreateTask : undefined}
                onEdit={openEditTask}
                onDelete={setDeletingTask}
                onStatusChange={handleStatusChange}
                isStatusUpdating={isStatusUpdating}
                projectRoles={projectRoles}
                canCreate={canCreate}
                isFiltered={isTaskFiltered}
              />
            </GlassCard>
          </section>
        </>
      )}

      {project ? (
        <>
          <TaskModal
            open={taskModalOpen}
            onClose={closeTaskModal}
            onSubmit={handleTaskSubmit}
            saving={taskModalSaving}
            projects={[project]}
            task={editingTask}
            defaultProjectId={projectId}
          />

          <DeleteTaskModal
            open={Boolean(deletingTask)}
            task={deletingTask}
            deleting={deleting}
            onClose={() => setDeletingTask(null)}
            onConfirm={handleConfirmDelete}
          />
        </>
      ) : null}
    </motion.div>
  );
}

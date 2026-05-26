import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiAlertCircle, FiCheckCircle, FiClock, FiList, FiPlus, FiTrendingUp } from "react-icons/fi";

import API from "../api/axios";
import SearchField from "../components/filters/SearchField";
import TaskStatusFilterBar from "../components/filters/TaskStatusFilterBar";
import GlassCard from "../components/GlassCard";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectGrid from "../components/projects/ProjectGrid";
import StatCard from "../components/StatCard";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";
import TaskList from "../components/tasks/TaskList";
import TaskModal from "../components/tasks/TaskModal";
import { useAuth } from "../context/AuthContext";
import PermissionNotice from "../components/PermissionNotice";
import useProjectRoles from "../hooks/useProjectRoles";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import { DASHBOARD_SUMMARY_REFRESH_EVENT } from "../utils/dashboardEvents";
import { filterProjects, filterTasks, TASK_STATUS_FILTER_ALL } from "../utils/filters";
import { getTaskPermissions } from "../utils/projectPermissions";

const defaultSummary = {
  total_tasks: 0,
  todo: 0,
  in_progress: 0,
  done: 0,
  overdue_tasks: 0,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState(TASK_STATUS_FILTER_ALL);
  const {
    projects,
    loading: projectsLoading,
    creating: creatingProject,
    addProject,
  } = useProjects(user);
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
  } = useTasks(projects, user);
  const { projectRoles, canCreateTasksAnywhere, creatableProjects } = useProjectRoles(
    projects,
    tasks,
    user?.id,
  );

  const refreshSummary = useCallback(async () => {
    try {
      const { data } = await API.get("/dashboard/summary");
      setSummary(data);
    } catch {
      setSummary(defaultSummary);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const { data } = await API.get("/dashboard/summary");
        if (mounted) {
          setSummary(data);
        }
      } catch {
        if (mounted) {
          setSummary(defaultSummary);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    const handleSummaryRefresh = () => {
      refreshSummary();
    };

    window.addEventListener(DASHBOARD_SUMMARY_REFRESH_EVENT, handleSummaryRefresh);

    return () => {
      mounted = false;
      window.removeEventListener(DASHBOARD_SUMMARY_REFRESH_EVENT, handleSummaryRefresh);
    };
  }, [refreshSummary]);

  const filteredProjects = useMemo(
    () => filterProjects(projects, projectSearch),
    [projects, projectSearch],
  );

  const filteredTasks = useMemo(
    () => filterTasks(tasks, { searchQuery: taskSearch, statusFilter: taskStatusFilter }),
    [tasks, taskSearch, taskStatusFilter],
  );

  const isProjectFiltered = projectSearch.trim().length > 0;
  const isTaskFiltered =
    taskSearch.trim().length > 0 || taskStatusFilter !== TASK_STATUS_FILTER_ALL;

  const stats = useMemo(
    () => [
      { label: "Total tasks", value: summary.total_tasks, icon: FiList, tone: "cyan" },
      { label: "In progress", value: summary.in_progress, icon: FiClock, tone: "blue" },
      { label: "Completed", value: summary.done, icon: FiCheckCircle, tone: "cyan" },
      { label: "Overdue", value: summary.overdue_tasks, icon: FiAlertCircle, tone: "blue" },
    ],
    [summary],
  );

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
      await addTask(payload);
    }

    await refreshSummary();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) {
      return;
    }

    await removeTask(deletingTask.id);
    setDeletingTask(null);
    await refreshSummary();
  };

  const handleStatusChange = async (task, nextStatus) => {
    try {
      await updateTaskStatus(task.id, nextStatus);
      await refreshSummary();
    } catch {
      // Error toast handled in hook.
    }
  };

  const taskModalSaving = editingTask ? updatingTask : creatingTask;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-7xl"
    >
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome, {user?.full_name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Track the team's work, review project movement, and keep attention on the tasks that need momentum.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-cyan-100">
            <FiTrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">{loading ? "Syncing stats" : `${summary.todo} tasks waiting`}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Projects</h2>
              <p className="text-sm text-slate-400">Live projects from your FastAPI workspace.</p>
            </div>
            <button
              type="button"
              onClick={() => setProjectModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              <FiPlus className="h-5 w-5" />
              New
            </button>
          </div>

          <div className="mb-4">
            <SearchField
              value={projectSearch}
              onChange={setProjectSearch}
              placeholder="Search projects by name or description..."
              ariaLabel="Search projects"
            />
          </div>

          <ProjectGrid
            projects={filteredProjects}
            loading={projectsLoading}
            onCreateClick={() => setProjectModalOpen(true)}
            isFiltered={isProjectFiltered}
          />
        </GlassCard>

        <GlassCard className="rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Task focus</h2>
              <p className="text-sm text-slate-400">Tasks from your workspace, synced from the API.</p>
            </div>
            {canCreateTasksAnywhere ? (
              <button
                type="button"
                onClick={openCreateTask}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/15"
              >
                <FiPlus className="h-5 w-5" />
                Create Task
              </button>
            ) : null}
          </div>

          {!canCreateTasksAnywhere ? (
            <PermissionNotice className="mb-4">
              Project members can view tasks and update status on assigned work. Creating tasks requires
              owner or manager access.
            </PermissionNotice>
          ) : null}

          <div className="mb-4 space-y-3">
            <SearchField
              value={taskSearch}
              onChange={setTaskSearch}
              placeholder="Search tasks..."
              ariaLabel="Search tasks"
            />
            <TaskStatusFilterBar value={taskStatusFilter} onChange={setTaskStatusFilter} />
          </div>

          <TaskList
            tasks={filteredTasks}
            loading={tasksLoading}
            onCreateClick={canCreateTasksAnywhere ? openCreateTask : undefined}
            onEdit={openEditTask}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
            isStatusUpdating={isStatusUpdating}
            projectRoles={projectRoles}
            canCreate={canCreateTasksAnywhere}
            isFiltered={isTaskFiltered}
          />
        </GlassCard>
      </section>

      <CreateProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={addProject}
        creating={creatingProject}
      />

      <TaskModal
        open={taskModalOpen}
        onClose={closeTaskModal}
        onSubmit={handleTaskSubmit}
        saving={taskModalSaving}
        projects={creatableProjects}
        task={editingTask}
      />

      <DeleteTaskModal
        open={Boolean(deletingTask)}
        task={deletingTask}
        deleting={deleting}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}

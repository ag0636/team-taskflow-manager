import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createTask, deleteTask, getTasks, getUsers, updateTask } from "../api/tasks";
import { getErrorMessage } from "../utils/apiErrors";

function buildUserMap(users) {
  return new Map(users.map((user) => [user.id, user]));
}

function buildProjectMap(projects) {
  return new Map(projects.map((project) => [project.id, project]));
}

function resolveAssigneeName(assignedTo, usersById, currentUser) {
  if (assignedTo == null) {
    return "Unassigned";
  }

  if (currentUser?.id === assignedTo) {
    return currentUser.full_name || "You";
  }

  return usersById.get(assignedTo)?.full_name || `User #${assignedTo}`;
}

function enrichTasks(taskList, users, projects, currentUser) {
  const usersById = buildUserMap(users);
  const projectsById = buildProjectMap(projects);

  return taskList.map((task) => ({
    ...task,
    assigneeName: resolveAssigneeName(task.assigned_to, usersById, currentUser),
    projectName: projectsById.get(task.project_id)?.name || `Project #${task.project_id}`,
  }));
}

export default function useTasks(projects, currentUser) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingIds, setStatusUpdatingIds] = useState(() => new Set());

  const loadTasks = useCallback(async () => {
    setLoading(true);

    try {
      const [taskList, users] = await Promise.all([getTasks(), getUsers()]);
      setTasks(enrichTasks(taskList, users, projects, currentUser));
    } catch {
      toast.error("Unable to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projects, currentUser?.id, currentUser?.full_name]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (payload) => {
    setCreating(true);

    try {
      await createTask(payload);
      toast.success("Task created");
      await loadTasks();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create task"));
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const editTask = async (taskId, payload) => {
    setUpdating(true);

    try {
      await updateTask(taskId, payload);
      toast.success("Task updated");
      await loadTasks();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update task"));
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const removeTask = async (taskId) => {
    setDeleting(true);

    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      await loadTasks();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete task"));
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || task.status === status) {
      return;
    }

    const previousTasks = tasks;

    setStatusUpdatingIds((current) => new Set(current).add(taskId));
    setTasks((current) =>
      current.map((item) => (item.id === taskId ? { ...item, status } : item)),
    );

    try {
      const updated = await updateTask(taskId, { status });
      setTasks((current) =>
        current.map((item) =>
          item.id === taskId
            ? {
                ...item,
                ...updated,
                assigneeName: item.assigneeName,
                projectName: item.projectName,
              }
            : item,
        ),
      );
    } catch (error) {
      setTasks(previousTasks);
      toast.error(getErrorMessage(error, "Unable to update status"));
      throw error;
    } finally {
      setStatusUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    }
  };

  const isStatusUpdating = (taskId) => statusUpdatingIds.has(taskId);

  return {
    tasks,
    loading,
    creating,
    updating,
    deleting,
    refreshTasks: loadTasks,
    addTask,
    editTask,
    removeTask,
    updateTaskStatus,
    isStatusUpdating,
  };
}

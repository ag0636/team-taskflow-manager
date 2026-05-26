export const TASK_STATUS_FILTER_ALL = "all";

export const TASK_STATUS_FILTERS = [
  { value: TASK_STATUS_FILTER_ALL, label: "All" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export function normalizeSearchQuery(query) {
  return query.trim().toLowerCase();
}

export function filterProjects(projects, searchQuery) {
  const query = normalizeSearchQuery(searchQuery);

  if (!query) {
    return projects;
  }

  return projects.filter((project) => {
    const name = project.name?.toLowerCase() || "";
    const description = project.description?.toLowerCase() || "";

    return name.includes(query) || description.includes(query);
  });
}

export function filterTasks(tasks, { searchQuery = "", statusFilter = TASK_STATUS_FILTER_ALL } = {}) {
  let result = tasks;

  if (statusFilter && statusFilter !== TASK_STATUS_FILTER_ALL) {
    result = result.filter((task) => task.status === statusFilter);
  }

  const query = normalizeSearchQuery(searchQuery);

  if (!query) {
    return result;
  }

  return result.filter((task) => {
    const title = task.title?.toLowerCase() || "";
    const description = task.description?.toLowerCase() || "";
    const projectName = task.projectName?.toLowerCase() || "";
    const assigneeName = task.assigneeName?.toLowerCase() || "";

    return (
      title.includes(query) ||
      description.includes(query) ||
      projectName.includes(query) ||
      assigneeName.includes(query)
    );
  });
}

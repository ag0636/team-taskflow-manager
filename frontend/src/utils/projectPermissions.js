export const PROJECT_ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  MEMBER: "member",
};

export function isProjectOwner(role) {
  return role === PROJECT_ROLES.OWNER;
}

export function isProjectManager(role) {
  return role === PROJECT_ROLES.MANAGER;
}

export function isOwnerOrManager(role) {
  return role === PROJECT_ROLES.OWNER || role === PROJECT_ROLES.MANAGER;
}

export function canCreateTask(role) {
  return isOwnerOrManager(role);
}

export function canDeleteTask(role) {
  return isProjectOwner(role);
}

export function canManageProjectMembers(role) {
  return isProjectOwner(role);
}

export function canFullyEditTask(role) {
  return isOwnerOrManager(role);
}

export function canUpdateTaskStatus(role) {
  return Boolean(role);
}

export function resolveBaseProjectRole(project, currentUserId, members = []) {
  if (!project || !currentUserId) {
    return null;
  }

  if (project.owner_id === currentUserId) {
    return PROJECT_ROLES.OWNER;
  }

  const isListedMember = members.some((member) => member.id === currentUserId);

  if (isListedMember || project.userRole) {
    return PROJECT_ROLES.MEMBER;
  }

  return null;
}

/**
 * Managers can list all project tasks; members only see tasks assigned to them.
 * If the user sees another member's task in a project, treat them as a manager.
 */
export function inferProjectRole(project, currentUserId, members = [], tasks = []) {
  const baseRole = resolveBaseProjectRole(project, currentUserId, members);

  if (!baseRole || baseRole === PROJECT_ROLES.OWNER) {
    return baseRole;
  }

  const projectTasks = tasks.filter((task) => task.project_id === project.id);
  const seesTeamTasks = projectTasks.some(
    (task) => task.assigned_to == null || task.assigned_to !== currentUserId,
  );

  if (seesTeamTasks) {
    return PROJECT_ROLES.MANAGER;
  }

  return PROJECT_ROLES.MEMBER;
}

export function buildProjectRolesMap(projects, tasks, currentUserId, membersByProjectId = {}) {
  const roles = {};

  projects.forEach((project) => {
    const members = membersByProjectId[project.id] || [];
    roles[project.id] = inferProjectRole(project, currentUserId, members, tasks);
  });

  return roles;
}

export function getTaskPermissions(task, projectRolesMap) {
  const role = projectRolesMap[task.project_id] || null;

  return {
    projectRole: role,
    canDelete: canDeleteTask(role),
    canFullEdit: canFullyEditTask(role),
    canUpdateStatus: canUpdateTaskStatus(role),
  };
}

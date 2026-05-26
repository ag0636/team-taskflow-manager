import { useMemo } from "react";

import { buildProjectRolesMap, canCreateTask } from "../utils/projectPermissions";

export default function useProjectRoles(projects, tasks, currentUserId) {
  const projectRoles = useMemo(
    () => buildProjectRolesMap(projects, tasks, currentUserId),
    [projects, tasks, currentUserId],
  );

  const canCreateTasksAnywhere = useMemo(
    () => Object.values(projectRoles).some((role) => canCreateTask(role)),
    [projectRoles],
  );

  const creatableProjects = useMemo(
    () => projects.filter((project) => canCreateTask(projectRoles[project.id])),
    [projects, projectRoles],
  );

  return {
    projectRoles,
    canCreateTasksAnywhere,
    creatableProjects,
  };
}

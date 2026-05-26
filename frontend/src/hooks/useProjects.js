import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createProject, getProjectMembers, getProjects } from "../api/projects";
import { PROJECT_ROLES, resolveBaseProjectRole } from "../utils/projectPermissions";

export default function useProjects(currentUser) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);

    try {
      const projectList = await getProjects();
      const enrichedProjects = await Promise.all(
        projectList.map(async (project) => {
          try {
            const members = await getProjectMembers(project.id);
            return {
              ...project,
              memberCount: members.length,
              members,
              userRole:
                resolveBaseProjectRole(project, currentUser?.id, members) || PROJECT_ROLES.MEMBER,
            };
          } catch {
            return {
              ...project,
              memberCount: project.owner_id === currentUser?.id ? 1 : 0,
              members: [],
              userRole:
                resolveBaseProjectRole(project, currentUser?.id, []) || PROJECT_ROLES.MEMBER,
            };
          }
        }),
      );

      setProjects(enrichedProjects);
    } catch {
      toast.error("Unable to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const addProject = async ({ name, description }) => {
    setCreating(true);

    try {
      await createProject({ name, description });
      toast.success("Project created");
      await loadProjects();
    } finally {
      setCreating(false);
    }
  };

  return {
    projects,
    loading,
    creating,
    refreshProjects: loadProjects,
    addProject,
  };
}

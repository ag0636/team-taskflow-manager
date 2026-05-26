import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getProject, getProjectMembers } from "../api/projects";

export default function useProjectDetail(projectId) {
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const [projectData, memberList] = await Promise.all([
        getProject(projectId),
        getProjectMembers(projectId),
      ]);
      setProject(projectData);
      setMembers(memberList);
    } catch (error) {
      if (error.response?.status === 404) {
        setNotFound(true);
        setProject(null);
        setMembers([]);
      } else {
        toast.error("Unable to load project");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return {
    project,
    members,
    loading,
    notFound,
    refreshProject: loadProject,
  };
}

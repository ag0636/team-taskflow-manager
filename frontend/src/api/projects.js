import API from "./axios";

export async function getProjects() {
  const { data } = await API.get("/projects");
  return data;
}

export async function getProject(projectId) {
  const { data } = await API.get(`/projects/${projectId}`);
  return data;
}

export async function getProjectMembers(projectId) {
  const { data } = await API.get(`/projects/${projectId}/members`);
  return data;
}

export async function createProject(payload) {
  const { data } = await API.post("/projects", payload);
  return data;
}

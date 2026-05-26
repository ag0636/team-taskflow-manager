import API from "./axios";

export async function getTasks() {
  const { data } = await API.get("/tasks");
  return data;
}

export async function getUsers() {
  const { data } = await API.get("/users/");
  return data;
}

export async function createTask(payload) {
  const { data } = await API.post("/tasks", payload);
  return data;
}

export async function updateTask(taskId, payload) {
  const { data } = await API.put(`/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId) {
  await API.delete(`/tasks/${taskId}`);
}

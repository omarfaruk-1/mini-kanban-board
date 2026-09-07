import { apiFetch } from "./api";
export const taskService = {
  async createTask(columnId, data) {
    const r = await apiFetch(`/tasks/${columnId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return r.data?.task;
  },
  async getTasks(columnId) {
    const r = await apiFetch(`/tasks/column/${columnId}`);
    return r.data?.tasks || [];
  },
  async getTask(id) {
    const r = await apiFetch(`/tasks/${id}`);
    return r.data?.task;
  },
  async updateTask(id, data) {
    const r = await apiFetch(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return r.data?.task;
  },
  async deleteTask(id) {
    return apiFetch(`/tasks/${id}`, { method: "DELETE" });
  },
  async moveTask(id, data) {
    const r = await apiFetch(`/tasks/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return r.data?.task;
  },
};

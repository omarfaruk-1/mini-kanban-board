import { apiFetch } from "./api";
export const columnService = {
  async createColumn(boardId, data) { const r = await apiFetch(`/columns/${boardId}`, {method:"POST", body:JSON.stringify(data)}); return r.data?.column; },
  async getColumns(boardId) { const r = await apiFetch(`/columns/${boardId}`); return r.data?.columns || []; },
  async updateColumn(id, data) { const r = await apiFetch(`/columns/columns/${id}`, {method:"PATCH", body:JSON.stringify(data)}); return r.data?.column; },
  async deleteColumn(id) { return apiFetch(`/columns/columns/${id}`, {method:"DELETE"}); }
};

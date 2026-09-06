import { apiFetch } from "./api";
export const boardService = {
  async getBoards() {
    const r = await apiFetch("/boards");
    return r.data?.boards || [];
  },
  async getBoard(id) {
    const r = await apiFetch(`/boards/${id}`);
    return r.data?.board;
  },
  async createBoard(data) {
    const r = await apiFetch("/boards", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return r.data?.board;
  },
  async updateBoard(id, data) {
    const r = await apiFetch(`/boards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return r.data?.board;
  },
  async deleteBoard(id) {
    return apiFetch(`/boards/${id}`, { method: "DELETE" });
  },
};

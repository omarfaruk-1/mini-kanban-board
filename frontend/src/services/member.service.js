import { apiFetch } from "./api";
export const memberService = {
  async add(boardId, email) {
    const r = await apiFetch(`/board-members/${boardId}`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return r.data?.member;
  },
  async remove(boardId, userId) {
    return apiFetch(`/board-members/${boardId}/members/${userId}`, {
      method: "DELETE",
    });
  },
};

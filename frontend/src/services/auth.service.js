import { apiFetch } from "./api";
export const authService = {
  async register(data) {
    const r = await apiFetch("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return r.data?.user || r.data;
  },
  async verifyEmail(token) {
    const r = await apiFetch(
      `/users/verify-email?token=${encodeURIComponent(token)}`,
      { method: "POST" },
    );
    return r;
  },
  async resendVerificationEmail(email) {
    return apiFetch("/users/resend-verification-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async login(data) {
    const r = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return r.data;
  },
  async refresh() {
    const r = await apiFetch("/users/refresh-token", { method: "POST" }, false);
    return r.data;
  },
  async logout(token) {
    return apiFetch("/users/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  async getMe() {
    return null;
  },
};

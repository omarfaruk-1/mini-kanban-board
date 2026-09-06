const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let getAccessToken = () => null;

export function configureApi({ tokenGetter }) {
  getAccessToken = tokenGetter;
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      payload.message ||
        payload.error ||
        "Something went wrong",
    );

    error.status = response.status;

    throw error;
  }

  return payload;
}
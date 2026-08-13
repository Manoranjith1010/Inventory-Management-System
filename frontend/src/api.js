const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const request = async (path, { method = "GET", token, body } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
  dashboard: (token) => request("/dashboard", { token }),
  products: (token, query = "") => request(`/products${query ? `?${query}` : ""}`, { token }),
  createProduct: (token, payload) => request("/products", { method: "POST", token, body: payload }),
  deleteProduct: (token, id) => request(`/products/${id}`, { method: "DELETE", token }),
  notifications: (token) => request("/notifications", { token }),
};

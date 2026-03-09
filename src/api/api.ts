/**
 * Central API helper for all backend requests.
 *
 * VITE_API_URL must include the /api suffix:
 *   Example: https://luxecart-e-commerce.onrender.com/api
 *
 * In development:  VITE_API_URL = "http://localhost:3000/api" (set in .env.local)
 * In production:   VITE_API_URL = "https://luxecart-e-commerce.onrender.com/api"
 *
 * All paths below are relative to the API base (no /api prefix needed in paths).
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Generic fetch wrapper with error handling */
async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Request failed: ${res.status}`);
    }
    return res.json();
}

// ── Products ────────────────────────────────────────────────────────────────
export const getProducts = (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return apiFetch(`/products${qs}`);
};

export const getProductById = (id: string | number) =>
    apiFetch(`/products/${id}`);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (email: string, password: string) =>
    apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

export const registerUser = (name: string, email: string, password: string) =>
    apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

// ── Blog ─────────────────────────────────────────────────────────────────────
export const getBlogPosts = () => apiFetch("/blog");
export const getAllBlogPosts = () => apiFetch("/blog/admin/all");

// ── Team ─────────────────────────────────────────────────────────────────────
export const getTeamMembers = () => apiFetch("/team");

// ── Orders ───────────────────────────────────────────────────────────────────
export const getMyOrders = (token: string) =>
    apiFetch("/orders/myorders", {
        headers: { Authorization: `Bearer ${token}` },
    });

// ── Newsletter ────────────────────────────────────────────────────────────────
export const subscribeNewsletter = (email: string) =>
    apiFetch("/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

// ── Contact / Messages ────────────────────────────────────────────────────────
export const sendContactMessage = (data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
}) =>
    apiFetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

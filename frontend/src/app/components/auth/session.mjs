function csrfToken() {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie.split("; ").find((part) => part.startsWith("csrf_token="));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

export function authenticatedFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) headers.set("X-CSRF-Token", csrfToken());
  return fetch(url, { ...options, headers, credentials: "include" });
}

export function storeSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

export async function refreshSession() {
  const response = await authenticatedFetch(process.env.NEXT_PUBLIC_API_REFRESH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()).token;
}

export async function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  await authenticatedFetch(process.env.NEXT_PUBLIC_API_LOGOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => {});
}

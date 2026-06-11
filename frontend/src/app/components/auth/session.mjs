export function storeSession({ token, refreshToken }) {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
}

export async function refreshSession() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Session expired");
  const response = await fetch(process.env.NEXT_PUBLIC_API_REFRESH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) throw new Error(await response.text());
  const session = await response.json();
  storeSession(session);
  return session.token;
}

export async function clearSession() {
  const refreshToken = localStorage.getItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  if (refreshToken) {
    await fetch(process.env.NEXT_PUBLIC_API_LOGOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
}

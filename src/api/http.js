// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// export async function http(path, options = {}) {
//   const res = await fetch(`${API_URL}${path}`, {
//     headers: { "Content-Type": "application/json", ...(options.headers || {}) },
//     ...options,
//   });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(text || `HTTP ${res.status}`);
//   }
//   return res.status === 204 ? null : res.json();
// }
const API_URL = "/api";

export async function http(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}
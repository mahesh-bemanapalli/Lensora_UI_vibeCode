import { jwtDecode } from "jwt-decode";

export function currentRole() {
  try {
    const token = jwtDecode(localStorage.getItem("lensora_token"));
    if (!Number.isFinite(token.exp) || token.exp * 1000 <= Date.now()) return null;
    return token.role ?? token["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? null;
  } catch { return null; }
}

import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { currentRole } from "../lib/auth";

export function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = localStorage.getItem("lensora_token");
  try {
    if (!token || !Number.isFinite(jwtDecode(token).exp) || jwtDecode(token).exp * 1000 <= Date.now()) throw new Error();
    if (role && currentRole() !== role) return <Navigate to="/admin/profile" replace />;
    return children;
  } catch {
    localStorage.removeItem("lensora_token");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
}

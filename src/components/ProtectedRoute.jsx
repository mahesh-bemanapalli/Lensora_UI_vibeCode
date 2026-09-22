import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("lensora_token");
  try {
    if (!token || jwtDecode(token).exp * 1000 <= Date.now()) throw new Error();
    return children;
  } catch {
    localStorage.removeItem("lensora_token");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
}

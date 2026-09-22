import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";

export function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  async function login(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/auth/login",

        { email: fields.get("email"), password: fields.get("password") },
      );
      localStorage.setItem("lensora_token", data.token);
      navigate(location.state?.from ?? "/admin/bookings", { replace: true });
      console.log("data.", data);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={login}>
        <p className="eyebrow dark">Lensora studio</p>
        <h1>Welcome back.</h1>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button className="button dark" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  );
}

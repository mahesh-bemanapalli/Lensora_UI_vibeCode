import { Link, NavLink, useNavigate } from "react-router-dom";

export function AdminNav() {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("lensora_token");
    navigate("/login");
  }
  return (
    <header className="dashboard-header">
      <Link className="brand dark-brand" to="/">
        LENSORA
      </Link>
      <nav className="dashboard-nav">
        <NavLink to="/admin/bookings">Bookings</NavLink>
        <NavLink to="/admin/profile">Profile</NavLink>
        <NavLink to="/admin/portfolio">Portfolio</NavLink>
        <NavLink to="/admin/gear">Gear</NavLink>
        <NavLink to="/admin/packages">Packages</NavLink>
      </nav>
      <button className="text-button" onClick={logout}>
        Sign out
      </button>
    </header>
  );
}

import { Link, NavLink, useNavigate } from "react-router-dom";
import { currentRole } from "../lib/auth";
import { useEffect, useState } from "react";
import api from "../lib/api";

export function AdminNav({ publicSlug }) {
  const navigate = useNavigate();
  const [profileSlug, setProfileSlug] = useState(null);
  useEffect(() => {
    let active = true;
    api.get("/admin/profile")
      .then(({ data }) => { if (active) setProfileSlug(data.slug); })
      .catch(() => { if (active) setProfileSlug(null); });
    return () => { active = false; };
  }, []);
  const slug = publicSlug || profileSlug;
  const home = slug ? `/${encodeURIComponent(slug)}` : currentRole() === "SuperAdmin" ? "/platform/photographers" : "/admin/profile";
  function logout() {
    localStorage.removeItem("lensora_token");
    navigate("/login");
  }
  return (
    <header className="dashboard-header">
      <Link className="brand dark-brand" to={home}>
        LENSORA
      </Link>
      <nav className="dashboard-nav">
        {currentRole() === "SuperAdmin" && <NavLink to="/platform/photographers">Photographers</NavLink>}
        <NavLink to="/admin/bookings">Bookings</NavLink>
        <NavLink to="/admin/profile">Profile</NavLink>
        <NavLink to="/admin/portfolio">Portfolio</NavLink>
        <NavLink to="/admin/media">Media library</NavLink>
        <NavLink to="/admin/gear">Gear</NavLink>
        <NavLink to="/admin/packages">Packages</NavLink>
      </nav>
      <button className="text-button" onClick={logout}>
        Sign out
      </button>
    </header>
  );
}

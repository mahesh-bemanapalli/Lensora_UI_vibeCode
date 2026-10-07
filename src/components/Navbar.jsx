import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navbar({ slug, hasPackages }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!location.hash) return undefined;
    const sectionId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <Link className="brand" to={`/${slug}`} onClick={closeMenu}>
        LENSORA
      </Link>
      <button
        className={`nav-toggle${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
        <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
      </button>
      <nav id="site-navigation" className={menuOpen ? "is-open" : ""} aria-label="Main navigation">
        <Link to={`/${slug}#portfolio`} onClick={closeMenu}>Portfolio</Link>
        <Link to={`/${slug}#about`} onClick={closeMenu}>About</Link>
        <Link to={`/${slug}#gear`} onClick={closeMenu}>Gear</Link>
        {hasPackages && <Link to={`/${slug}#packages`} onClick={closeMenu}>Packages</Link>}
        <Link to={`/${slug}#booking`} onClick={closeMenu}>Book</Link>
        {localStorage.getItem("lensora_token") && (
          <Link className="admin-link" to="/admin/bookings" onClick={closeMenu}>
            Dashboard
          </Link>
        )}
      </nav>
    </header>
  );
}

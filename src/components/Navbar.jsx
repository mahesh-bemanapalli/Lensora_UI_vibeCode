import { Link } from "react-router-dom";

export function Navbar({ slug, hasPackages }) {
  return (
    <header className="navbar">
      <Link className="brand" to={`/${slug}`}>
        LENSORA
      </Link>
      <nav>
        <a href="#portfolio">Portfolio</a>
        <a href="#about">About</a>
        <a href="#gear">Gear</a>
        {hasPackages && <a href="#packages">Packages</a>}
        <a href="#booking">Book</a>
        {localStorage.getItem("lensora_token") && (
          <Link className="admin-link" to="/admin/bookings">
            Dashboard
          </Link>
        )}
      </nav>
    </header>
  );
}

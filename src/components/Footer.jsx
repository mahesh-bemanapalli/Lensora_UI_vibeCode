export function Footer({ photographerName, location }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div>
            <p className="eyebrow">The next chapter</p>
            <h2>Let’s make something<br />worth remembering.</h2>
            <a className="footer-cta" href="#booking">
              Start a conversation <span aria-hidden="true">↗</span>
            </a>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <p className="eyebrow">Explore</p>
            <a href="#portfolio">Portfolio</a>
            <a href="#about">About</a>
            <a href="#gear">Gear</a>
            <a href="#booking">Book a session</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <a className="brand" href="#top" aria-label="Lensora, back to top">LENSORA</a>
          <p>© {new Date().getFullYear()} {photographerName}. All rights reserved.</p>
          {location && <p>{location}</p>}
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

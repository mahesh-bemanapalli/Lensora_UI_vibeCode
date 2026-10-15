import { Link } from "react-router-dom";
import { ResponsiveImage } from "../../components/ResponsiveImage";
import { BookingForm } from "../components/BookingForm";
import "./minimal-gallery.css";

export function MinimalGalleryTemplate({ site, booking }) {
  const { profile, slug, categorySlug, selectedCategory, portfolioItems, heroImage, linkSearch = "" } = site;
  const home = `/${slug}${linkSearch}`;
  const categories = profile.portfolioCategories;
  const gallery = categorySlug ? portfolioItems : profile.portfolio;
  const WorkHeading = categorySlug ? "h1" : "h2";

  return (
    <main id="top" className="minimal-gallery">
      <div className="mg-shell">
        <header className="mg-header">
          <Link className="mg-wordmark" to={home}>{profile.name}</Link>
          <nav aria-label="Main navigation">
            <Link to={`${home}#portfolio`}>Work</Link>
            <Link to={`${home}#about`}>About</Link>
            {profile.packages.length > 0 && <Link to={`${home}#packages`}>Packages</Link>}
            <Link to={`${home}#booking`}>Get in touch ↗</Link>
          </nav>
        </header>

        {!categorySlug && <section className="mg-intro" aria-labelledby="mg-title">
          <div>
            <p className="mg-kicker">Independent photographer{profile.location && ` / ${profile.location}`}</p>
            <h1 id="mg-title">A considered eye.<br />A lasting impression.</h1>
            <p className="mg-bio">{profile.bio || "Photographs of people, places, and the moments in between."}</p>
            <a className="mg-text-link" href="#portfolio">View selected work <span aria-hidden="true">↓</span></a>
          </div>
          {heroImage && <figure className="mg-intro-image">
            <ResponsiveImage src={heroImage} alt={`Photography by ${profile.name}`} loading="eager" fetchPriority="high"
              sizes="(max-width: 760px) 100vw, 40vw"
              style={{ objectPosition: `${profile.heroFocalX ?? 50}% ${profile.heroFocalY ?? 50}%` }} />
            <figcaption>{profile.name} / Selected moments</figcaption>
          </figure>}
        </section>}

        <section id="portfolio" className="mg-work" aria-labelledby="mg-work-title">
          <div className="mg-section-heading">
            <WorkHeading id="mg-work-title">{categorySlug ? selectedCategory?.name || "Category not found" : "Selected work"}</WorkHeading>
            <span className="mg-kicker">{String(gallery.length).padStart(2, "0")} photographs</span>
          </div>
          <nav className="mg-categories" aria-label="Portfolio categories">
            <Link to={`${home}#portfolio`} aria-current={!categorySlug ? "page" : undefined}>All work</Link>
            {categories.map(category => <Link key={category.slug}
              to={`/${slug}/portfolio/${category.slug}${linkSearch}#portfolio`}
              aria-current={categorySlug === category.slug ? "page" : undefined}>{category.name}</Link>)}
          </nav>
          {categorySlug && !selectedCategory ? <p className="mg-empty">This portfolio category could not be found. Choose another collection above.</p>
            : gallery.length > 0 ? <div className="mg-grid">
              {gallery.map((item, index) => <figure className="mg-photo" key={item.id}>
                {item.imageUrl && <ResponsiveImage src={item.imageUrl} alt={item.title || "Portfolio photograph"}
                  sizes="(max-width: 640px) 100vw, 50vw" />}
                <figcaption><span>{item.title || item.category || "Untitled"}</span><span>{String(index + 1).padStart(2, "0")}</span></figcaption>
              </figure>)}
            </div> : <p className="mg-empty">{categorySlug ? "Photographs for this collection are coming soon." : "New work is on its way. Get in touch to talk about your project."}</p>}
        </section>

        {!categorySlug && <>
          <section id="about" className="mg-about">
            <p className="mg-kicker">Behind the lens</p>
            <div><h2>Hello, I’m {profile.name}.</h2><p>{profile.bio || "I make photographs that hold onto the feeling of a moment. Let’s make something meaningful together."}</p>
              {profile.location && <p className="mg-kicker">Based in {profile.location}</p>}
            </div>
          </section>
          {profile.gear.length > 0 && <section id="gear" className="mg-equipment">
            <div className="mg-section-heading"><h2>Tools of the trade</h2><span className="mg-kicker">In the bag</span></div>
            <div className="mg-gear-grid">{profile.gear.map(item => <article key={item.id}>
              {item.imageUrl && <ResponsiveImage src={item.imageUrl} alt={`${item.brand} ${item.model}`} sizes="(max-width: 640px) 100vw, 30vw" />}
              <p className="mg-kicker">{item.category}</p><h3>{item.brand} {item.model}</h3><p>{item.description}</p>
            </article>)}</div>
          </section>}
          {profile.packages.length > 0 && <section id="packages" className="mg-packages">
            <div className="mg-section-heading"><h2>Ways to work together</h2><span className="mg-kicker">Photography packages</span></div>
            {profile.packages.map((item, index) => <article className="mg-package" key={item.id}>
              <span className="mg-kicker">{String(index + 1).padStart(2, "0")}</span>
              {item.imageUrl && <ResponsiveImage src={item.imageUrl} alt="" sizes="(max-width: 640px) 100vw, 20vw" />}
              <div><h3>{item.name}</h3><p>{item.description}</p>
                {item.coverageHours && <p>Up to {item.coverageHours} hours of coverage</p>}
                {item.deliverables && <p>{item.deliverables}</p>}
              </div>
              <div className="mg-package-action"><p>From {new Intl.NumberFormat(undefined, { style: "currency", currency: item.currency }).format(item.price)}</p>
                <a className="mg-text-link" href="#booking" onClick={() => booking.setSelectedPackageId(String(item.id))}>Inquire <span aria-hidden="true">↗</span></a>
              </div>
            </article>)}
          </section>}
          <section id="booking" className="mg-booking">
            <div><p className="mg-kicker">Your next story</p><h2>Let’s make<br />something matter.</h2><p>Share your plans, a date, an idea.<br />I’d love to hear what you have in mind.</p></div>
            <BookingForm packages={profile.packages} booking={booking} />
          </section>
        </>}

        <footer className="mg-footer"><span>© {new Date().getFullYear()} {profile.name}</span>
          <Link to={`${home}#booking`}>Let’s work together ↗</Link><a href="#top">Back to top ↑</a>
          <span className="mg-kicker">Made with Lensora</span>
        </footer>
      </div>
    </main>
  );
}

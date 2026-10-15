import { Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ResponsiveImage } from "../../components/ResponsiveImage";
import { BookingForm } from "../components/BookingForm";
import { PortfolioCategoryPage } from "../components/PortfolioCategoryPage";

// Template 1 preserves the original markup and CSS classes.
// Templates receive prepared content and actions and do not call the API.
export function EditorialTemplate({ site, booking }) {
  const { profile, slug, categorySlug, selectedCategory, portfolioItems, heroImage, linkSearch = "" } = site;
  if (categorySlug) {
    return <PortfolioCategoryPage profile={profile} slug={slug} selectedCategory={selectedCategory} portfolioItems={portfolioItems} linkSearch={linkSearch} />;
  }
  return (
    <main id="top">
      <Navbar slug={slug} hasPackages={profile.packages?.length > 0} linkSearch={linkSearch} />
      <section className="hero" aria-labelledby="hero-title">
        {heroImage && (
          <ResponsiveImage
            className="hero-image"
            src={heroImage}
            alt=""
            fetchPriority="high"
            loading="eager"
            fallbackWidth={1600}
            widths={[640, 960, 1280, 1600, 2000, 2400]}
            sizes="100vw"
            style={{
              objectPosition: `${profile.heroFocalX ?? 50}% ${profile.heroFocalY ?? 50}%`,
            }}
            onError={(event) => event.currentTarget.remove()}
          />
        )}
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-copy-block">
            <p className="eyebrow hero-location">
              <span className="hero-location-mark" aria-hidden="true" />
              {profile.location ? `Photographer · ${profile.location}` : "Photographer & visual storyteller"}
            </p>
            <h1 id="hero-title">{profile.name}</h1>
            <p className="hero-copy">{profile.bio}</p>
            <div className="hero-actions">
              <a className="button light" href="#portfolio">
                <span>Explore the work</span><span aria-hidden="true">↗</span>
              </a>
              <a className="button ghost" href="#booking">
                Start a conversation
              </a>
            </div>
          </div>
        </div>
        <div className="hero-note">
          <span className="hero-note-line" aria-hidden="true" />
          <span>Scroll to explore</span>
        </div>
      </section>
      <section id="portfolio" className="section">
        <div className="section-heading portfolio-section-heading">
          <div>
            <p className="eyebrow dark">Selected work</p>
            <h2>Stories worth returning to.</h2>
          </div>
          <p className="portfolio-section-intro">
            A collection of moments, people, and places, thoughtfully brought together.
          </p>
        </div>
        <div className={`portfolio-category-grid portfolio-category-grid--${profile.portfolioCategories?.length || 0}`}>
          {(profile.portfolioCategories || []).map((category, index) => (
            <Link
              className={`portfolio-category-card${index === 0 ? " portfolio-category-card-featured" : ""}`}
              key={category.slug}
              to={`/${slug}/portfolio/${category.slug}${linkSearch}`}
            >
              <ResponsiveImage
                src={category.coverImageUrl}
                alt=""
                sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 40vw"
              />
              <div className="portfolio-category-caption">
                <div>
                  <span className="portfolio-category-count">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3 6.25h3l1.25-1.5h5.5L14 6.25h3v9.5H3v-9.5Z" />
                      <circle cx="10" cy="11" r="3.1" />
                    </svg>
                    {category.itemCount ?? 0}
                  </span>
                  <h3>{category.name}</h3>
                </div>
                <span className="portfolio-category-arrow" aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
          {!(profile.portfolioCategories || []).length && <p>No portfolio categories yet.</p>}
        </div>
      </section>      <section id="about" className="section split about">
        <p className="eyebrow dark">About</p>
        <div>
          <h2>Photography with presence and purpose.</h2>
          <p>
            {profile.bio ||
              "A refined visual record of the people, details, and feeling that make your story distinct."}
          </p>
        </div>
      </section>
      <section id="gear" className="section gear-section">
        <div className="section-heading">
          <p className="eyebrow dark">In the bag</p>
          <h2>Tools behind the craft.</h2>
        </div>
        <div className="gear-grid">
          {profile.gear.map((item) => (
            <article className="gear-card" key={item.id}>
              {item.imageUrl && (
                <ResponsiveImage
                  src={item.imageUrl}
                  alt=""
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
              )}
              <p>{item.category}</p>
              <h3>
                {item.brand} {item.model}
              </h3>
              <span>{item.description}</span>
            </article>
          ))}
        </div>
      </section>
      {profile.packages?.length > 0 && (
        <section id="packages" className="section packages-section">
          <div className="section-heading">
            <p className="eyebrow dark">Experiences</p>
            <h2>Find your story.</h2>
            <p>Choose the coverage that fits your occasion. Every inquiry starts a conversation.</p>
          </div>
          <div className="packages-grid">
            {profile.packages.map((item) => (
              <article className="package-card" key={item.id}>
                <ResponsiveImage
                  src={item.imageUrl}
                  alt=""
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <div className="package-card-body">
                  <p className="eyebrow dark">Photography package</p>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  {item.coverageHours && <p className="package-meta">Up to {item.coverageHours} hours of coverage</p>}
                  {item.deliverables && <p className="package-meta">Includes: {item.deliverables}</p>}
                  <div className="package-card-bottom">
                    <span>From {new Intl.NumberFormat(undefined, { style: "currency", currency: item.currency }).format(item.price)}</span>
                    <a href="#booking" onClick={() => booking.setSelectedPackageId(String(item.id))}>Inquire about this package ↗</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section id="booking" className="booking-section">
        <div>
          <p className="eyebrow">Let’s create something enduring</p>
          <h2>Tell me about your day.</h2>
          <p>Share the date and a little about what you have in mind. I’ll be in touch soon.</p>
        </div>
        <BookingForm packages={profile.packages} booking={booking} />
      </section>
      <Footer photographerName={profile.name} location={profile.location} hasPackages={profile.packages?.length > 0} />
    </main>
  );
}

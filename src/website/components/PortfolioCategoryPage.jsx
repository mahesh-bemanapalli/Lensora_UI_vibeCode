import { Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ResponsiveImage } from "../../components/ResponsiveImage";

export function PortfolioCategoryPage({ profile, slug, selectedCategory, portfolioItems, linkSearch = "" }) {
  return (
    <main className="portfolio-inner-page">
      <Navbar slug={slug} hasPackages={profile.packages?.length > 0} linkSearch={linkSearch} />
      <section className="section">
        <p className="eyebrow dark">{profile.name} · Selected work</p>
        <h1>{selectedCategory?.name || "Portfolio category not found"}</h1>
        <Link className="portfolio-back-link" to={`/${slug}${linkSearch}#portfolio`}>← All portfolio categories</Link>
        {selectedCategory ? <div className="portfolio-grid portfolio-inner-grid">
          {portfolioItems.map((item) => <article className="portfolio-card" key={item.id}>
            <ResponsiveImage
              src={item.imageUrl}
              alt={item.title || "Portfolio photograph"}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
            <div><span>{item.category}</span><h3>{item.title}</h3></div>
          </article>)}
        </div> : <p>This portfolio category could not be found.</p>}
      </section>
      <Footer photographerName={profile.name} location={profile.location} hasPackages={profile.packages?.length > 0} />
    </main>
  );
}

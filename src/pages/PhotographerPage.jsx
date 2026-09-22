import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function PhotographerPage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState();
  const [status, setStatus] = useState("loading");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .get(`/photographers/${slug}`)
      .then(({ data }) => {
        if (active) {
          setProfile(data);
          setStatus("ready");
        }
      })
      .catch(() => active && setStatus("missing"));
    return () => {
      active = false;
    };
  }, [slug]);
  async function submitBooking(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setSending(true);
    try {
      await api.post(`/photographers/${slug}/bookings`, {
        clientName: fields.get("name"),
        clientEmail: fields.get("email"),
        eventDate: fields.get("date"),
        message: fields.get("message") || null,
      });
      event.currentTarget.reset();
      setStatus("booked");
    } catch {
      setStatus("booking-error");
    } finally {
      setSending(false);
    }
  }
  if (status === "loading") return <main className="state">Loading portfolio…</main>;
  if (status === "missing")
    return <main className="state">This photographer could not be found.</main>;
  return (
    <main id="top">
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-overlay" />
        <Navbar slug={slug} />
        <div className="hero-content">
          <p className="eyebrow">{profile.location || "Photography"}</p>
          <h1>{profile.name}</h1>
          <p className="hero-copy">Capturing real moments with a thoughtful, cinematic eye.</p>
          <div className="hero-actions">
            <a className="button light" href="#portfolio">
              View portfolio
            </a>
            <a className="button ghost" href="#booking">
              Book a session
            </a>
          </div>
        </div>
        <div className="hero-note">
          SCROLL TO EXPLORE <span>↓</span>
        </div>
      </section>
      <section id="portfolio" className="section">
        <div className="section-heading">
          <p className="eyebrow dark">Selected work</p>
          <h2>Stories worth returning to.</h2>
        </div>
        <div className="portfolio-grid">
          {profile.portfolio.map((item) => (
            <article className="portfolio-card" key={item.id}>
              <img src={item.imageUrl} alt={item.title || "Portfolio photograph"} />
              <div>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="about" className="section split about">
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
              {item.imageUrl && <img src={item.imageUrl} alt="" />}
              <p>{item.category}</p>
              <h3>
                {item.brand} {item.model}
              </h3>
              <span>{item.description}</span>
            </article>
          ))}
        </div>
      </section>
      <section id="booking" className="booking-section">
        <div>
          <p className="eyebrow">Let’s create something enduring</p>
          <h2>Tell me about your day.</h2>
          <p>Share the date and a little about what you have in mind. I’ll be in touch soon.</p>
        </div>
        <form onSubmit={submitBooking}>
          <label>
            Your name
            <input name="name" required maxLength="120" />
          </label>
          <label>
            Email address
            <input name="email" type="email" required />
          </label>
          <label>
            Event date
            <input name="date" type="date" required />
          </label>
          <label>
            Tell me more
            <textarea name="message" rows="4" maxLength="2000" />
          </label>
          <button className="button light" disabled={sending}>
            {sending ? "Sending…" : "Send inquiry"}
          </button>
          {status === "booked" && (
            <p className="form-success">Thank you — your inquiry has been sent.</p>
          )}
          {status === "booking-error" && (
            <p className="form-error">We could not send this inquiry. Please try again.</p>
          )}
        </form>
      </section>
      <Footer photographerName={profile.name} location={profile.location} />
    </main>
  );
}

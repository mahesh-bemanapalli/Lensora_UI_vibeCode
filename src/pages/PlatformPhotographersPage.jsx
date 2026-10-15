import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { AdminNav } from "../components/AdminNav";
import { resolveWebsiteTemplate } from "../website/templates/registry";
import "../website/components/template-preview.css";

export function PlatformPhotographersPage() {
  const [photographers, setPhotographers] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.get("/platform/photographers")
      .then(({ data }) => { if (active) setPhotographers(data); })
      .catch(error => { if (active) setError(error.response?.status === 403 ? "SuperAdmin access is required. Sign in again if your role changed." : "Unable to load photographers. Please reload to try again."); });
    return () => { active = false; };
  }, []);
  return <main className="dashboard">
    <AdminNav />
    <section className="manager">
      <p className="eyebrow dark">Platform administration</p>
      <h1>Photographers</h1>
      <Link className="button dark" to="/platform/photographers/new">Register photographer</Link>
      <p className="manager-intro">Preview each photographer’s content in a design, then assign it when ready. Their public URL stays the same.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!photographers && !error && <p role="status">Loading photographers…</p>}
      {photographers?.length === 0 && <p>No photographers yet.</p>}
      <div className="platform-photographers">
        {photographers?.map(profile => <article key={profile.id}>
          <div><h2>{profile.name}</h2><p>/{profile.slug}</p><p>Assigned: {resolveWebsiteTemplate(profile.templateKey).name}</p></div>
          <Link className="button dark" to={`/platform/photographers/${profile.slug}/preview`} target="_blank" rel="noopener noreferrer">Preview and assign design ↗</Link>
          <Link to={`/${profile.slug}`} target="_blank" rel="noopener noreferrer">View public website ↗</Link>
        </article>)}
      </div>
    </section>
  </main>;
}

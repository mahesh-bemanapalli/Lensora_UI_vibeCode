import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { AdminNav } from "../components/AdminNav";

export function RegisterPhotographerPage() {
  const [form, setForm] = useState({ name: "", email: "", slug: "", password: "" });
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }
  async function register(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (form.password !== confirmation) { setError("The passwords do not match."); return; }
    setSaving(true);
    const payload = { ...form, name: form.name.trim(), email: form.email.trim(), slug: form.slug.trim(), templateKey: "editorial" };
    try {
      // Registration returns the photographer's token. Do not replace the SuperAdmin session.
      await api.post("/auth/register", payload);
      setCreated({ name: payload.name, slug: payload.slug });
      setForm({ name: "", email: "", slug: "", password: "" });
      setConfirmation("");
    } catch (error) {
      const data = error.response?.data;
      setError(data?.message || Object.values(data?.errors ?? {}).flat().join(" ") || data?.title || "Unable to register this photographer. Please try again.");
    } finally { setSaving(false); }
  }
  return <main className="dashboard">
    <AdminNav publicSlug={created?.slug} />
    <section className="manager">
      <p className="eyebrow dark">Platform administration</p>
      <h1>Register photographer</h1>
      <p className="manager-intro">Create a photographer account with a unique public URL. New photographers start with Editorial; you can preview and assign another design afterward.</p>
      {created ? <div className="editor-form">
        <p className="form-success dark-success" role="status">{created.name} has been registered. You are still signed in as SuperAdmin.</p>
        <div className="inline-actions">
          <Link className="button dark" to={`/platform/photographers/${created.slug}/preview`} target="_blank" rel="noopener noreferrer">Preview and assign design ↗</Link>
          <Link to={`/${created.slug}`} target="_blank" rel="noopener noreferrer">View public website ↗</Link>
        </div>
        <Link to="/platform/photographers">Back to photographers</Link>
        <button type="button" className="text-button" onClick={() => setCreated(null)}>Register another photographer</button>
      </div> : <form className="editor-form" onSubmit={register}>
        <fieldset className="registration-fields" disabled={saving}>
          <div className="form-grid">
            <label>Display name<input name="name" value={form.name} onChange={change} required maxLength={100} autoComplete="off" /></label>
            <label>Email address<input name="email" type="email" value={form.email} onChange={change} required maxLength={320} autoComplete="off" /></label>
            <label>Public URL slug<input name="slug" value={form.slug} onChange={change} required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="jagadish" aria-describedby="registration-slug-hint" autoComplete="off" /></label>
          </div>
          <p id="registration-slug-hint">Use lowercase letters, numbers and single hyphens. Public website: /{form.slug || "your-slug"}</p>
          <div className="form-grid">
            <label>Password<input name="password" type="password" value={form.password} onChange={change} required minLength={12} autoComplete="new-password" aria-describedby="registration-password-hint" /></label>
            <label>Confirm password<input name="confirmation" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={12} autoComplete="new-password" /></label>
          </div>
          <p id="registration-password-hint">Use at least 12 characters. The photographer will sign in with this email and password.</p>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="inline-actions">
          <button className="button dark" disabled={saving}>{saving ? "Registering…" : "Register photographer"}</button>
          <Link to="/platform/photographers">Back to photographers</Link>
        </div>
      </form>}
    </section>
  </main>;
}

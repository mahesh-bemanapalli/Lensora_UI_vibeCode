import { useEffect, useState } from "react";
import api from "../lib/api";
import { uploadImage } from "../lib/uploads";
import { MediaLibraryPicker } from "../components/MediaLibrary";
import { AdminNav } from "../components/AdminNav";
import { Link } from "react-router-dom";

const emptyProfile = {
  name: "",
  slug: "",
  bio: "",
  location: "",
  profileImageUrl: "",
  profileImagePublicId: "",
  heroFocalX: 50,
  heroFocalY: 50,
  templateKey: "editorial",
};
export function ProfilePage() {
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savedSlug, setSavedSlug] = useState(null);
  useEffect(() => {
    api
      .get("/admin/profile")
      .then(({ data }) => {
        setForm({ ...emptyProfile, ...data, templateKey: data.templateKey ?? "editorial" });
        setLoaded(true);
        setSavedSlug(data.slug);
      })
      .catch(() => setMessage("Unable to load your profile."));
  }, []);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: ["heroFocalX", "heroFocalY"].includes(event.target.name)
        ? Number(event.target.value)
        : event.target.value,
    }));
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const image = await uploadImage(file);
      setForm((current) => ({
        ...current,
        profileImageUrl: image.url,
        profileImagePublicId: image.publicId,
      }));
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.response?.data?.title ||
          "Image upload failed. Add Cloudinary configuration and try again.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const profile = { ...form };
      delete profile.templateKey;
      await api.put("/admin/profile", profile);
      setSavedSlug(profile.slug);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.title || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="dashboard">
      <AdminNav publicSlug={savedSlug} />
      <section className="manager">
        <p className="eyebrow dark">Studio details</p>
        <h1>Your profile</h1>
        <p className="manager-intro">This information appears on your public photography page.</p>
        {loaded && <p>Assigned design: <strong>{form.templateKey === "minimal-gallery" ? "Minimal Gallery" : "Editorial"}</strong>. <Link to={`/${form.slug}`}>View website</Link></p>}
        <form className="editor-form" onSubmit={save}>
          <div className="form-grid">
            <label>
              Display name
              <input name="name" value={form.name} onChange={change} required maxLength="100" />
            </label>
            <label>
              Public URL
              <input
                name="slug"
                value={form.slug}
                onChange={change}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </label>
            <label>
              Location
              <input
                name="location"
                value={form.location ?? ""}
                onChange={change}
                maxLength="160"
              />
            </label>
            <label>
              Hero cover image URL
              <input
                name="profileImageUrl"
                type="url"
                value={form.profileImageUrl ?? ""}
                onChange={change}
              />
            </label>
          </div>
          <label className="file-label">
            Upload hero cover image
            <input type="file" accept="image/*" onChange={upload} disabled={uploading} />
            <span>{uploading ? "Uploading image…" : "Choose a cover image"}</span>
          </label>
          <MediaLibraryPicker disabled={uploading} onSelect={image => setForm(current => ({ ...current, profileImageUrl: image.url, profileImagePublicId: image.publicId }))} />
          <div className="hero-focal-editor">
            <div>
              <p className="hero-focal-caption">Mobile hero preview</p>
              <div className="hero-focal-preview">
                {form.profileImageUrl ? (
                  <img
                    src={form.profileImageUrl}
                    alt=""
                    style={{ objectPosition: `${form.heroFocalX}% ${form.heroFocalY}%` }}
                  />
                ) : (
                  <div className="hero-focal-empty">Upload a cover image to preview the crop.</div>
                )}
                <div className="hero-focal-preview-shade" />
                <div className="hero-focal-preview-copy">
                  <span>{form.location || "Photographer"}</span>
                  <strong>{form.name || "Your studio name"}</strong>
                </div>
              </div>
            </div>
            <div className="hero-focal-controls">
              <p>Adjust the image position until your subject stays in frame on a phone.</p>
              <label>
                Horizontal position <output>{form.heroFocalX}%</output>
                <input
                  name="heroFocalX"
                  type="range"
                  min="0"
                  max="100"
                  value={form.heroFocalX}
                  onChange={change}
                />
              </label>
              <label>
                Vertical position <output>{form.heroFocalY}%</output>
                <input
                  name="heroFocalY"
                  type="range"
                  min="0"
                  max="100"
                  value={form.heroFocalY}
                  onChange={change}
                />
              </label>
            </div>
          </div>
          <label>
            Biography
            <textarea
              name="bio"
              value={form.bio ?? ""}
              onChange={change}
              rows="6"
              maxLength="2000"
            />
          </label>
          <button className="button dark" disabled={!loaded || saving || uploading}>
            {saving ? "Saving…" : "Save profile"}
          </button>
          {message && (
            <p
              className={message === "Profile saved." ? "form-success dark-success" : "form-error"}
            >
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import api from "../lib/api";
import { uploadImage } from "../lib/uploads";
import { AdminNav } from "../components/AdminNav";

const emptyProfile = {
  name: "",
  slug: "",
  bio: "",
  location: "",
  profileImageUrl: "",
  profileImagePublicId: "",
};
export function ProfilePage() {
  const [form, setForm] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    api
      .get("/admin/profile")
      .then(({ data }) => setForm({ ...emptyProfile, ...data }))
      .catch(() => setMessage("Unable to load your profile."));
  }, []);
  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
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
        error.response?.data?.title ||
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
      await api.put("/admin/profile", form);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="dashboard">
      <AdminNav />
      <section className="manager">
        <p className="eyebrow dark">Studio details</p>
        <h1>Your profile</h1>
        <p className="manager-intro">This information appears on your public photography page.</p>
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
              Profile image URL
              <input
                name="profileImageUrl"
                type="url"
                value={form.profileImageUrl ?? ""}
                onChange={change}
              />
            </label>
          </div>
          <label className="file-label">
            Upload profile image
            <input type="file" accept="image/*" onChange={upload} disabled={uploading} />
            <span>{uploading ? "Uploading image…" : "Choose an image"}</span>
          </label>
          {form.profileImageUrl && (
            <img className="upload-preview" src={form.profileImageUrl} alt="Profile preview" />
          )}
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
          <button className="button dark" disabled={saving || uploading}>
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

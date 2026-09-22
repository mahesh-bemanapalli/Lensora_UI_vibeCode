import { useEffect, useState } from "react";
import api from "../lib/api";
import { uploadImage } from "../lib/uploads";
import { AdminNav } from "../components/AdminNav";

const blank = { imageUrl: "", imagePublicId: "", title: "", category: "", displayOrder: 0 };
export function PortfolioManagerPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const load = () =>
    api
      .get("/admin/portfolio")
      .then(({ data }) => setItems(data))
      .catch(() => setMessage("Unable to load portfolio items."));
  useEffect(() => {
    load();
  }, []);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.name === "displayOrder" ? Number(event.target.value) : event.target.value,
    }));
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const image = await uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: image.url, imagePublicId: image.publicId }));
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
    setMessage("");
    try {
      if (editing) await api.put(`/admin/portfolio/${editing}`, form);
      else await api.post("/admin/portfolio", form);
      setForm(blank);
      setEditing(null);
      load();
    } catch {
      setMessage("Unable to save this portfolio item. Check the image URL.");
    }
  }
  function edit(item) {
    setEditing(item.id);
    setForm(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(id) {
    if (!window.confirm("Remove this portfolio item?")) return;
    try {
      await api.delete(`/admin/portfolio/${id}`);
      load();
    } catch {
      setMessage("Unable to remove this item.");
    }
  }
  return (
    <main className="dashboard">
      <AdminNav />
      <section className="manager">
        <p className="eyebrow dark">Gallery management</p>
        <h1>Portfolio</h1>
        <p className="manager-intro">
          Upload an image directly to your Cloudinary folder, or use a hosted image URL.
        </p>
        <form className="editor-form" onSubmit={save}>
          <div className="form-grid">
            <label>
              Image URL
              <input name="imageUrl" type="url" value={form.imageUrl} onChange={change} required />
            </label>
            <label>
              Title
              <input name="title" value={form.title ?? ""} onChange={change} />
            </label>
            <label>
              Category
              <input name="category" value={form.category ?? ""} onChange={change} />
            </label>
            <label>
              Display order
              <input
                name="displayOrder"
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={change}
              />
            </label>
          </div>
          <label className="file-label">
            Upload image
            <input type="file" accept="image/*" onChange={upload} disabled={uploading} />
            <span>{uploading ? "Uploading image…" : "Choose an image"}</span>
          </label>
          {form.imageUrl && (
            <img className="upload-preview" src={form.imageUrl} alt="Portfolio preview" />
          )}
          <div className="inline-actions">
            <button className="button dark" disabled={uploading}>
              {editing ? "Save changes" : "Add image"}
            </button>
            {editing && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
          {message && <p className="form-error">{message}</p>}
        </form>
        <div className="content-grid">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <img src={item.imageUrl} alt={item.title || "Portfolio"} />
              <div>
                <span>{item.category || "Uncategorized"}</span>
                <h2>{item.title || "Untitled"}</h2>
                <p>Order {item.displayOrder}</p>
                <button className="text-button" onClick={() => edit(item)}>
                  Edit
                </button>
                <button className="text-button danger" onClick={() => remove(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

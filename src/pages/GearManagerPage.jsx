import { useEffect, useState } from "react";
import api from "../lib/api";
import { uploadImage } from "../lib/uploads";
import { AdminNav } from "../components/AdminNav";

const blank = {
  name: "",
  category: "Camera",
  brand: "",
  model: "",
  description: "",
  imageUrl: "",
  imagePublicId: "",
  isFeatured: false,
  displayOrder: 0,
};
export function GearManagerPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const load = () =>
    api
      .get("/admin/gear")
      .then(({ data }) => setItems(data))
      .catch(() => setMessage("Unable to load gear."));
  useEffect(() => {
    load();
  }, []);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.name === "displayOrder"
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
      if (editing) await api.put(`/admin/gear/${editing}`, form);
      else await api.post("/admin/gear", form);
      setForm(blank);
      setEditing(null);
      load();
    } catch {
      setMessage("Unable to save this gear item. Check the required fields and image URL.");
    }
  }
  function edit(item) {
    setEditing(item.id);
    setForm(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(id) {
    if (!window.confirm("Remove this gear item?")) return;
    try {
      await api.delete(`/admin/gear/${id}`);
      load();
    } catch {
      setMessage("Unable to remove this gear item.");
    }
  }
  return (
    <main className="dashboard">
      <AdminNav />
      <section className="manager">
        <p className="eyebrow dark">Equipment management</p>
        <h1>Gear</h1>
        <p className="manager-intro">
          Keep the cameras, lenses, and tools on your public page current.
        </p>
        <form className="editor-form" onSubmit={save}>
          <div className="form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={change} required />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={change}>
                <option>Camera</option>
                <option>Lens</option>
                <option>Lighting</option>
                <option>Drone</option>
                <option>Accessory</option>
              </select>
            </label>
            <label>
              Brand
              <input name="brand" value={form.brand} onChange={change} required />
            </label>
            <label>
              Model
              <input name="model" value={form.model} onChange={change} required />
            </label>
            <label>
              Image URL
              <input name="imageUrl" type="url" value={form.imageUrl ?? ""} onChange={change} />
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
            Upload gear image
            <input type="file" accept="image/*" onChange={upload} disabled={uploading} />
            <span>{uploading ? "Uploading image…" : "Choose an image"}</span>
          </label>
          {form.imageUrl && (
            <img className="upload-preview" src={form.imageUrl} alt="Gear preview" />
          )}
          <label>
            Description
            <textarea
              name="description"
              value={form.description ?? ""}
              onChange={change}
              rows="4"
              maxLength="1000"
            />
          </label>
          <label className="checkbox-label">
            <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={change} />{" "}
            Featured item
          </label>
          <div className="inline-actions">
            <button className="button dark" disabled={uploading}>
              {editing ? "Save changes" : "Add gear"}
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
              {item.imageUrl && <img src={item.imageUrl} alt="" />}
              <div>
                <span>
                  {item.category}
                  {item.isFeatured && " · Featured"}
                </span>
                <h2>
                  {item.brand} {item.model}
                </h2>
                <p>
                  {item.name}
                  {item.description && ` — ${item.description}`}
                </p>
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

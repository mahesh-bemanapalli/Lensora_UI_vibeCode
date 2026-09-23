import { useEffect, useState } from "react";
import api from "../lib/api";
import { uploadImage } from "../lib/uploads";
import { AdminNav } from "../components/AdminNav";
import { nextDisplayOrder, displayOrderIsTaken, displayOrderConflictMessage } from "../lib/displayOrder";

const blank = {
  name: "", description: "", imageUrl: "", imagePublicId: "", price: "",
  currency: "INR", coverageHours: "", deliverables: "", isPublished: false, displayOrder: 0,
};

export function PackagesManagerPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load(resetOrder = false) {
    try {
      const { data } = await api.get("/admin/packages");
      setItems(data);
      if (resetOrder || editing === null) setForm((current) => ({ ...current, displayOrder: nextDisplayOrder(data) }));
    } catch {
      setMessage("Unable to load packages.");
    }
  }

  useEffect(() => { load(); }, []);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const image = await uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: image.url, imagePublicId: image.publicId }));
    } catch (error) {
      setMessage(error.response?.data?.title || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      price: Number(form.price),
      coverageHours: form.coverageHours ? Number(form.coverageHours) : null,
      displayOrder: Number(form.displayOrder),
      currency: form.currency.trim().toUpperCase(),
      imagePublicId: form.imagePublicId || null,
      deliverables: form.deliverables || null,
    };
    if (displayOrderIsTaken(items, payload.displayOrder, editing)) {
      setMessage(displayOrderConflictMessage);
      return;
    }
    try {
      if (editing) await api.put(`/admin/packages/${editing}`, payload);
      else await api.post("/admin/packages", payload);
      setForm(blank);
      setEditing(null);
      await load(true);
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.title || "Unable to save this package. Check the required fields.");
    }
  }

  function edit(item) {
    setEditing(item.id);
    setForm({ ...item, coverageHours: item.coverageHours ?? "", deliverables: item.deliverables ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id) {
    if (!window.confirm("Remove this package? Existing inquiries will no longer link to it.")) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      if (editing === id) { setEditing(null); setForm(blank); }
      await load(editing === id);
    } catch {
      setMessage("Unable to remove this package.");
    }
  }

  return (
    <main className="dashboard">
      <AdminNav />
      <section className="manager">
        <p className="eyebrow dark">Offerings</p>
        <h1>Packages</h1>
        <p className="manager-intro">Create packages for your public page. Publish a package when it is ready for inquiries.</p>
        <form className="editor-form" onSubmit={save}>
          <div className="form-grid">
            <label>Plan name<input name="name" value={form.name} onChange={change} maxLength="160" required /></label>
            <label>Price<input name="price" type="number" min="0" max="9999999999.99" step="0.01" value={form.price} onChange={change} required /></label>
            <label>Currency code<input name="currency" value={form.currency} onChange={change} pattern="[A-Za-z]{3}" maxLength="3" required /></label>
            <label>Coverage hours (optional)<input name="coverageHours" type="number" min="1" max="1000" value={form.coverageHours} onChange={change} /></label>
            <label>Image URL<input name="imageUrl" type="url" value={form.imageUrl} onChange={change} required /></label>
            <label>Display order<input name="displayOrder" type="number" min="0" max="10000" value={form.displayOrder} onChange={change} /></label>
          </div>
          <label>Description<textarea name="description" rows="4" maxLength="2000" value={form.description} onChange={change} required /></label>
          <label>Included deliverables<textarea name="deliverables" rows="3" maxLength="2000" value={form.deliverables} onChange={change} placeholder="For example: edited gallery, prints, album" /></label>
          <label className="file-label">Upload cover image<input type="file" accept="image/*" onChange={upload} disabled={uploading} /><span>{uploading ? "Uploading…" : "Choose an image"}</span></label>
          {form.imageUrl && <img className="upload-preview" src={form.imageUrl} alt="Package preview" />}
          <label className="checkbox-label"><input name="isPublished" type="checkbox" checked={form.isPublished} onChange={change} /> Published on public page</label>
          <div className="inline-actions">
            <button className="button dark" disabled={uploading}>{editing ? "Save changes" : "Add package"}</button>
            {editing && <button type="button" className="text-button" onClick={() => { setEditing(null); setForm({ ...blank, displayOrder: nextDisplayOrder(items) }); }}>Cancel edit</button>}
          </div>
          {message && <p className="form-error" role="alert">{message}</p>}
        </form>
        <div className="content-grid">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <img src={item.imageUrl} alt="" />
              <div>
                <span>{item.isPublished ? "Published" : "Draft"} · Order {item.displayOrder}</span>
                <h2>{item.name}</h2>
                <p>{new Intl.NumberFormat(undefined, { style: "currency", currency: item.currency }).format(item.price)}</p>
                <p>{item.description}</p>
                <button className="text-button" onClick={() => edit(item)}>Edit</button>
                <button className="text-button danger" onClick={() => remove(item.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

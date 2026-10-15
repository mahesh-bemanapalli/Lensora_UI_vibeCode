import { useEffect, useState } from "react";
import api from "../lib/api";
import "../media-library.css";

export function formatBytes(bytes) {
  if (bytes == null) return "Not measured";
  if (bytes < 1000) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), 4);
  return `${(bytes / 1000 ** power).toFixed(2)} ${units[power - 1]}`;
}

function libraryLoadError(error) {
  const status = error.response?.status;
  if (status === 404 || status === 405) return "The running API does not have the media-library endpoint. Restart the updated backend, then retry.";
  if (status === 401) return "Your session has expired. Sign out and sign in again.";
  if (status === 403) return "Your account must be linked to a photographer profile to use the media library.";
  if (!error.response) return "Cannot reach the media API. Check that the backend is running and retry.";
  return error.response?.data?.title || "Unable to load your media library. Check that the backend and media-library database migration are up to date.";
}

export function MediaLibrary({ onSelect, imagesOnly = false, refreshKey = 0 }) {
  const [library, setLibrary] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [retryKey, setRetryKey] = useState(0);
  async function load() {
    const { data } = await api.get("/admin/media");
    setLibrary(data);
  }
  useEffect(() => {
    let active = true;
    setError("");
    api.get("/admin/media").then(({ data }) => { if (active) setLibrary(data); }).catch(error => { if (active) setError(libraryLoadError(error)); });
    return () => { active = false; };
  }, [refreshKey, retryKey]);
  async function upload(event) {
    const files = [...(event.target.files ?? [])]; event.target.value = "";
    if (!files.length) return;
    setBusy(true); setError(""); setMessage("");
    let added = 0, reused = 0;
    try {
      for (const file of files) {
        const form = new FormData(); form.append("file", file);
        const { data } = await api.post(imagesOnly ? "/admin/media/images" : "/admin/media/files", form);
        if (data.isDuplicate) reused++; else added++;
      }
      setMessage(`${added} uploaded. ${reused} existing files reused without additional storage.`);
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.title || "Upload failed. Previously completed uploads remain in your library.");
    } finally {
      try { await load(); } catch { setError(current => current || "Unable to refresh usage. Reload before uploading again."); }
      setBusy(false);
    }
  }
  async function sync() {
    setBusy(true); setError(""); setMessage("");
    try { const { data } = await api.post("/admin/media/sync"); setMessage(data.message); await load(); }
    catch (error) { setError(error.response?.data?.title || "Unable to synchronize existing media."); }
    finally { setBusy(false); }
  }
  const percent = library ? Math.min(100, library.usedBytes / Math.max(1, library.limitBytes) * 100) : 0;
  const items = library?.items.filter(item => (!imagesOnly || item.kind === "image") && (kind === "all" || item.kind === kind) && item.fileName.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <section className="media-library" aria-label="Media library">
    {library && <div className="media-usage">
      <strong>{formatBytes(library.usedBytes)} of {formatBytes(library.limitBytes)} used</strong>
      <progress value={percent} max="100" aria-label="Storage allowance used" />
      <p>{formatBytes(Math.max(0, library.limitBytes - library.usedBytes))} available · {library.items.length} files</p>
      <p>Original uploaded file sizes. External links are excluded. The same file can be reused across your website without uploading again.</p>
      {library.reservedBytes > 0 && <p>{formatBytes(library.reservedBytes)} is reserved for pending uploads.</p>}
      {library.unknownCount > 0 && <p role="status">{library.unknownCount} existing files have unmeasured sizes. Sync them before uploading; the total above is incomplete.</p>}
    </div>}
    <div className="media-toolbar">
      <label className="media-upload">{busy ? "Working…" : "Upload files"}<input type="file" multiple disabled={busy || !library || library.unknownCount > 0} accept={imagesOnly ? ".jpg,.jpeg,.png,.gif,.webp" : ".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.mp3,.wav,.ogg,.pdf"} onChange={upload} /></label>
      <button type="button" className="text-button" disabled={busy || !library} onClick={sync}>Sync existing media</button>
      <label>Search files<input value={search} onChange={event => setSearch(event.target.value)} type="search" /></label>
      {!imagesOnly && <label>Media type<select value={kind} onChange={event => setKind(event.target.value)}><option value="all">All media</option><option value="image">Images</option><option value="video">Videos</option><option value="audio">Audio</option><option value="document">Documents</option></select></label>}
    </div>
    <p>Images up to 20 MB; videos, audio and PDF files up to 50 MB each. Duplicate detection matches exact file contents.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    {!library && error && <button type="button" className="text-button" onClick={() => setRetryKey(value => value + 1)}>Retry loading media library</button>}
    {message && <p role="status">{message}</p>}
    {!library && !error && <p role="status">Loading media…</p>}
    {library && items.length === 0 && <p>No matching media. Upload files to build your library.</p>}
    <div className="media-grid">{items.map(item => <article className="media-item" key={item.id}>
      {item.status === "Ready" || item.status === "External" ? item.kind === "image" ? <img src={item.url} alt={item.fileName} loading="lazy" /> : item.kind === "video" ? <video controls preload="metadata" src={item.url} /> : item.kind === "audio" ? <audio controls preload="none" src={item.url} /> : <div className="media-document">PDF document</div> : <div className="media-document">{item.status === "Retryable" ? "Upload the same file again to retry" : "Upload pending"}</div>}
      {item.status === "Missing" && <p role="status">Missing from the media provider. Contact the administrator to reconcile this item.</p>}
      <strong>{item.fileName}</strong><span>{item.status === "External" ? "External link · not counted" : `${formatBytes(item.sizeBytes)} · ${item.status}`}</span>
      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Open file ↗</a>}
      {onSelect && ["Ready", "External"].includes(item.status) && <button type="button" className="button dark" onClick={() => onSelect({ url: item.url, publicId: item.publicId })}>Use image</button>}
    </article>)}</div>
  </section>;
}

export function MediaLibraryPicker({ onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  return <div className="media-picker">
    <button type="button" className="text-button" disabled={disabled} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? "Close image library" : "Choose from image library"}</button>
    {open && <MediaLibrary imagesOnly onSelect={image => { onSelect(image); setOpen(false); }} />}
  </div>;
}

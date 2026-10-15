import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { websiteTemplates, resolveWebsiteTemplate } from "../templates/registry";
import "./template-preview.css";

export function TemplatePreview({ slug, photographerName, templateKey, savedKey }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [assignedKey, setAssignedKey] = useState(savedKey);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  async function assign() {
    setSaving(true); setError(""); setMessage("");
    try {
      const { data } = await api.put(`/platform/photographers/${slug}/design`, { templateKey });
      setAssignedKey(data.templateKey);
      setMessage(`${resolveWebsiteTemplate(data.templateKey).name} is now live.`);
      navigate({ pathname: location.pathname, search: `?template=${data.templateKey}`, hash: location.hash }, { replace: true });
    } catch (error) {
      setError(error.response?.status === 403 ? "SuperAdmin access is required. Sign in again if your role changed." : "Unable to assign this design. Try again.");
    } finally { setSaving(false); }
  }
  return <aside className="template-preview" aria-label="Website design preview">
    <div className="template-preview-heading">
      <strong>Design preview</strong>
      <button type="button" className="template-preview-toggle" aria-expanded={!collapsed} aria-controls="template-preview-controls" onClick={() => setCollapsed(value => !value)}>{collapsed ? "Expand" : "Minimize"}</button>
    </div>
    <div id="template-preview-controls" className="template-preview-controls" hidden={collapsed}>
    <div><strong>Preview · {photographerName}</strong><p>Live design: {resolveWebsiteTemplate(assignedKey).name}. Preview changes are not saved.</p></div>
    <label htmlFor="template-preview-select">Design</label>
    <select id="template-preview-select" value={templateKey} disabled={saving} onChange={event => {
      setMessage(""); setError("");
      navigate({ pathname: location.pathname, search: `?template=${event.target.value}`, hash: location.hash }, { replace: true, preventScrollReset: true });
    }}>
      {websiteTemplates.map(template => <option key={template.key} value={template.key}>{template.name}</option>)}
    </select>
    <button className="button dark" disabled={saving || templateKey === assignedKey} onClick={assign}>{saving ? "Assigning…" : "Assign design"}</button>
    <Link to="/platform/photographers">Exit preview</Link>
    {message && <p role="status">{message}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </aside>;
}

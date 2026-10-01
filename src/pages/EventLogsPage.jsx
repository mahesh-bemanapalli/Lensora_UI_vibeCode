import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { AdminNav } from "../components/AdminNav";
import "../event-logs.css";

const initialFilters = { hours: "24", level: "", route: "", traceId: "", statusCode: "" };
function utcDate(value) {
  return new Date(value.endsWith("Z") || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`).toLocaleString();
}
export function EventLogsPage() {
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const generation = useRef(0);
  const controller = useRef(null);
  const dialog = useRef(null);
  const opener = useRef(null);
  useEffect(() => {
    if (!selected) return;
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, [selected]);
  let details = {};
  if (selected?.details) {
    try { details = JSON.parse(selected.details) || {}; }
    catch { details = { Notice: "These event details could not be parsed." }; }
  }

  async function load(append = false) {
    const version = ++generation.current;
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true);
    setError("");
    const params = {
      fromUtc: new Date(Date.now() - Number(filters.hours) * 3600000).toISOString(),
      pageSize: 50,
      ...(append && cursor ? { beforeId: cursor } : {}),
    };
    for (const key of ["level", "route", "traceId", "statusCode"]) {
      if (filters[key].trim()) params[key] = filters[key].trim();
    }
    try {
      const { data } = await api.get("/admin/event-logs", { params, signal: controller.current.signal });
      if (version !== generation.current) return;
      setItems((previous) => append ? [...previous, ...data.items] : data.items);
      setCursor(data.nextBeforeId);
      setUpdated(new Date());
    } catch (failure) {
      if (version !== generation.current || failure.code === "ERR_CANCELED") return;
      setError(failure.response?.status === 401 ? "Your session expired. Sign in again to view logs." : "Unable to load logs. Check the API connection and event log database setup, then refresh.");
    } finally {
      if (version === generation.current) setBusy(false);
    }
  }
  useEffect(() => {
    setItems([]);
    setCursor(null);
    load();
    return () => { generation.current++; controller.current?.abort(); };
  }, [filters, refresh]);
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      if (!document.hidden) setRefresh((value) => value + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  function change(event) { setDraft((value) => ({ ...value, [event.target.name]: event.target.value })); }
  function showTrace(traceId) {
    const next = { ...filters, level: "", route: "", statusCode: "", traceId };
    setDraft(next);
    setFilters(next);
  }
  return <>
    <AdminNav />
    <main className="event-log-page">
      <div className="event-log-heading"><div><h1>Event Logs</h1><p>API requests and application events across Lensora.</p></div>
        <button type="button" disabled={busy} onClick={() => setRefresh((value) => value + 1)}>Refresh</button>
      </div>
      <form className="event-log-filters" onSubmit={(event) => { event.preventDefault(); setFilters({ ...draft }); }}>
        <label>Time range<select name="hours" value={draft.hours} onChange={change}><option value="1">Last hour</option><option value="24">Last 24 hours</option><option value="168">Last 7 days</option><option value="720">Last 30 days</option></select></label>
        <label>Severity<select name="level" value={draft.level} onChange={change}><option value="">All levels</option>{["Information", "Warning", "Error", "Critical"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Endpoint<input name="route" value={draft.route} onChange={change} maxLength={512} placeholder="api/admin/bookings" /></label>
        <label>Status code<input name="statusCode" value={draft.statusCode} onChange={change} type="number" min="100" max="599" placeholder="500" /></label>
        <label>Trace ID<input name="traceId" value={draft.traceId} onChange={change} maxLength={128} placeholder="Exact request trace ID" /></label>
        <button type="submit">Apply filters</button>
      </form>
      <div className="event-log-status"><label><input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} /> Auto-refresh every 15 seconds</label><span aria-live="polite">{busy ? "Loading…" : updated ? `Updated ${updated.toLocaleTimeString()} · ${items.length} events shown` : ""}</span></div>
      {error && <p role="alert" className="event-log-error">{error}</p>}
      {!busy && !error && items.length === 0 && <p className="event-log-empty">No events match these filters. New events appear after the API processes requests.</p>}
      {items.length > 0 && <div className="event-log-table-wrap"><table className="event-log-table"><thead><tr><th>Time (local)</th><th>Level</th><th>Event / endpoint</th><th>Status</th><th>Duration</th><th>Details</th></tr></thead><tbody>{items.map((entry) => <tr key={entry.id}>
        <td>{utcDate(entry.timestampUtc)}</td><td><span className={`event-level level-${entry.level.toLowerCase()}`}>{entry.level}</span></td>
        <td><strong>{entry.method} {entry.route || entry.category}</strong><div>{entry.message}</div></td><td>{entry.statusCode ?? "—"}</td><td>{entry.durationMs == null ? "—" : `${entry.durationMs} ms`}</td><td><button type="button" onClick={(event) => { opener.current = event.currentTarget; setSelected(entry); }}>View</button></td>
      </tr>)}</tbody></table></div>}
      {cursor && <button className="event-log-more" type="button" disabled={busy} onClick={() => { setAutoRefresh(false); load(true); }}>Load older events</button>}
      {selected && <dialog ref={dialog} className="event-log-detail" aria-labelledby="event-details-title" onCancel={(event) => event.preventDefault()}><div className="event-log-heading"><h2 id="event-details-title">Event details</h2><button type="button" autoFocus onClick={() => setSelected(null)}>Close</button></div>
        <dl><dt>Time</dt><dd>{utcDate(selected.timestampUtc)}</dd><dt>Failure class</dt><dd>{details.FailureClass || "Not recorded for this event"}</dd><dt>Failure method</dt><dd>{details.FailureMethod || "Not recorded for this event"}</dd><dt>Source file / line</dt><dd>{details.FailureLine ? `${details.FailureFile || "Source"}:${details.FailureLine}` : "Not available for this event"}</dd><dt>Category</dt><dd>{selected.category}</dd><dt>Message template</dt><dd>{selected.message}</dd><dt>User ID</dt><dd>{selected.userId || "Anonymous / background task"}</dd><dt>Trace ID</dt><dd>{selected.traceId || "Background task"} {selected.traceId && <button type="button" onClick={() => showTrace(selected.traceId)}>Show related events</button>}</dd></dl>
        {details.RequestBodyCapture && <section aria-label="Request body"><h3>Request body</h3><p>{details.RequestBodyCapture}</p>{details.RequestBody && <pre>{JSON.stringify(details.RequestBody, null, 2)}</pre>}</section>}
        {selected.details && !details.RequestBodyCapture && <pre>{JSON.stringify(details, null, 2)}</pre>}
      </dialog>}
    </main>
  </>;
}

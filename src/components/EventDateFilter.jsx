import { useEffect, useId, useRef, useState } from "react";
import { dateKey, formatEventDate, selectEventDate } from "../lib/bookingFilters";

export function EventDateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const wrapper = useRef(null);
  const trigger = useRef(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function toggle() {
    if (open) { close(); return; }
    setDraft(value);
    const date = value.start ? new Date(`${value.start}T12:00:00`) : new Date();
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setOpen(true);
  }
  const label = value.start ? `${formatEventDate(value.start)}${value.end && value.end !== value.start ? ` – ${formatEventDate(value.end)}` : ""}` : "Any date";
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const complete = draft.start && (draft.mode === "single" || draft.end);
  const hint = !draft.start ? (draft.mode === "single" ? "Select the event day." : "Select a start date and an end date.")
    : !complete ? `${formatEventDate(draft.start)} · Now select the end date.`
    : draft.mode === "single" ? `${formatEventDate(draft.start)} · Only events on this day.`
    : `${formatEventDate(draft.start)} – ${formatEventDate(draft.end)} · Both dates included.`;

  return <div className="event-date-filter" ref={wrapper} onKeyDown={(event) => {
    if (event.key === "Escape" && open) { event.stopPropagation(); close(); }
  }} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <span id={`${panelId}-label`} className="booking-filter-label">Event date</span>
    <button ref={trigger} type="button" className="event-date-trigger" aria-labelledby={`${panelId}-label ${panelId}-value`} aria-expanded={open} aria-controls={panelId} onClick={toggle}>
      <span id={`${panelId}-value`}>{label}</span><span aria-hidden="true">▾</span>
    </button>
    {open && <div id={panelId} className="event-date-picker" role="group" aria-label="Choose event dates">
      <div className="event-date-modes" aria-label="Date selection mode">
        {[['single', 'Single day'], ['range', 'Date range']].map(([mode, text]) => <button key={mode} type="button" aria-pressed={draft.mode === mode} onClick={() => setDraft({ mode, start: "", end: "" })}>{text}</button>)}
      </div>
      <div className="event-date-month">
        <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
        <strong aria-live="polite">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</strong>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="event-date-calendar">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span className="event-date-weekday" key={day}>{day}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const day = dateKey(new Date(month.getFullYear(), month.getMonth(), i + 1));
          return <button key={day} type="button" aria-label={formatEventDate(day)} aria-pressed={day === draft.start || day === draft.end}
            aria-current={day === dateKey(new Date()) ? "date" : undefined}
            className={draft.start && draft.end && day > draft.start && day < draft.end ? "in-range" : ""}
            onClick={() => setDraft(current => selectEventDate(current, day))}>{i + 1}</button>;
        })}
      </div>
      <p className="event-date-hint" role="status">{hint}</p>
      <div className="event-date-actions">
        <button type="button" className="text-button" onClick={close}>Cancel</button>
        <button type="button" className="event-date-apply" disabled={!complete} onClick={() => { onChange(draft); close(); }}>Apply dates</button>
      </div>
    </div>}
  </div>;
}

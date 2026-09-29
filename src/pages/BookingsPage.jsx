import { useEffect, useState } from "react";
import api from "../lib/api";
import { AdminNav } from "../components/AdminNav";
import { EventDateFilter } from "../components/EventDateFilter";
import { matchesBookingFilters, formatEventDate } from "../lib/bookingFilters";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function utcDate(value) {
  if (!value) return null;
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(hasTimeZone ? value : `${value}Z`);
}

function indianDateTime(value) {
  const date = utcDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
}

function money(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

function BookingCard({ booking, onStatus, onSaveFollowUp, onSaveFinancials, onRetryNotification }) {
  const [notes, setNotes] = useState(booking.internalNotes || "");
  const [followUp, setFollowUp] = useState(indianDateTime(booking.followUpUtc));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [agreedAmount, setAgreedAmount] = useState(booking.agreedAmount?.toString() ?? "");
  const [amountReceived, setAmountReceived] = useState(booking.amountReceived?.toString() ?? "0");
  const [currency, setCurrency] = useState(booking.currency || "INR");
  const [financialMessage, setFinancialMessage] = useState("");
  const [savingFinancials, setSavingFinancials] = useState(false);
  const [editingAmounts, setEditingAmounts] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const latestMessage = [...(booking.notifications || [])].sort((a, b) =>
    (utcDate(b.createdUtc)?.getTime() || 0) - (utcDate(a.createdUtc)?.getTime() || 0))[0];

  function cancelAmounts() {
    setAgreedAmount(booking.agreedAmount?.toString() ?? "");
    setAmountReceived(booking.amountReceived?.toString() ?? "0");
    setCurrency(booking.currency || "INR");
    setFinancialMessage("");
    setEditingAmounts(false);
  }

  function cancelFollowUp() {
    setNotes(booking.internalNotes || "");
    setFollowUp(indianDateTime(booking.followUpUtc));
    setSaveMessage("");
    setEditingFollowUp(false);
  }

  useEffect(() => {
    setNotes(booking.internalNotes || "");
    setFollowUp(indianDateTime(booking.followUpUtc));
  }, [booking.internalNotes, booking.followUpUtc]);

  useEffect(() => {
    setAgreedAmount(booking.agreedAmount?.toString() ?? "");
    setAmountReceived(booking.amountReceived?.toString() ?? "0");
    setCurrency(booking.currency || "INR");
  }, [booking.agreedAmount, booking.amountReceived, booking.currency]);

  async function saveFinancials(event) {
    event.preventDefault();
    const agreed = agreedAmount === "" ? null : Number(agreedAmount);
    const received = Number(amountReceived);
    if ((agreed !== null && (!Number.isFinite(agreed) || agreed < 0)) || !Number.isFinite(received) || received < 0 || (agreed === null && received !== 0) || (agreed !== null && received > agreed)) {
      setFinancialMessage("Enter a valid agreed amount and a received total no greater than it.");
      return;
    }
    setSavingFinancials(true);
    try {
      const saved = await onSaveFinancials(booking.id, { agreedAmount: agreed, amountReceived: received, currency });
      setFinancialMessage(saved ? "Amounts saved." : "Amounts were not saved.");
      if (saved) setEditingAmounts(false);
    } finally {
      setSavingFinancials(false);
    }
  }

  async function saveFollowUp(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await onSaveFollowUp(booking.id, {
        internalNotes: notes || null,
        followUpUtc: followUp ? new Date(`${followUp}:00+05:30`).toISOString() : null,
      });
      setSaveMessage(saved ? "Follow-up saved." : "Follow-up was not saved.");
      if (saved) setEditingFollowUp(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="booking-card">
      <div className="booking-details">
        <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
        <h2>{booking.clientName}</h2>
        <a href={`mailto:${booking.clientEmail}`}>{booking.clientEmail}</a>
        {booking.clientPhone && <p>WhatsApp: {booking.clientPhone}{booking.whatsAppOptIn ? " · Opted in" : " · No consent"}</p>}
        <p>Event date: {new Date(`${booking.eventDate}T00:00:00`).toLocaleDateString()}</p>
        <details className="booking-accordion">
          <summary>View booking details and follow-ups</summary>
          <div className="booking-accordion-content">
            {booking.packageName && <p>Package: {booking.packageName}</p>}
            {booking.message && <blockquote>{booking.message}</blockquote>}

        <section className="booking-summary-section">
          <div className="booking-section-heading">
            <h3>Booking amount</h3>
            {!editingAmounts && <button type="button" className="booking-section-action" onClick={() => { setFinancialMessage(""); setEditingAmounts(true); }}>Update amount</button>}
          </div>
          {!editingAmounts ? <>
            <dl className="booking-amount-summary">
              <div><dt>Agreed amount</dt><dd>{booking.agreedAmount == null ? "Not agreed yet" : money(booking.agreedAmount, booking.currency || "INR")}</dd></div>
              <div><dt>Received to date</dt><dd>{booking.amountReceived == null ? "Not recorded" : money(booking.amountReceived, booking.currency || "INR")}</dd></div>
            </dl>
            {booking.pendingAmount != null && <p className="amount-pending booking-balance">Pending to collect: {money(booking.pendingAmount, booking.currency || "INR")}</p>}
          </> : <form className="follow-up-form" onSubmit={saveFinancials}>
          <p>Record the price agreed with this customer and the total received so far. Package price is only a starting point.</p>
          <label>Agreed amount
            <input type="number" min="0" max="9999999999.99" step="0.01" value={agreedAmount} onChange={(event) => { setAgreedAmount(event.target.value); setFinancialMessage(""); }} placeholder="Not agreed yet" />
          </label>
          <label>Amount received to date
            <input type="number" min="0" max="9999999999.99" step="0.01" value={amountReceived} onChange={(event) => { setAmountReceived(event.target.value); setFinancialMessage(""); }} required />
          </label>
          <label>Currency
            <input value={currency} maxLength="3" pattern="[A-Z]{3}" onChange={(event) => { setCurrency(event.target.value.toUpperCase()); setFinancialMessage(""); }} required />
          </label>
          {booking.status === "Confirmed" && <p className="amount-pending">Pending to collect: {booking.pendingAmount === null ? "Set agreed amount" : money(booking.pendingAmount, booking.currency)}</p>}
          <button type="submit" className="text-button" disabled={savingFinancials}>{savingFinancials ? "Saving…" : "Save amounts"}</button>
          <button type="button" className="text-button" disabled={savingFinancials} onClick={cancelAmounts}>Cancel</button>
        </form>}
        {financialMessage && <p role="status">{financialMessage}</p>}
        </section>

        <section className="booking-summary-section">
          <div className="booking-section-heading">
            <h3>Follow-up</h3>
            {!editingFollowUp && <button type="button" className="booking-section-action" onClick={() => { setSaveMessage(""); setEditingFollowUp(true); }}>Manage follow-ups</button>}
          </div>
          {!editingFollowUp ? <div className="booking-follow-up-summary">
            <p><strong>Next follow-up (IST)</strong><br />{indianDateTime(booking.followUpUtc) ? utcDate(booking.followUpUtc).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "No follow-up scheduled."}</p>
            <p className="booking-private-notes"><strong>Private notes</strong><br />{booking.internalNotes || "No notes added."}</p>
          </div> : <form className="follow-up-form" onSubmit={saveFollowUp}>
          <label>Next follow-up (IST)
            <input type="datetime-local" value={followUp} onChange={(event) => { setFollowUp(event.target.value); setSaveMessage(""); }} />
          </label>
          <label>Private notes
            <textarea rows="3" maxLength="4000" value={notes} onChange={(event) => { setNotes(event.target.value); setSaveMessage(""); }} placeholder="Call outcome, next steps, or questions to ask" />
          </label>
          <button type="submit" className="text-button" disabled={saving}>{saving ? "Saving…" : "Save follow-up"}</button>
          <button type="button" className="text-button" disabled={saving} onClick={cancelFollowUp}>Cancel</button>
        </form>}
        {saveMessage && <p role="status">{saveMessage}</p>}
        </section>

        <section className="booking-summary-section notification-history">
          <div className="booking-section-heading">
            <h3>Message history</h3>
            {!!booking.notifications?.length && <button type="button" className="booking-section-action" aria-expanded={showMessages} onClick={() => setShowMessages(!showMessages)}>{showMessages ? "Close history" : "View messages"}</button>}
          </div>
          {!showMessages && latestMessage && <p>Latest: {latestMessage.channel} · {latestMessage.eventType.replace(/([a-z])([A-Z])/g, "$1 $2")} · {latestMessage.status}</p>}
          {!showMessages ? <p>{booking.notifications?.length ? `${booking.notifications.length} message${booking.notifications.length === 1 ? "" : "s"}${booking.notifications.some((item) => item.status === "Failed") ? ` · ${booking.notifications.filter((item) => item.status === "Failed").length} failed` : ""}` : "No messages queued."}</p> : booking.notifications?.length ? booking.notifications.map((item) => (
            <p key={item.id}>
              <span>{item.channel}</span> · {item.eventType.replace(/([a-z])([A-Z])/g, "$1 $2")} · {item.status}
              {item.lastError && <small> — {item.lastError}</small>}
              {item.status === "Failed" && item.eventType !== "Accepted" && <button className="text-button" onClick={() => onRetryNotification(booking.id, item.id)}>Retry</button>}
            </p>
          )) : <p>No messages queued.</p>}
        </section>
        <div className="card-actions">
          {booking.status === "Pending" && <>
            <button onClick={() => onStatus(booking.id, "Confirmed")}>Confirm booking</button>
            <button className="reject" onClick={() => onStatus(booking.id, "Rejected")}>Decline</button>
          </>}
          {booking.status === "Accepted" &&
            <button onClick={() => onStatus(booking.id, "Confirmed")}>Confirm booking</button>}
        </div>
          </div>
        </details>
      </div>
    </article>
  );
}

export function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [activeFilter, setActiveFilter] = useState("all");
  const [eventDates, setEventDates] = useState({ mode: "range", start: "", end: "" });
  const scheduledFollowUps = bookings.filter((booking) => {
    const date = utcDate(booking.followUpUtc);
    return date && !Number.isNaN(date.getTime());
  });
  const followUpsDue = scheduledFollowUps.filter((booking) =>
    utcDate(booking.followUpUtc).getTime() <= now).length;
  const confirmedUnpriced = bookings.filter((booking) => booking.status === "Confirmed" && booking.agreedAmount === null).length;
  const paymentPending = bookings.filter((booking) => booking.status === "Confirmed" && booking.pendingAmount > 0);
  const outstandingByCurrency = paymentPending.reduce((totals, booking) => {
    totals[booking.currency] = (totals[booking.currency] || 0) + booking.pendingAmount;
    return totals;
  }, {});
  const filterOptions = [
    { id: "all", label: "All enquiries", count: bookings.length },
    { id: "pending", label: "New enquiries", count: bookings.filter((booking) => booking.status === "Pending").length },
    { id: "confirmed", label: "Confirmed", count: bookings.filter((booking) => booking.status === "Confirmed").length },
    { id: "payment-pending", label: "Payment pending", count: paymentPending.length },
    { id: "rejected", label: "Declined", count: bookings.filter((booking) => booking.status === "Rejected").length },
  ];
  const visibleBookings = bookings.filter((booking) => matchesBookingFilters(booking, {
    enquiry: ["due", "upcoming"].includes(activeFilter) ? "all" : activeFilter,
    followUp: ["due", "upcoming"].includes(activeFilter) ? activeFilter : "all",
    ...eventDates,
  }, now));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function load() {
    const { data } = await api.get("/admin/bookings");
    setBookings(data);
    return data;
  }

  useEffect(() => {
    load().catch(() => setError("Unable to load booking inquiries."));
  }, []);

  async function setStatus(id, status) {
    setError("");
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      await load();
    } catch (exception) {
      setError(exception.response?.data?.message || "Unable to update this booking.");
    }
  }

  async function saveFollowUp(id, details) {
    setError("");
    try {
      await api.patch(`/admin/bookings/${id}/follow-up`, details);
    } catch (exception) {
      setError(exception.response?.data?.message || "Unable to save follow-up details.");
      return false;
    }
    try {
      const refreshed = await load();
      const saved = refreshed.find((booking) => booking.id === id);
      const actual = utcDate(saved?.followUpUtc)?.getTime() ?? null;
      const expected = details.followUpUtc ? new Date(details.followUpUtc).getTime() : null;
      if (actual !== expected) {
        setError("The API did not return the saved follow-up time. Please check the running API version.");
        return false;
      }
      return true;
    } catch {
      setError("Follow-up saved, but the booking list could not refresh.");
      setBookings((items) => items.map((item) => item.id === id ? { ...item, ...details } : item));
      return true;
    }
  }

  async function saveFinancials(id, details) {
    setError("");
    try {
      await api.patch(`/admin/bookings/${id}/financials`, details);
      await load();
      return true;
    } catch (exception) {
      setError(exception.response?.data?.message || "Unable to save booking amounts.");
      return false;
    }
  }

  async function retryNotification(bookingId, notificationId) {
    setError("");
    try {
      await api.post(`/admin/bookings/${bookingId}/notifications/${notificationId}/retry`);
      await load();
    } catch (exception) {
      setError(exception.response?.data?.message || "Unable to retry this message.");
    }
  }

  return (
    <main className="dashboard">
      <AdminNav />
      <section>
        <p className="eyebrow dark">Studio dashboard</p>
        <h1>Booking enquiries</h1>
        <p className="manager-intro">Review inquiries, plan your next contact, and track customer messages.</p>
        <div className="booking-filters" role="group" aria-label="Filter booking enquiries">
          <label className="booking-filter-label">Enquiries &amp; follow-ups
            <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
              <option value="all">All enquiries ({bookings.length})</option>
              <optgroup label="Enquiries">
                {filterOptions.filter((option) => option.id !== "all").map((option) => <option key={option.id} value={option.id}>{option.label} ({option.count})</option>)}
              </optgroup>
              <optgroup label="Follow-ups">
                <option value="due">Follow-ups due ({followUpsDue})</option>
                <option value="upcoming">Upcoming follow-ups ({scheduledFollowUps.length - followUpsDue})</option>
              </optgroup>
            </select>
          </label>
          <EventDateFilter value={eventDates} onChange={setEventDates} />
        </div>
        <div className="booking-filter-results">
          <p role="status">{visibleBookings.length} event{visibleBookings.length === 1 ? "" : "s"}{eventDates.start ? ` · ${formatEventDate(eventDates.start)}${eventDates.end && eventDates.end !== eventDates.start ? ` – ${formatEventDate(eventDates.end)}` : ""}` : ""}</p>
          <button type="button" className="text-button" onClick={() => {
            setActiveFilter("all"); setEventDates({ mode: "range", start: "", end: "" });
          }}>Clear filters</button>
        </div>
        <p className="payment-summary">Confirmed balances to collect: {Object.entries(outstandingByCurrency).length ? Object.entries(outstandingByCurrency).map(([code, amount]) => money(amount, code)).join(" · ") : money(0)}{confirmedUnpriced > 0 ? ` · ${confirmedUnpriced} confirmed booking${confirmedUnpriced === 1 ? "" : "s"} missing an agreed amount` : ""}</p>
        <button className="text-button" onClick={() => load().catch(() => setError("Unable to refresh inquiries."))}>Refresh messages</button>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="booking-list">
          {visibleBookings.length === 0
            ? <p className="empty">{bookings.length === 0 ? "No booking enquiries yet." : "No events match these filters. Change the dates or clear your filters."}</p>
            : visibleBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onStatus={setStatus} onSaveFollowUp={saveFollowUp} onSaveFinancials={saveFinancials} onRetryNotification={retryNotification} />
            ))}
        </div>
      </section>
    </main>
  );
}

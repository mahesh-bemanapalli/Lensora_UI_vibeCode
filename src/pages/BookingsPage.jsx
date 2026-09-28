import { useEffect, useState } from "react";
import api from "../lib/api";
import { AdminNav } from "../components/AdminNav";

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

        <form className="follow-up-form" onSubmit={saveFinancials}>
          <h3>Booking amount</h3>
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
          {financialMessage && <p role="status">{financialMessage}</p>}
        </form>

        <form className="follow-up-form" onSubmit={saveFollowUp}>
          <h3>Follow-up</h3>
          <label>Next follow-up (IST)
            <input type="datetime-local" value={followUp} onChange={(event) => { setFollowUp(event.target.value); setSaveMessage(""); }} />
          </label>
          <label>Private notes
            <textarea rows="3" maxLength="4000" value={notes} onChange={(event) => { setNotes(event.target.value); setSaveMessage(""); }} placeholder="Call outcome, next steps, or questions to ask" />
          </label>
          <button type="submit" className="text-button" disabled={saving}>{saving ? "Saving…" : "Save follow-up"}</button>
          {saveMessage && <p role="status">{saveMessage}</p>}
        </form>

        <div className="notification-history">
          <h3>Message history</h3>
          {booking.notifications?.length ? booking.notifications.map((item) => (
            <p key={item.id}>
              <span>{item.channel}</span> · {item.eventType.replace(/([a-z])([A-Z])/g, "$1 $2")} · {item.status}
              {item.lastError && <small> — {item.lastError}</small>}
              {item.status === "Failed" && <button className="text-button" onClick={() => onRetryNotification(booking.id, item.id)}>Retry</button>}
            </p>
          )) : <p>No messages queued.</p>}
        </div>
        <div className="card-actions">
          {booking.status === "Pending" && <>
            <button onClick={() => onStatus(booking.id, "Accepted")}>Accept inquiry</button>
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
    { id: "all", label: "All inquiries", count: bookings.length },
    { id: "pending", label: "New inquiries", count: bookings.filter((booking) => booking.status === "Pending").length },
    { id: "accepted", label: "Accepted", count: bookings.filter((booking) => booking.status === "Accepted").length },
    { id: "confirmed", label: "Confirmed", count: bookings.filter((booking) => booking.status === "Confirmed").length },
    { id: "payment-pending", label: "Payment pending", count: paymentPending.length },
    { id: "rejected", label: "Declined", count: bookings.filter((booking) => booking.status === "Rejected").length },
    { id: "due", label: "Follow-ups due", count: followUpsDue },
    { id: "upcoming", label: "Upcoming follow-ups", count: scheduledFollowUps.length - followUpsDue },
  ];
  const visibleBookings = bookings.filter((booking) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "payment-pending") return booking.status === "Confirmed" && booking.pendingAmount > 0;
    if (activeFilter === "due" || activeFilter === "upcoming") {
      const date = utcDate(booking.followUpUtc);
      if (!date || Number.isNaN(date.getTime())) return false;
      return activeFilter === "due" ? date.getTime() <= now : date.getTime() > now;
    }
    return booking.status.toLowerCase() === activeFilter;
  });

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
        <h1>Booking inquiries</h1>
        <p className="manager-intro">Review inquiries, plan your next contact, and track customer messages.</p>
        <nav className="crm-summary" aria-label="Filter booking inquiries">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="crm-filter"
              aria-pressed={activeFilter === option.id}
              onClick={() => setActiveFilter(option.id)}
            >
              <strong>{option.count}</strong> {option.label}
            </button>
          ))}
        </nav>
        <p className="payment-summary">Confirmed balances to collect: {Object.entries(outstandingByCurrency).length ? Object.entries(outstandingByCurrency).map(([code, amount]) => money(amount, code)).join(" · ") : money(0)}{confirmedUnpriced > 0 ? ` · ${confirmedUnpriced} confirmed booking${confirmedUnpriced === 1 ? "" : "s"} missing an agreed amount` : ""}</p>
        <button className="text-button" onClick={() => load().catch(() => setError("Unable to refresh inquiries."))}>Refresh messages</button>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="booking-list">
          {visibleBookings.length === 0
            ? <p className="empty">{bookings.length === 0 ? "No booking inquiries yet." : `No ${filterOptions.find((option) => option.id === activeFilter)?.label.toLowerCase()} to show.`}</p>
            : visibleBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onStatus={setStatus} onSaveFollowUp={saveFollowUp} onSaveFinancials={saveFinancials} onRetryNotification={retryNotification} />
            ))}
        </div>
      </section>
    </main>
  );
}

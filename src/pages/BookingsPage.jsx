import { useEffect, useState } from "react";
import api from "../lib/api";
import { AdminNav } from "../components/AdminNav";

export function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/admin/bookings")
      .then(({ data }) => setBookings(data))
      .catch(() => setError("Unable to load bookings."));
  }, []);
  async function setStatus(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      setBookings((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch {
      setError("Unable to update this booking.");
    }
  }
  return (
    <main className="dashboard">
      <AdminNav />
      <section>
        <p className="eyebrow dark">Studio dashboard</p>
        <h1>Booking inquiries</h1>
        {error && <p className="form-error">{error}</p>}
        <div className="booking-list">
          {bookings.length === 0 ? (
            <p className="empty">No booking inquiries yet.</p>
          ) : (
            bookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div>
                  <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  <h2>{booking.clientName}</h2>
                  <a href={`mailto:${booking.clientEmail}`}>{booking.clientEmail}</a>
                  {booking.packageName && <p>Package: {booking.packageName}</p>}
                  <p>
                    Event date: {new Date(`${booking.eventDate}T00:00:00`).toLocaleDateString()}
                  </p>
                  {booking.message && <blockquote>{booking.message}</blockquote>}
                </div>
                {booking.status === "Pending" && (
                  <div className="card-actions">
                    <button onClick={() => setStatus(booking.id, "Accepted")}>Accept</button>
                    <button className="reject" onClick={() => setStatus(booking.id, "Rejected")}>
                      Decline
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

// Shared presentation; the page controller supplies booking state and actions.
export function BookingForm({ packages, booking }) {
  const { submitBooking, sending, bookingError, selectedPackageId, setSelectedPackageId, bookingStatus } = booking;
  return (
        <form onSubmit={submitBooking}>
          {packages?.length > 0 && (
            <label>
              Package
              <select value={selectedPackageId} onChange={(event) => setSelectedPackageId(event.target.value)}>
                <option value="">General inquiry</option>
                {packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          )}
          <label>
            Your name
            <input name="name" required maxLength="120" />
          </label>
          <label>
            Email address
            <input name="email" type="email" required />
          </label>
          <label>
            WhatsApp number (optional, with country code)
            <input name="phone" type="tel" placeholder="+919876543210" pattern="\+[1-9][0-9]{7,14}" />
          </label>
          <label className="booking-opt-in">
            <input name="whatsappOptIn" type="checkbox" />
            I agree to receive updates about this inquiry on WhatsApp at the number above.
          </label>
          <label>
            Event date
            <input name="date" type="date" required />
          </label>
          <label>
            Tell me more
            <textarea name="message" rows="4" maxLength="2000" />
          </label>
          <button className="button light" disabled={sending}>
            {sending ? "Sending…" : "Send inquiry"}
          </button>
          {bookingStatus === "booked" && (
            <p className="form-success">Thank you — your inquiry has been sent.</p>
          )}
          {bookingStatus === "booking-error" && (
            <p className="form-error" role="alert">{bookingError}</p>
          )}
        </form>
  );
}

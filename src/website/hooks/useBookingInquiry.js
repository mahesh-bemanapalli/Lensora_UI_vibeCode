import { useState } from "react";
import api from "../../lib/api";

export function useBookingInquiry(slug) {
  const [sending, setSending] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [bookingStatus, setBookingStatus] = useState("idle");
  async function submitBooking(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSending(true);
    setBookingError("");
    try {
      await api.post(`/photographers/${slug}/bookings`, {
        clientName: fields.get("name"),
        clientEmail: fields.get("email"),
        eventDate: fields.get("date"),
        message: fields.get("message") || null,
        packageId: selectedPackageId ? Number(selectedPackageId) : null,
        clientPhone: fields.get("phone") || null,
        whatsAppOptIn: fields.get("whatsappOptIn") === "on",
      });
      form.reset();
      setSelectedPackageId("");
      setBookingStatus("booked");
    } catch (error) {
      console.error("Unable to send booking inquiry.", error);
      setBookingError(
        error.response?.data?.message || "We could not send this inquiry. Please try again.",
      );
      setBookingStatus("booking-error");
    } finally {
      setSending(false);
    }
  }
  return { submitBooking, sending, bookingError, selectedPackageId, setSelectedPackageId, bookingStatus };
}

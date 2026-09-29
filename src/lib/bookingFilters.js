export function matchesBookingFilters(booking, { enquiry = "all", followUp = "all", start = "", end = "" }, now = Date.now()) {
  if (enquiry === "payment-pending") {
    if (booking.status !== "Confirmed" || !(booking.pendingAmount > 0)) return false;
  } else if (enquiry !== "all" && booking.status.toLowerCase() !== enquiry) return false;
  if (followUp !== "all") {
    const value = booking.followUpUtc;
    const time = value ? new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`).getTime() : NaN;
    if (!Number.isFinite(time) || (followUp === "due" ? time > now : time <= now)) return false;
  }
  // Event dates are calendar dates, not instants: avoid timezone conversion.
  return !start || (booking.eventDate >= start && booking.eventDate <= (end || start));
}

export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatEventDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function selectEventDate(draft, day) {
  if (draft.mode === "single") return { ...draft, start: day, end: day };
  if (!draft.start || draft.end) return { ...draft, start: day, end: "" };
  return { ...draft, start: day < draft.start ? day : draft.start, end: day < draft.start ? draft.start : day };
}

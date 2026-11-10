// Session-storage helpers for the booking flow and intake prefill.
const BOOKING_KEY = "ax-booking-v1";
const PREFILL_KEY = "ax-intake-prefill";

export function loadBooking() {
  try {
    const v = sessionStorage.getItem(BOOKING_KEY);
    return v ? JSON.parse(v) : {};
  } catch {
    return {};
  }
}

export function saveBooking(data) {
  try {
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearBooking() {
  try {
    sessionStorage.removeItem(BOOKING_KEY);
  } catch {
    /* ignore */
  }
}

export function setIntakePrefill(data) {
  try {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function takeIntakePrefill() {
  try {
    const v = sessionStorage.getItem(PREFILL_KEY);
    if (!v) return null;
    sessionStorage.removeItem(PREFILL_KEY);
    return JSON.parse(v);
  } catch {
    return null;
  }
}

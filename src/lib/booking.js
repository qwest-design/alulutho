// Booking availability rules — edit these to change the practice's bookable hours.
export const schedule = {
  timeZone: "Africa/Johannesburg",
  workingDays: [1, 2, 3, 4, 5], // Mon–Fri (ISO: 1 = Monday, 7 = Sunday)
  dayStart: "08:00",
  dayEnd: "17:00",
  lunchStart: "13:00",
  lunchEnd: "14:00",
  sessionMinutes: 60,
  slotStepMinutes: 60,
  minNoticeHours: 24,
  bookingWindowWeeks: 8,
  publicHolidays: [
    "2026-01-01", "2026-04-03", "2026-04-06", "2026-04-27", "2026-05-01", "2026-06-16", "2026-08-10",
    "2026-09-24", "2026-12-16", "2026-12-25", "2026-12-26", "2027-01-01", "2027-03-22", "2027-03-26",
    "2027-03-29", "2027-04-27", "2027-06-16", "2027-08-09", "2027-09-24", "2027-12-16", "2027-12-27",
  ],
  blockedDates: [],
};

const SAST_OFFSET = 2 * 60 * 60 * 1000; // SAST is UTC+2 all year
const pad = (n) => String(n).padStart(2, "0");

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function sastDate(ms) {
  const d = new Date(ms + SAST_OFFSET);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const parseDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return { y: y ?? 1970, m: m ?? 1, d: d ?? 1 };
};

const sastMs = (date, minutes) => {
  const { y, m, d } = parseDate(date);
  return Date.UTC(y, m - 1, d, 0, minutes) - SAST_OFFSET;
};

const sastIso = (ms) => {
  const d = new Date(ms + SAST_OFFSET);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes(),
  )}:00+02:00`;
};

const isoWeekday = (date) => {
  const { y, m, d } = parseDate(date);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return w === 0 ? 7 : w;
};

export function addDays(date, n) {
  const { y, m, d } = parseDate(date);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function bookingWindow(now, s = schedule) {
  const earliestMs = now + s.minNoticeHours * 36e5;
  return { first: sastDate(earliestMs), last: addDays(sastDate(now), s.bookingWindowWeeks * 7), earliestMs };
}

const isClosed = (date, s) =>
  !s.workingDays.includes(isoWeekday(date)) || s.publicHolidays.includes(date) || s.blockedDates.includes(date);

function daySlots(date, s) {
  if (isClosed(date, s)) return [];
  const start = toMinutes(s.dayStart);
  const end = toMinutes(s.dayEnd);
  const lunchS = toMinutes(s.lunchStart);
  const lunchE = toMinutes(s.lunchEnd);
  const out = [];
  for (let t = start; t + s.sessionMinutes <= end; t += s.slotStepMinutes) {
    if (t < lunchE && t + s.sessionMinutes > lunchS) continue;
    const ms = sastMs(date, t);
    out.push({
      start: sastIso(ms),
      ms,
      label: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`,
      period: t < 720 ? "morning" : "afternoon",
    });
  }
  return out;
}

/** Bookable slots for a date, excluding taken slots (a Set of epoch ms). */
export function availableSlots(date, now, taken = new Set(), s = schedule) {
  const { first, last, earliestMs } = bookingWindow(now, s);
  if (date < first || date > last) return [];
  return daySlots(date, s).filter((slot) => slot.ms >= earliestMs && !taken.has(slot.ms));
}

const longDate = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date) {
  const { y, m, d } = parseDate(date);
  return longDate.format(new Date(Date.UTC(y, m - 1, d))).replace(",", "");
}

/* --------- Slots this browser has already requested (prevents double requests) --------- */
const TAKEN_KEY = "ax-requested-slots";

export function loadTakenSlots() {
  try {
    const list = JSON.parse(localStorage.getItem(TAKEN_KEY) || "[]");
    return new Set(list.map((s) => Date.parse(s)).filter((n) => !Number.isNaN(n)));
  } catch {
    return new Set();
  }
}

export function rememberTakenSlot(iso) {
  try {
    const list = JSON.parse(localStorage.getItem(TAKEN_KEY) || "[]");
    if (!list.includes(iso)) list.push(iso);
    localStorage.setItem(TAKEN_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/* --------- Calendar (.ics) --------- */
const icsTime = (ms) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}00Z`;
};
const icsEscape = (s) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export function buildIcs({ uid, startMs, durationMinutes, title, description, location, nowMs }) {
  const end = startMs + durationMinutes * 6e4;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alulutho Xanywa Social Worker//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsTime(nowMs ?? Date.now())}`,
    `DTSTART:${icsTime(startMs)}`,
    `DTEND:${icsTime(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    ...(location ? [`LOCATION:${icsEscape(location)}`] : []),
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

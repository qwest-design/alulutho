/**
 * Form delivery via Web3Forms (https://web3forms.com).
 *
 * Every Contact, Booking and Intake submission is emailed to the address that
 * owns the Web3Forms access key. Set it in a `.env` file at the project root:
 *
 *   VITE_WEB3FORMS_KEY=your-access-key
 *
 * For local testing without sending anything, set VITE_FORMS_DEMO=true — submissions
 * then succeed instantly and are only logged to the browser console.
 */
const ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const DEMO = import.meta.env.VITE_FORMS_DEMO === "true";

const RATE_KEY = "ax-submit-log";
const RATE_LIMIT = 5; // per form kind, per hour, per browser
const MIN_FILL_MS = 2500; // bots fill forms instantly

function rateLimited(kind) {
  try {
    const now = Date.now();
    const log = JSON.parse(localStorage.getItem(RATE_KEY) || "{}");
    const recent = (log[kind] || []).filter((t) => now - t < 36e5);
    if (recent.length >= RATE_LIMIT) return true;
    log[kind] = [...recent, now];
    localStorage.setItem(RATE_KEY, JSON.stringify(log));
  } catch {
    /* storage unavailable — skip the limit */
  }
  return false;
}

/** Short, human-friendly reference such as "AX-B7K2QM". */
export function makeReference(prefix = "AX") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

function flatten(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);
  }
  return out;
}

/**
 * Sends a submission. Returns { ok: true, reference } or { ok: false, reason }.
 * `honeypot` and `formLoadedAt` provide light spam protection.
 */
export async function submitForm({ kind, subject, replyTo, fromName, fields, honeypot, formLoadedAt, reference }) {
  const ref = reference || makeReference();
  if (honeypot) return { ok: true, reference: ref, emailFailed: false }; // silently drop bots
  if (formLoadedAt && Date.now() - formLoadedAt < MIN_FILL_MS) return { ok: false, reason: "too_fast" };
  if (rateLimited(kind)) return { ok: false, reason: "rate_limited" };

  const payload = {
    subject: `${subject} · ${ref}`,
    from_name: fromName || "Alulutho Xanywa website",
    ...(replyTo ? { replyto: replyTo, email: replyTo } : {}),
    Reference: ref,
    "Form type": kind,
    ...flatten(fields),
  };

  if (DEMO) {
    console.info("[forms demo] submission not sent:", payload);
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, reference: ref, emailFailed: false };
  }

  if (!ACCESS_KEY) {
    console.error("VITE_WEB3FORMS_KEY is not set — add it to .env so forms can be delivered.");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: ACCESS_KEY, botcheck: "", ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok || !data.success) return { ok: false, reason: "failed" };
    return { ok: true, reference: ref, emailFailed: false };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

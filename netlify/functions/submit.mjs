/**
 * Netlify Function: emails Contact, Booking and Intake submissions through Resend.
 *
 * Endpoint: POST /.netlify/functions/submit
 *
 * Environment variables (Netlify → Project configuration → Environment variables):
 *   RESEND_API_KEY  re_…  (secret — never put it in the website code)
 *   FORMS_TO        bookings@aluluthoinpractice.co.za   (comma-separate for several)
 *   FORMS_FROM      Alulutho Xanywa Website <website@aluluthoinpractice.co.za>
 */

const KINDS = new Set(["Contact", "Booking request", "Client intake"]);
const MAX_BODY = 64 * 1024; // bytes
const MAX_FIELDS = 120;
const MAX_VALUE = 5000; // characters per field
const EMAIL_RE = /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const clean = (v, max = MAX_VALUE) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

// Subjects and names go into email headers, so strip line breaks.
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, " ");

function renderHtml(title, rows) {
  const body = rows
    .map(
      ([k, v]) => `<tr>
  <td style="padding:10px 16px 10px 0;vertical-align:top;color:#6b6457;font-size:14px;white-space:nowrap;border-bottom:1px solid #ece6da">${escapeHtml(k)}</td>
  <td style="padding:10px 0;vertical-align:top;color:#1c2a4a;font-size:15px;border-bottom:1px solid #ece6da;white-space:pre-wrap">${escapeHtml(v)}</td>
</tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f7f3ec;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:32px 20px">
  <p style="margin:0 0 4px;color:#a8873f;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Alulutho Xanywa · Website</p>
  <h1 style="margin:0 0 24px;color:#1c2a4a;font-size:22px;font-weight:600">${escapeHtml(title)}</h1>
  <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;padding:8px 20px">${body}</table>
  <p style="margin:20px 0 0;color:#6b6457;font-size:13px">Reply to this email to answer the client directly.</p>
</div></body></html>`;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, reason: "method_not_allowed" });

  // Only accept posts from the site itself (same host), e.g. aluluthoinpractice.co.za or a deploy preview.
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(req.url).host) return json(403, { ok: false, reason: "forbidden" });
    } catch {
      return json(403, { ok: false, reason: "forbidden" });
    }
  }

  const { RESEND_API_KEY, FORMS_TO, FORMS_FROM } = process.env;
  if (!RESEND_API_KEY || !FORMS_TO || !FORMS_FROM) {
    console.error("Missing RESEND_API_KEY, FORMS_TO or FORMS_FROM environment variable.");
    return json(500, { ok: false, reason: "not_configured" });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, reason: "too_large" });

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, reason: "bad_request" });
  }

  const { kind, subject, replyTo, fromName, reference, fields, botcheck } = data || {};
  if (botcheck) return json(200, { ok: true }); // honeypot filled in: pretend success, send nothing
  if (!KINDS.has(kind) || !fields || typeof fields !== "object" || Array.isArray(fields)) {
    return json(400, { ok: false, reason: "bad_request" });
  }

  const entries = Object.entries(fields).slice(0, MAX_FIELDS);
  const rows = [
    ["Reference", oneLine(reference, 40)],
    ["Form", kind],
    ...entries.map(([k, v]) => [oneLine(k, 120), clean(v)]).filter(([, v]) => v !== ""),
  ].filter(([, v]) => v !== "");

  const subjectLine = `${oneLine(subject, 180) || kind}${reference ? ` · ${oneLine(reference, 40)}` : ""}`;
  const reply = oneLine(replyTo, 254);
  const senderName = oneLine(fromName, 80);

  const payload = {
    from: FORMS_FROM,
    to: FORMS_TO.split(",").map((s) => s.trim()).filter(Boolean),
    subject: subjectLine,
    html: renderHtml(subjectLine, rows),
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    ...(EMAIL_RE.test(reply) ? { reply_to: senderName ? `${senderName.replace(/[<>"]/g, "")} <${reply}>` : reply } : {}),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 429) return json(429, { ok: false, reason: "rate_limited" });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return json(502, { ok: false, reason: "failed" });
    }
    const out = await res.json().catch(() => ({}));
    return json(200, { ok: true, id: out.id });
  } catch (err) {
    console.error("Resend request failed", err);
    return json(502, { ok: false, reason: "failed" });
  }
};

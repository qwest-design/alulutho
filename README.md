# Alulutho Xanywa — Social Worker website

React + Vite + Tailwind CSS v4 rebuild of the practice website: 13 pages, booking flow,
client intake form and contact form.

## Run it

Node.js is installed in `~/.local/node` (no admin rights needed). In a terminal:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm install
npm run dev       # http://localhost:5173
npm run build     # production files in dist/
```

## Make the forms send email

Contact, Booking and Intake submissions are posted to a Netlify Function
(`netlify/functions/submit.mjs`) that emails them through [Resend](https://resend.com) to
**bookings@aluluthoinpractice.co.za**, with Reply-To set to the client's email.

Set these in Netlify → Project configuration → Environment variables, then redeploy:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend API key (`re_…`) with sending access — keep it secret |
| `FORMS_TO` | `bookings@aluluthoinpractice.co.za` (comma-separate for several) |
| `FORMS_FROM` | `Alulutho Xanywa Website <website@aluluthoinpractice.co.za>` |

The domain must be verified in Resend (its DKIM/SPF records live in Netlify DNS).
Every sent email shows in Resend → Emails.

`npm run dev` has no function, so `.env.development` sets `VITE_FORMS_DEMO=true` and forms
succeed without sending. Use `netlify dev` to test real sending locally.

## Where to edit things

| What | File |
| --- | --- |
| Phone, email, address, registration numbers, banking details | `src/lib/site.js` |
| Services (titles, descriptions, lists) | `src/lib/services.js` |
| Bookable hours, lunch, notice period, holidays, blocked dates | `src/lib/booking.js` (`schedule`) |
| FAQ | `src/lib/site.js` (`faqs`) |
| Colours, fonts, animations | `src/index.css` |
| Logo and portrait | `src/assets/` |

Adding the practice's banking details in `site.js` makes them appear (with copy buttons) on the
intake form when "Cash / EFT" is chosen.

## Hosting

It's a static single-page app. `public/_redirects` (Netlify) and `vercel.json` (Vercel) route
every URL to `index.html` so links like `/services/caregiver-family-coaching` work on refresh.

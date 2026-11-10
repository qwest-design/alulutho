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

Contact, Booking and Intake submissions are emailed through [Web3Forms](https://web3forms.com):

1. Create a free access key at web3forms.com using **bookings@aluluthoinpractice.co.za**.
2. Copy `.env.example` to `.env` and paste the key into `VITE_WEB3FORMS_KEY=`.
3. Rebuild (`npm run build`) and redeploy.

`VITE_FORMS_DEMO=true` (set in `.env.local` for development) makes forms succeed without
sending anything — remove it or set it to `false` to send real emails locally.

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

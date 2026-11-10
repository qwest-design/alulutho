import { ArrowRight, Phone } from "lucide-react";
import { contactItems, credentials, crisisLines, navItems, site } from "../lib/site";
import { services } from "../lib/services";
import { AppLink } from "./AppLink";
import { Button } from "./Button";
import { FooterContactList, Logo } from "./Brand";
import { DrawnRule, Reveal, TextReveal } from "./Reveal";

const exploreLinks = [
  ...navItems,
  { to: "/book", label: "Book a Session" },
  { to: "/intake", label: "Client Intake" },
  { to: "/privacy", label: "Privacy & POPIA" },
];

function FooterCol({ title, children }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul>{children}</ul>
    </div>
  );
}

export function Footer() {
  const contacts = contactItems(site);
  const creds = credentials(site);
  const year = new Date().getFullYear();

  return (
    <footer className="on-navy bg-navy-900 relative overflow-hidden">
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        className="pointer-events-none absolute -top-40 -right-48 size-[560px] opacity-40 md:-right-24 md:size-[680px]"
      >
        <circle cx="300" cy="300" r="290" fill="none" className="stroke-gold-500" strokeWidth="1" />
        <circle cx="300" cy="300" r="262" fill="none" className="stroke-gold-500" strokeWidth="0.6" opacity="0.5" />
      </svg>
      <div className="container-site relative pt-[clamp(80px,10vw,140px)]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <TextReveal as="h2" parts={["Ready", { em: "when you are." }]} className="max-w-[20ch]" />
          <Reveal>
            <Button asChild variant="gold" size="lg">
              <AppLink to="/book">
                Book a Session
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
          </Reveal>
        </div>

        <DrawnRule className="mt-14 mb-14" />

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1.2fr_1.5fr_0.9fr] lg:gap-8">
          <div>
            <Logo size={96} />
            <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-ivory-soft">{site.tagline}</p>
          </div>
          <FooterCol title="Explore">
            {exploreLinks.map((l) => (
              <li key={l.to}>
                <AppLink to={l.to} className="footer-link">
                  {l.label}
                </AppLink>
              </li>
            ))}
          </FooterCol>
          <FooterCol title="Services">
            {services.map((s) => (
              <li key={s.slug}>
                <AppLink to={`/services/${s.slug}`} className="footer-link">
                  {s.title}
                </AppLink>
              </li>
            ))}
          </FooterCol>
          {contacts.length > 0 && (
            <FooterCol title="Contact">
              <FooterContactList items={contacts} />
            </FooterCol>
          )}
          {creds.length > 0 && (
            <FooterCol title="Credentials">
              {creds.map((c) => (
                <li key={c.label} className="py-1.5 text-base text-ivory-soft">
                  <span className="block text-[15px] text-ivory-soft">{c.label}</span>
                  <span className="font-semibold text-ivory">{c.value}</span>
                </li>
              ))}
            </FooterCol>
          )}
        </div>

        <div
          role="note"
          aria-label="Urgent help"
          className="mt-16 rounded-[var(--radius-panel)] border border-gold-500/50 bg-navy-800 p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-500/60 text-gold-500">
              <Phone className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <p className="text-base leading-relaxed text-ivory">
              <strong className="font-semibold text-gold-500">Need urgent help?</strong> This practice is not an
              emergency service. In an emergency call{" "}
              <a className="crisis-link" href={`tel:${crisisLines[0].tel}`}>
                {crisisLines[0].label}
              </a>
              , or{" "}
              <a className="crisis-link" href={`tel:${crisisLines[1].tel}`}>
                {crisisLines[1].label}
              </a>{" "}
              from a mobile. SADAG 24-hour Suicide Crisis Line:{" "}
              <a className="crisis-link" href={`tel:${crisisLines[2].tel}`}>
                {crisisLines[2].label}
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line-on-navy py-8 text-[15px] text-ivory-soft md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.practiceName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <AppLink to="/privacy" className="link-draw inline-flex min-h-11 items-center font-medium">
              Privacy &amp; POPIA
            </AppLink>
            <span>Website by Ikonic Designs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
